# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrackIT is a two-part project:
- **Backend**: A Spring Boot 2 / Java 8 REST API backed by MySQL on AWS RDS, originally built as a goal-tracking CRUD service.
- **Frontend** (`client/`): A React 18 + Vite SPA called "Family HQ" — a task planner for couples, with AI-powered scheduling via the Anthropic Claude API.

The two parts are largely independent today. The frontend stores all data client-side via `window.storage` and calls Claude directly; the backend (Spring Boot) is a separate older service that connects to AWS RDS.

---

## Commands

### Frontend (run from `client/`)
```bash
npm run dev       # Vite dev server
npm run build     # Production build → dist/
npm run preview   # Serve production build locally
```

### Backend (run from repo root)
```bash
mvn clean install       # Compile and package JAR
mvn spring-boot:run     # Run the Spring Boot server
```

There are no configured lint, format, or test commands in either package.json or pom.xml.

---

## Architecture

### Frontend (`client/src/App.jsx`)
The entire frontend lives in a single ~790-line file. It uses plain React hooks — no router, no Redux, no CSS files (all styles are inline).

**View routing** is a `useState` string switching between four views: `dashboard`, `lists`, `calendar`, `ai`. There is no URL-based routing and no deep-linking.

**Persistence** uses `window.storage` polled every 30 seconds to sync between tabs/users. All mutations (add, edit, delete, toggle) write synchronously to storage on every state change.

**Task data model:**
```js
{ id, title, category, priority (1–5), assignee ("Bhargav"|"Rupa"|"Both"),
  done, dueDate, scheduledDate, scheduledTime, duration, notes,
  recurrence ("daily"|"weekly"|null), completedDates }
```

**AI integration** is direct `fetch()` calls to `https://api.anthropic.com/v1/messages` using model `claude-sonnet-4-20250514`. Three AI features exist:
- **Auto-Schedule**: sends all pending tasks to Claude and replaces `scheduledDate`/`scheduledTime` on each.
- **Auto-Reprioritize**: reschedules overdue tasks.
- **AI Chat** (`AIView`): full natural-language CRUD — Claude returns a JSON diff that is merged into task state.

The Claude API key is supplied client-side (entered by the user at runtime and stored in component state, not hardcoded).

**Inline components** defined inside App.jsx: `Pill`, `Dot`, `TaskRow`, `NotifPanel`, `TaskModal`, `Dashboard`, `ListView`, `CalView`, `AIView`.

### Backend (`src/main/java/com/trackit/user/goals/`)
Minimal three-layer Spring Boot service:

| Layer | File | Notes |
|---|---|---|
| Entry point | `GoalsServiceInitializer.java` | `@SpringBootApplication` |
| Controller | `TrackITController.java` | Two endpoints: `GET /hello`, `POST /add` |
| Repository | `GoalRepository.java` | `CrudRepository<Goal, Long>` + `findByName` |
| Entity | `Goal.java` | `id`, `name`, `type` only |

Database config is in `src/main/resources/application.properties` pointing at a hardcoded AWS RDS endpoint. There is no service layer — the controller calls the repository directly.

---

## Key Conventions

- **No TypeScript** in the frontend; plain `.jsx`/`.js` throughout.
- **No CSS files** — all styling is inline JSX style objects.
- **No component file splits** — all React components are defined and used inside `App.jsx`.
- **No test suite** in either sub-project.
- The backend uses Spring Boot **2.0.1** (not the current 3.x line) and targets **Java 8**.
- The GitHub Actions workflow (`jekyll-gh-pages.yml`) deploys a static Jekyll site to GitHub Pages and is unrelated to the React app or Spring Boot service.
