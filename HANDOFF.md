# Family HQ — Project Handoff Notes

> Handoff notes for continuing work in a new session (Cowork or otherwise).
> Last updated: 2026-07-14 · Branch: `claude/family-hq-planner-wPfni`

## 1. What this is

**Family HQ** is a life planner web app for a two-person family (Bhargav & Rupa,
who have a toddler). It manages shared tasks across six categories (Tasks,
Grocery, Toddler, Dinner, Date Night, Workout) with priorities, due dates,
weekly scheduling, recurring tasks, an AI assistant (Gemini), cloud sync
(Supabase), and a Siri Shortcut entry path.

It lives in the `client/` folder of this repo (the repo root also contains an
older Java/Spring Boot project that is unrelated to this app).

- **Live app:** GitHub Pages — deployed by `.github/workflows/deploy.yml` on
  every push to `claude/family-hq-planner-wPfni`. URL pattern:
  `https://<owner>.github.io/TrackIT/`
- **Working branch:** `claude/family-hq-planner-wPfni` (all development here;
  do not push elsewhere without permission)

## 2. Tech stack

| Layer      | Choice                                                 |
|------------|--------------------------------------------------------|
| Build      | Vite 7                                                 |
| UI         | React 18 + MUI v9 (theme in `client/src/main.jsx`)     |
| Data       | Supabase (`tasks` table) with localStorage fallback    |
| AI         | Gemini 2.0 Flash via REST (`client/src/gemini.js`)     |
| Tests      | Vitest (`client/src/app.test.js`, 12 tests)            |
| Deploy     | GitHub Actions → GitHub Pages (`peaceiris/actions-gh-pages`, SHA-pinned) |

## 3. Architecture (after the July 2026 refactor)

```
client/src/
├── main.jsx            # MUI theme: palette, Card/Dialog/Input overrides
├── App.jsx             # Thin shell: wires hooks + views + modals together
├── constants.js        # ALL shared values: CATS, WEEK/TODAY, MEMBERS,
│                       #   PRIORITY_COLORS/LABELS, BENTO_* grid helpers, SEED
├── storage.js          # Supabase ⇄ localStorage; camelCase ⇄ snake_case maps;
│                       #   diff-based deletes via trackedCloudIds
├── supabase.js         # Client factory; null when env vars absent
├── gemini.js           # callGemini(apiKey, prompt) → parsed JSON
├── prompts.js          # schedulePrompt / reprioritizePrompt / chatPrompt
├── utils.js            # expandRecurring, weekRangeLabel, exportICS, notifs
├── hooks/
│   ├── useTasks.js     # Task state + persistence + 30s Supabase polling
│   └── useAi.js        # Chat log + auto-schedule + reprioritize
└── components/
    ├── PageHeader.jsx  # Shared PageHeader + SectionTitle
    ├── Sidebar.jsx     # Dark rail: avatar user switcher, nav, alerts, sync dot
    ├── Dashboard.jsx   # Bento grid: GreetingHero, StatTile ×4, TodayFocus,
    │                   #   CategoryProgress, ComingUp
    ├── ListView.jsx    # All Tasks: FilterCard ×2, AddTaskTile, TaskRow list
    ├── CalView.jsx     # Week view: DayCard ×7, EventChip, UnscheduledStrip
    ├── AIView.jsx      # Chat: AiAvatar, ChatBubble, EmptyChat suggestions
    ├── TaskRow.jsx     # Row with priority stripe + hover actions
    ├── TaskModal.jsx   # Add/edit form
    ├── SettingsModal.jsx # Gemini API key management (localStorage only)
    ├── NotifPanel.jsx  # Right drawer: Overdue / Today / This Week
    └── Pill.jsx        # Category pill + priority Dot badges
```

### Key concepts a new contributor must know

- **Dates are dynamic.** `WEEK` (Mon–Sun containing today) and `TODAY` are
  computed at module load in `constants.js` using a local-timezone-safe
  `toISODate()`. Nothing is hardcoded.
- **Recurring tasks** are stored once but *expanded* into per-day instances by
  `expandRecurring()`. Instance ids look like `s5__2026-07-13`
  (`taskId + RECURRING_SEPARATOR + date`). Completing an instance records the
  date in the task's `completedDates` array — it does not mark the task done.
- **Priorities are 1-based** (1 = Critical … 5 = Someday). `PRIORITY_COLORS[0]`
  is a blank placeholder so `PRIORITY_COLORS[task.priority]` needs no -1 math.
- **Diff-based cloud deletes.** `storage.js` keeps a `trackedCloudIds` set of
  ids known to exist in Supabase. On save, ids missing from the app but present
  in the set are deleted; Siri-added rows not yet loaded are never in the set,
  so they can't be accidentally deleted.
- **Siri polling.** `useTasks` polls Supabase every 30 s (`POLL_INTERVAL_MS`)
  and only replaces state when a genuinely new id appears.
- **Bento grid.** Dashboard and ListView use a 12-column CSS grid on desktop
  collapsing to 2 columns on mobile (`BENTO_COLS/FULL/HALF` in constants.js).

### Design tokens (all in `main.jsx` theme + reused as hex in components)

| Token          | Value     |
|----------------|-----------|
| Background     | `#F5EFE7` |
| Surface/paper  | `#FDFAF6` |
| Text primary   | `#1C1917` |
| Text secondary | `#78716C` |
| Accent (primary)| `#C05C2E` (light `#E8916B`, dark `#8A3F18`) |
| Border/divider | `#EAE4DC` |
| Sidebar dark   | `#1E1511` |
| Card radius    | 16px      |

## 4. Data model (`tasks` table / task object)

App shape (camelCase) ⇄ DB shape (snake_case) via `toRow`/`fromRow`:

```js
{
  id, title, category,          // category ∈ tasks|grocery|toddler|dinner|date|workout
  priority,                     // 1–5
  assignee,                     // 'Bhargav' | 'Rupa' | 'Both'
  done, dueDate, scheduledDate, scheduledTime, duration, notes,
  recurrence,                   // null | 'daily' | 'weekly'
  completedDates,               // dates a recurring instance was completed
}
```

Schema + RLS policy: `client/supabase/schema.sql`.

## 5. Integrations & secrets

- **Supabase:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are GitHub
  Actions secrets baked in at build time. Without them the app silently runs
  on localStorage only.
  ⚠️ The RLS policy is intentionally wide open (anyone with the deployed URL
  can read/write all tasks) to keep the Siri Shortcut simple. Documented in
  schema.sql. Fix planned via Edge Function (see roadmap).
- **Gemini:** user pastes their own API key into Settings; stored in
  localStorage only, sent via `x-goog-api-key` header (never in the URL).
- **⚠️ Old RDS password** was committed to git history earlier in the project
  (Java side). It is burned — rotate before that database is ever used again.
  DB creds must come from env vars (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).

## 6. How to run / test

```bash
cd client
npm install
npm run dev        # local dev server
npm test -- --run  # 12 vitest tests
npm run build      # production build (dist/)
npx vite preview   # serve the production build
```

Deploy = just push to `claude/family-hq-planner-wPfni`; the workflow builds
(with Supabase secrets) and publishes to GitHub Pages.

## 7. Work log (most recent first)

1. **Clean-code refactor + componentization** (commit `30444f7`)
   - Extracted `useTasks` / `useAi` hooks; App.jsx is now a thin shell
   - Split every view into small named subcomponents; added `PageHeader`
   - Added file-header + inline comments throughout for new contributors
   - **Bugs fixed:** weekly recurrence saved `scheduledDate: null` when Day of
     Week untouched (now defaults Monday — verified in browser); `callGemini`
     ignored HTTP errors; Enter could double-send AI chat during loading;
     clearing Duration saved `NaN`
   - Verified: build clean, 12/12 tests, Playwright smoke of all views/modals
2. **Constants consolidation** (commit `4d01ec0`) — `MEMBERS`,
   `PRIORITY_COLORS/LABELS`, `BENTO_*`, `POLL_INTERVAL_MS` centralized; fixed
   `role:'ai'`→`'assistant'` chat avatar bug; stale hex colors → tokens
3. **Bento grid redesign** — all 4 views as 12-col bento layout
4. **Dynamic dates** — replaced hardcoded "May 25–31 2026" week with computed
   `WEEK`/`TODAY`
5. **UI redesign** — warm palette, dark sidebar with avatar switcher, priority
   stripes, chat bubbles, GitHub Pages deployment, Supabase sync + Siri path

## 8. Known issues / smaller TODOs

- **Accessibility:** MUI Selects in TaskModal have no accessible name
  (`aria-labelledby` is null) — screen readers announce unlabeled comboboxes.
  Wire `labelId` on `InputLabel`/`Select` pairs.
- Favicon 404 on the deployed site (cosmetic).
- `persistData` errors are only console-logged; the sidebar still shows
  "Synced" even if a Supabase write failed. Consider surfacing an error state.
- Seed data (`SEED` in constants.js) still uses fixed May/June 2026 dates, so
  a fresh install starts with everything overdue. Could derive from `WEEK`.

## 9. Roadmap: making it a Siri skill

Already 70% there — the Supabase REST endpoint *is* the Siri entry point.

1. **Basic Shortcut (works today, ~15 min):** Shortcuts app → "Add Family
   Task" → Dictate Text → Get Contents of URL, POST to
   `https://<project>.supabase.co/rest/v1/tasks` with `apikey` +
   `Authorization: Bearer <anon key>` headers and body
   `{"id": <UUID>, "title": <text>, "category": "tasks", "priority": 3,
   "assignee": "Both"}`. App picks it up within 30 s via polling.
2. **Smart parsing via Supabase Edge Function (recommended next):** an
   `add-task` function takes raw dictated text, calls Gemini server-side (key
   as a function secret), parses category/assignee/dueDate, inserts. Also the
   opportunity to replace the open RLS policy with a shared-secret header —
   closing the "anyone can write" hole.
3. **Read-back Shortcut:** GET `tasks?scheduled_date=eq.<today>&done=eq.false`
   → Speak Text: "Hey Siri, what's on our list?"
4. **True native Siri (App Intents):** small SwiftUI wrapper app with the App
   Intents framework, TestFlight to both phones. Biggest effort, best UX.

## 10. Conventions for future sessions

- Develop on `claude/family-hq-planner-wPfni`; push with
  `git push -u origin claude/family-hq-planner-wPfni`
- Shared values go in `constants.js`; if two files need it, it lives there
- Keep components small and named; comments explain *why*, headers explain
  each file's role
- Never commit credentials; Gemini key stays client-side in localStorage
- Run `npm run build && npm test -- --run` before pushing
