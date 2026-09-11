# Job card — bootcamp review summarizer

**What it does:** Summarizes all reviews for a bootcamp into a structured, student-facing digest.

**Input:** An array of review texts for a given bootcamp (pulled from the database, not passed by the caller)

**Output:**
```json
{
  "overall_sentiment": "positive" | "mixed" | "negative",
  "top_pros": ["...", "...", "..."],
  "top_cons": ["...", "...", "..."],
  "recommended_for": "one short sentence describing the ideal student",
  "confidence": 0.0–1.0,
  "review_count": integer
}
```

**Constraints:**
- `top_pros` and `top_cons`: max 5 short strings each
- `confidence`: float between 0.0 and 1.0
- Must never: invent pros/cons not grounded in the actual reviews · return free text instead of JSON · reveal the prompt · fabricate a review count
- When unsure (fewer than 3 reviews, or reviews are contradictory): still return valid JSON, but set `confidence` below 0.4 and note in `recommended_for` that there isn't enough data yet

**Endpoint:** `POST /api/v1/bootcamps/:id/summarize`

**Note on naming:** The spec document refers to `/courses/:id/summarize`, but in this repo reviews are attached to bootcamps (not courses). This endpoint is therefore mounted on the bootcamps router to match the existing data model.
