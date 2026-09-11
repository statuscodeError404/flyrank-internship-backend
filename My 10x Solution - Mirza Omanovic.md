# My 10x Solution — Mirza Omanovic

## 1. What problem am I solving?

Anyone deciding whether to join a course or bootcamp has to read through dozens of scattered reviews to figure out if it's actually worth their time and money. This is slow, easy to misjudge, and most people either skim a handful of reviews or skip reading them altogether.

**Who has this problem:** prospective students comparing courses and bootcamps before committing.

**My 10x claim:** manually reading 40–50 reviews to judge a course takes roughly 20–30 minutes; my app generates a clear, structured summary of what reviewers actually think in a matter of seconds.

**Non-goal:** this app does not handle payments, enrollment, or partnerships with course providers — it is purely a review-and-summarize platform.

## 2. How did I implement it?

The app is a course/bootcamp review platform: users create an account, browse courses, and upload reviews. On top of the existing CRUD functionality, an AI endpoint reads all reviews for a course and produces a structured summary — overall sentiment, top pros, top cons, and who the course is best suited for — instead of making users read every review individually. That summary is cached and only regenerated when new reviews come in, rather than being recomputed on every page view.

### Concepts implemented (5+)

| # | Concept | Where it lives in the code |
|---|---------|------------------------------|
| 1 | API endpoints | `routes/` — courses, reviews, users, auth |
| 2 | Database | Persists users, courses, and reviews across restarts |
| 3 | Authentication | Users must log in to upload a review; protected routes require a valid session/token |
| 4 | LLM integration | `POST /courses/:id/summarize` — sends the course's reviews to an LLM, validates the response against a schema (sentiment, pros, cons, recommended_for, confidence), with a timeout, retry policy, cost log, and kill switch |
| 5 | Caching | The generated summary is stored in the database and reused on subsequent requests; only regenerated when a new review is added |


### How to run it

```
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env   # add your DB connection string and LLM API key
npm run seed            # loads demo courses, users, and reviews
npm run dev
```

Then:
1. Open the app / hit the API at `http://localhost:3000`
2. Log in with a seeded demo user (or register a new one)
3. Browse a course and view its existing reviews
4. Call `POST /courses/:id/summarize` (or click "Summarize reviews" in the UI, if built) to see the AI-generated summary
5. Add a new review and re-run the summary to see it update
