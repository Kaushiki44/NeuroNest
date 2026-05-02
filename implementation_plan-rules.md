# Content Quality Scoring Implementation Plan

We will add a rule-based content quality scoring system to NeuroNest. The system will evaluate the post content when a post is created or updated, assign a score out of 100, and generate actionable feedback.

## Open Questions

> [!WARNING]
> **Scoring Math Clarification**
> To ensure the score stays between 0 and 100:
> - Should we start with a **Base Score of 55**?
>   - Max positive adjustments: +20 (Words) + 15 (Headings) + 10 (Keywords) = +45 (Total = 100)
>   - Max negative adjustments: -20 (Words) - 10 (Headings) - 10 (Paragraphs) = -40 (Total = 15)
> - Does a base score of 55 work for you, capped between 0 and 100?

## Proposed Changes

### Backend

#### [NEW] `server/services/qualityScore.js`
- Export a function `calculateQualityScore(content)`
- **Logic**:
  - Strip HTML to count words.
  - Apply Word Count rules: < 200 (-20), 200–500 (+10), > 500 (+20).
  - Use regex to detect `<h1>`, `<h2>`, etc. (+15 if present, -10 if missing).
  - Split content by `<p>` tags and check if any paragraph exceeds 150 words (-10).
  - Extract words, remove common stop words, and find if any keyword appears >= 3 times (+10).
  - Ensure the final score is clamped between 0 and 100.
  - Return `{ score, feedback: [] }`.

#### [MODIFY] `server/models/Post.js`
- Add `qualityScore: { type: Number, default: 0 }`.
- Add `qualityFeedback: [{ type: String }]`.

#### [MODIFY] `server/routes/posts.js`
- Import `calculateQualityScore`.
- In `POST /api/posts` and `PUT /api/posts/:id`:
  - Run `calculateQualityScore(content)`.
  - Save `qualityScore` and `qualityFeedback` to the document.

---

### Frontend

#### [MODIFY] `client/src/pages/Dashboard.jsx`
- Add a new stat card showing the "Average Quality Score" across all posts.
- Update the `PostCard` to display a small badge indicating the quality score (e.g., green if >= 80, orange if >= 50, red if < 50).

#### [MODIFY] `client/src/components/PostCard.jsx` & `client/src/components/PostCard.css`
- Display the `qualityScore` in the footer stats next to views and likes.

#### [MODIFY] `client/src/pages/ViewPost.jsx` & `client/src/pages/ViewPost.css`
- Display the full `qualityScore` and list out the `qualityFeedback` strings so the author can see how to improve their post.
- E.g., render a "Quality Insights" side-panel or section at the bottom of the post (visible only to the author).

## Verification Plan
1. **Unit test**: Pass sample HTML content through `calculateQualityScore` and verify the math.
2. **API test**: Create/edit a post via the UI and verify that `qualityScore` and `qualityFeedback` are returned in the JSON payload.
3. **UI test**: View the dashboard and post page to verify the score is beautifully rendered matching the dark theme.
