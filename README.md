# StudyGenius – AI‑Powered Study Planner & Interview Prep

## Overview

StudyGenius is an Angular web application that helps users create a **personalized study plan** and **interview preparation** workflow based on their résumé and a target job description.
The app leverages **Google Gemini (gemini‑2.5‑flash)** to generate:

- Structured study sections
- Detailed subsections, slides, flashcards, and quizzes
- Interview questions with **well‑formatted ideal answers** (paragraphs, line‑breaks, examples)

All UI components follow modern, premium design guidelines (dark‑mode‑ready, glass‑morphism, smooth micro‑animations) and use **standalone Angular components**, **signals**, and **OnPush** change detection for optimal performance.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Development](#setup--development)
5. [Running the App](#running-the-app)
6. [AI Service Details](#ai-service-details)
7. [Formatting of Interview Answers](#formatting-of-interview-answers)
8. [Testing & Verification](#testing--verification)
9. [Future Improvements](#future-improvements)
10. [License](#license)

---

## Features

- **Dynamic Study Plan Generation** – Input résumé + job description → JSON‑driven study sections.
- **Content Enrichment** – Automatic creation of subsections, slides, flashcards, and quizzes.
- **Interview Prep Tab** – Generates categorized interview questions (Technical, System Design, Behavioral) with **ideal answers** that preserve paragraph structure.
- **Rich UI** – Premium styling, responsive layout, animated accordions, and accessible components.
- **State Management with Signals** – Local component state is handled via Angular signals (`signal`, `computed`, `update`).
- **On‑Push Change Detection** – All components use `changeDetection: ChangeDetectionStrategy.OnPush` for performance.

---

## Tech Stack

| Layer               | Technology                                                     |
| ------------------- | -------------------------------------------------------------- |
| **Framework**       | Angular (standalone components, signals)                       |
| **Language**        | TypeScript (strict mode)                                       |
| **Styling**         | Vanilla CSS (custom design system, no Tailwind)                |
| **AI**              | Google Gemini (`gemini‑2.5‑flash`) via `@google/generative-ai` |
| **Build**           | Angular CLI (`ng serve`, `ng build`)                           |
| **Testing**         | Jasmine/Karma (unit), Cypress (e2e)                            |
| **Version Control** | Git (standard workflow)                                        |

---

## Project Structure (relevant parts)

```
src/
 ├─ app/
 │   ├─ core/
 │   │   └─ services/
 │   │       └─ ai.service.ts          # AI prompt generation & JSON parsing
 │   ├─ features/
 │   │   ├─ study-plan/
 │   │   │   └─ study-plan.ts           # UI + formatting for interview answers
 │   │   └─ materials/
 │   │       └─ materials.ts            # Quiz component (fixed selection bug)
 │   └─ styles.css                     # Global design tokens & utilities
 └─ environments/
     └─ environment.ts                # API key & env config
```

---

## Setup & Development

1. **Prerequisites**
   - Node.js ≥ 18
   - npm ≥ 9
   - Angular CLI (`npm i -g @angular/cli`)
2. **Clone the repo**

```bash
git clone https://github.com/your-org/studygenius.git
cd studygenius
```

3. **Install dependencies**

```bash
npm ci
```

4. **Configure API key**
   Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiKey: 'YOUR_GEMINI_API_KEY', // <-- replace with your Gemini key
};
```

5. **Run the development server**

```bash
ng serve --no-hmr   # hot‑module reload disabled per project policy
```

The app will be available at `http://localhost:4200`.

---

## Running the App

- **Study Plan Tab** – Upload or paste résumé + job description → click **Generate Plan**.
- **Interview Prep Tab** – Choose a category (Technical / System Design / Behavioral) or let the app generate all three.
- **Materials Tab** – Take quizzes generated from the study sections.

All generated content is displayed with **premium UI** (rounded cards, gradient backgrounds, animated expand/collapse).

---

## AI Service Details (`ai.service.ts`)

- **Model**: `gemini-2.5-flash` (fast, cost‑effective).
- **Prompt Construction** – Includes explicit **“Answer Formatting”** instructions (see next section).
- **JSON Extraction** – The service strips any Markdown fences and parses the raw JSON.
- **Error Handling** – Throws if parsing fails; UI shows a friendly error toast.

````ts
private async generateJson<T>(prompt: string): Promise<T> {
  const result = await this.model.generateContent(
    prompt + ' \n\nReturn ONLY valid JSON without any markdown formatting or backticks.'
  );
  const text = (await result.response).text();
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean) as T;
}
````

---

## Formatting of Interview Answers

The AI prompt now contains a **dedicated “Answer Formatting”** block that forces the model to:

1. **Use paragraphs** – separate major ideas with **double line breaks (`\n\n`)**.
2. **Use single line breaks (`\n`)** inside paragraphs for readability.
3. **Provide 3‑5 paragraphs** per answer, each with clear examples or step‑by‑step explanations.
4. **Avoid Markdown** – the service strips any fences, ensuring the answer is plain text that can be safely bound with `[innerHTML]` after conversion.

**Resulting UI handling (in `study-plan.ts`):**

```ts
formatAnswerText(text: string): string {
  if (!text) return '';
  return text
    .split('\n\n')
    .map(p => `<p class="mb-3">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
```

The component then renders the formatted HTML safely with Angular’s `DomSanitizer`.

---

## Testing & Verification

- **Unit Tests** – Run `ng test` to execute Jasmine specs (covers AI service, component signals, and formatting helpers).
- **End‑to‑End** – `npx cypress open` launches the interactive Cypress runner; key flows (plan generation, interview tab expansion, quiz selection) are verified.
- **Manual QA** – Verify that the “Ideal Answer” section displays paragraph spacing, line breaks, and proper typography on desktop and mobile viewports.

---

## Future Improvements

| Area                 | Planned Enhancement                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **AI Model**         | Switch to `gemini‑2.5‑pro` for higher quality answers (optional toggle).                           |
| **Componentization** | Break `StudyPlanComponent` into sub‑components (`RoadmapTab`, `InterviewPrepTab`, `MaterialsTab`). |
| **Caching**          | Store generated study plans in IndexedDB for offline access.                                       |
| **Export**           | Add PDF/Markdown export of the full study plan.                                                    |
| **Accessibility**    | Full WCAG compliance audit (color contrast, ARIA labels).                                          |

---

## License

This project is licensed under the **MIT License** – see `LICENSE` for details.
