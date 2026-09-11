const { z } = require('zod');

const summarySchema = z.object({
  overall_sentiment: z.enum(['positive', 'mixed', 'negative']),
  top_pros: z.array(z.string()).max(5),
  top_cons: z.array(z.string()).max(5),
  recommended_for: z.string(),
  confidence: z.number().min(0).max(1),
  review_count: z.number().int().nonnegative(),
});

module.exports = summarySchema;
