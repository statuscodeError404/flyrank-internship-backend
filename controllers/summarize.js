const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const asyncHandler = require('../Middleware/async');
const ErrorResponse = require('../utils/errorRespoonce');
const { prisma } = require('../config/db');
const summarySchema = require('../llm/summarySchema');

const PROMPT_VERSION = 'course-summary-v1';
const LLM_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const LOG_PATH = path.join(__dirname, '../logs/llm-calls.jsonl');
const QUARANTINE_PATH = path.join(__dirname, '../logs/quarantine.jsonl');

const systemPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/course-summary-v1.md'),
  'utf8'
);

function buildClient() {
  return new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    timeout: LLM_TIMEOUT_MS,
  });
}

function buildUserMessage(reviews) {
  const lines = reviews.map(
    (r, i) => `${i + 1}. [Rating: ${r.rating}/10] "${r.title}: ${r.text}"`
  );
  return `Here are ${reviews.length} student review(s) for this bootcamp:\n\n${lines.join('\n')}`;
}

function isRetryable(err) {
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') return true;
  const status = err.status || err.statusCode;
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

function getRetryDelay(err, attempt) {
  // Respect Retry-After header if present
  const retryAfter = err.headers?.['retry-after'];
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  // Exponential backoff with jitter: 1s, 2s base + random jitter
  const base = Math.pow(2, attempt) * 1000;
  const jitter = Math.random() * 1000;
  return base + jitter;
}

async function callModelWithRetry(client, messages, bootcampId) {
  const start = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        temperature: 0.2,
        messages,
      });

      const duration = Date.now() - start;
      const usage = response.usage || {};
      return {
        content: response.choices[0].message.content,
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        duration,
      };
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) break;
      const delay = getRetryDelay(err, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function parseAndValidate(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { success: false, error: 'No JSON object found in response' };

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { success: false, error: `JSON.parse failed: ${e.message}` };
  }

  const result = summarySchema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: result.error.message, raw: jsonMatch[0] };
  }

  return { success: true, data: result.data };
}

function logCall(entry) {
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  } catch (_) {
    // Don't crash on log failure
  }
}

async function generateSummary(reviews, bootcampId) {
  const client = buildClient();
  const userMessage = buildUserMessage(reviews);
  let repairNeeded = false;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalDuration = 0;

  // First attempt
  const firstResult = await callModelWithRetry(
    client,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    bootcampId
  );

  totalInputTokens += firstResult.inputTokens;
  totalOutputTokens += firstResult.outputTokens;
  totalDuration += firstResult.duration;

  let validation = parseAndValidate(firstResult.content);

  // Repair attempt on failure
  if (!validation.success) {
    repairNeeded = true;
    const repairMessage =
      `Your previous response failed validation.\n\nValidation error:\n${validation.error}\n\n` +
      `Your previous response:\n${firstResult.content}\n\n` +
      `Return corrected JSON only. No explanation, no code fences.`;

    const repairResult = await callModelWithRetry(
      client,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: repairMessage },
      ],
      bootcampId
    );

    totalInputTokens += repairResult.inputTokens;
    totalOutputTokens += repairResult.outputTokens;
    totalDuration += repairResult.duration;

    validation = parseAndValidate(repairResult.content);

    if (!validation.success) {
      const quarantineLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        bootcampId,
        reviewIds: reviews.map((r) => r.id),
        promptVersion: PROMPT_VERSION,
        error: validation.error,
        rawFirstAttempt: firstResult.content,
        rawRepairAttempt: repairResult.content,
      });
      try { fs.appendFileSync(QUARANTINE_PATH, quarantineLine + '\n'); } catch (_) {}

      logCall({
        timestamp: new Date().toISOString(),
        bootcampId,
        promptVersion: PROMPT_VERSION,
        model: process.env.LLM_MODEL,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        durationMs: totalDuration,
        repairNeeded: true,
        cacheHit: false,
        outcome: 'quarantined',
      });

      return null;
    }
  }

  logCall({
    timestamp: new Date().toISOString(),
    bootcampId,
    promptVersion: PROMPT_VERSION,
    model: process.env.LLM_MODEL,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    durationMs: totalDuration,
    repairNeeded,
    cacheHit: false,
    outcome: 'success',
  });

  return validation.data;
}

// @desc   Summarize all reviews for a bootcamp using an LLM
// @route  POST /api/v1/bootcamps/:id/summarize
// @access Public
exports.summarizeBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.id },
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with id of ${req.params.id}`, 404));
  }

  const reviews = await prisma.review.findMany({
    where: { bootcampId: req.params.id },
    select: { id: true, title: true, text: true, rating: true },
  });

  if (reviews.length === 0) {
    return res.status(422).json({
      success: false,
      error: 'This bootcamp has no reviews yet — nothing to summarize.',
    });
  }

  // LLM_STUB mode: skip model, return hard-coded schema-valid object
  if (process.env.LLM_STUB === 'true' || process.env.LLM_STUB === '1') {
    const stub = {
      overall_sentiment: 'positive',
      top_pros: ['Great curriculum', 'Supportive instructors', 'Hands-on projects'],
      top_cons: ['Fast-paced', 'Limited career support'],
      recommended_for: 'Beginners looking for a structured introduction to web development.',
      confidence: 0.9,
      review_count: reviews.length,
    };
    return res.status(200).json({ success: true, cached: false, data: stub });
  }

  // Kill switch: LLM_ENABLED=false → serve cached if available, else 503
  if (process.env.LLM_ENABLED === 'false') {
    const cached = await prisma.bootcampSummary.findUnique({
      where: { bootcampId: req.params.id },
    });

    if (cached) {
      logCall({
        timestamp: new Date().toISOString(),
        bootcampId: req.params.id,
        promptVersion: PROMPT_VERSION,
        model: process.env.LLM_MODEL,
        inputTokens: 0,
        outputTokens: 0,
        durationMs: 0,
        repairNeeded: false,
        cacheHit: true,
        outcome: 'kill-switch-cached',
      });

      return res.status(200).json({
        success: true,
        cached: true,
        data: cached.summaryJson,
      });
    }

    return res.status(503).json({
      success: false,
      error: 'AI summarization is temporarily disabled and no cached summary is available.',
    });
  }

  const force = req.query.force === 'true';

  // Check cache
  if (!force) {
    const cached = await prisma.bootcampSummary.findUnique({
      where: { bootcampId: req.params.id },
    });

    if (cached && cached.reviewCountAtGeneration === reviews.length) {
      logCall({
        timestamp: new Date().toISOString(),
        bootcampId: req.params.id,
        promptVersion: PROMPT_VERSION,
        model: process.env.LLM_MODEL,
        inputTokens: 0,
        outputTokens: 0,
        durationMs: 0,
        repairNeeded: false,
        cacheHit: true,
        outcome: 'cache-hit',
      });

      return res.status(200).json({
        success: true,
        cached: true,
        data: cached.summaryJson,
      });
    }
  }

  // Generate new summary — handle timeout
  let summaryData;
  try {
    summaryData = await generateSummary(reviews, req.params.id);
  } catch (err) {
    const status = err.status || err.statusCode;
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' ||
        (err.message && err.message.includes('timeout'))) {
      return res.status(504).json({
        success: false,
        error: 'LLM request timed out. Try again later.',
      });
    }
    throw err;
  }

  if (!summaryData) {
    return res.status(422).json({
      success: false,
      error: 'The model returned an invalid response and repair failed.',
    });
  }

  // Upsert cache
  await prisma.bootcampSummary.upsert({
    where: { bootcampId: req.params.id },
    create: {
      bootcampId: req.params.id,
      summaryJson: summaryData,
      reviewCountAtGeneration: reviews.length,
      promptVersion: PROMPT_VERSION,
    },
    update: {
      summaryJson: summaryData,
      reviewCountAtGeneration: reviews.length,
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date(),
    },
  });

  return res.status(200).json({ success: true, cached: false, data: summaryData });
});
