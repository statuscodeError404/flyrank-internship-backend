require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const summarySchema = require('../llm/summarySchema');

const PROMPT_VERSION = 'course-summary-v1';

const systemPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/course-summary-v1.md'),
  'utf8'
);

const cases = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'summary-cases.json'), 'utf8')
);

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 180000,
});

function buildUserMessage(reviews) {
  const lines = reviews.map(
    (r, i) => `${i + 1}. [Rating: ${r.rating}/10] "${r.title}: ${r.text}"`
  );
  return `Here are ${reviews.length} student review(s) for this bootcamp:\n\n${lines.join('\n')}`;
}

function parseAndValidate(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { success: false, error: 'No JSON found' };
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const result = summarySchema.safeParse(parsed);
    if (!result.success) return { success: false, error: result.error.message };
    return { success: true, data: result.data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function runCase(testCase, index) {
  const label = `[${index + 1}/${cases.length}] "${testCase.name}"`;
  console.log(`\n${label} — running...`);

  const userMessage = buildUserMessage(testCase.reviews);
  const start = Date.now();

  let raw;
  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    raw = response.choices[0].message.content;
  } catch (err) {
    console.log(`  FAIL — model error: ${err.message}`);
    return { name: testCase.name, pass: false, reason: `model error: ${err.message}` };
  }

  const durationMs = Date.now() - start;
  const validation = parseAndValidate(raw);

  if (!validation.success) {
    console.log(`  FAIL — invalid schema: ${validation.error}`);
    return { name: testCase.name, pass: false, reason: `invalid schema` };
  }

  const data = validation.data;
  const checks = [];

  // Check sentiment
  const sentimentMatch = data.overall_sentiment === testCase.expected_sentiment;
  checks.push({ check: 'sentiment', expected: testCase.expected_sentiment, got: data.overall_sentiment, pass: sentimentMatch });

  // Check review_count
  const countMatch = data.review_count === testCase.reviews.length;
  checks.push({ check: 'review_count', expected: testCase.reviews.length, got: data.review_count, pass: countMatch });

  // Check low confidence if expected
  if (testCase.expect_low_confidence) {
    const lowConf = data.confidence < 0.4;
    checks.push({ check: 'low_confidence', expected: '< 0.4', got: data.confidence, pass: lowConf });
  }

  // Check arrays are non-empty for cases with enough reviews
  if (testCase.reviews.length >= 3) {
    checks.push({ check: 'has_pros', expected: '>= 1', got: data.top_pros.length, pass: data.top_pros.length >= 1 });
  }

  const allPass = checks.every((c) => c.pass);
  const failedChecks = checks.filter((c) => !c.pass);

  if (allPass) {
    console.log(`  PASS (${durationMs}ms) — sentiment: ${data.overall_sentiment}, confidence: ${data.confidence}, pros: ${data.top_pros.length}, cons: ${data.top_cons.length}`);
  } else {
    console.log(`  FAIL (${durationMs}ms) — failed checks:`);
    failedChecks.forEach((c) => console.log(`    ${c.check}: expected ${c.expected}, got ${c.got}`));
  }

  return { name: testCase.name, pass: allPass, checks, durationMs };
}

async function main() {
  console.log('=== Review Summarizer Eval ===');
  console.log(`Model: ${process.env.LLM_MODEL}`);
  console.log(`Prompt: ${PROMPT_VERSION}`);
  console.log(`Cases: ${cases.length}`);

  const results = [];
  for (let i = 0; i < cases.length; i++) {
    // Small delay between calls to avoid rate limiting on free tier
    if (i > 0) await new Promise((r) => setTimeout(r, 10000));
    const result = await runCase(cases[i], i);
    results.push(result);
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;

  console.log('\n=== Summary ===');
  console.log(`${passed}/${total} cases passed (${Math.round((passed / total) * 100)}%)`);

  results.forEach((r) => {
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'} — ${r.name}${r.durationMs ? ` (${r.durationMs}ms)` : ''}`);
  });
}

main().catch(console.error);
