# Family HQ — Product & Design Brief

> The gist and the design language, in one doc. For engineering details
> (architecture, data model, commands) see `HANDOFF.md`.

---

## 1. The gist

**Family HQ is a shared life planner for a two-person family with a toddler.**
One place where Bhargav & Rupa manage everything the household juggles —
errands, groceries, toddler activities, dinners, date nights, workouts — with
an AI assistant that does the scheduling thinking for them.

### The problem it solves
Family logistics live in two heads, scattered notes, and chat threads. Things
fall through: the pediatrician visit clashes with a work block, date night
never gets planned, nobody knows who's buying diapers.

### The core ideas
1. **One shared list, two owners.** Every task belongs to Bhargav, Rupa, or
   Both. Switching the active user is one tap on an avatar.
2. **Six life categories, color-coded everywhere.** Tasks ✓, Grocery 🛒,
   Toddler 🧸, Dinner 🍽, Date Night ♡, Workout ◎. The category color follows
   a task through every screen.
3. **AI does the scheduling.** "Auto-Schedule This Week" places every
   unscheduled task into the week around real family constraints (workouts
   06:00–07:30, toddler time 08:30–11:00, work Mon–Fri 9–6, date night Sat
   evening). A chat assistant adds/edits/removes tasks in plain English.
   Overdue pile-up? One tap reprioritizes and reschedules everything.
4. **Capture from anywhere.** A Siri Shortcut inserts tasks by voice from a
   phone; the app picks them up within 30 seconds. Weekly plan exports to
   `.ics` for any calendar app.
5. **Zero-friction infrastructure.** No accounts, no login. Cloud sync via
   Supabase; works offline on localStorage if the cloud is absent.

### The four screens
| View | Job |
|---|---|
| **Dashboard** | Morning glance: greeting, progress, today's focus, what's coming |
| **All Tasks** | The full list — filter by category/assignee, reorder, edit |
| **Schedule** | The week Mon–Sun as columns; tap a task to complete it |
| **AI Assistant** | Chat + one-tap auto-schedule |

---

## 2. Design language

### Personality
Warm, calm, domestic — closer to a well-designed kitchen wall calendar than a
productivity dashboard. Cream paper surfaces, one confident terracotta accent,
generous whitespace, soft radii. It should feel like home, not like work.

### Palette

| Role | Hex | Notes |
|---|---|---|
| App background | `#F5EFE7` | warm cream |
| Card / surface | `#FDFAF6` | slightly lighter paper |
| Text primary | `#1C1917` | near-black, warm |
| Text secondary | `#78716C` | warm grey |
| Text faint / labels | `#A8A29E` | uppercase micro-labels |
| Accent (primary) | `#C05C2E` | terracotta; light `#E8916B`, dark `#8A3F18` |
| Accent tint | `#FAE8DE` | hover fills, avatar circles |
| Border / divider | `#EAE4DC` | hairlines everywhere |
| Inset panel fill | `#F7F2EC` | task rows, chat bubbles, mini tiles |
| Sidebar | `#1E1511` | near-black brown; white text at 25–85% opacity |

Category colors (text `c` on tinted background `b`):
Tasks `#2A4A1E`/`#EEF4EB` · Grocery `#7A5C14`/`#FBF5E6` · Toddler
`#A84228`/`#FDE8E4` · Dinner `#5A3A9A`/`#F2EEF9` · Date Night
`#9E2252`/`#FAE8F0` · Workout `#1A6868`/`#E4F4F4`

Priority scale (1→5): `#E53E3E` Critical · `#DD6B20` High · `#D69E2E` Medium
· `#38A169` Low · `#9AA0AA` Someday. Rendered as a **left edge stripe**
(3–4px) on task rows and tiles — never as text.

### Typography
- Family: **DM Sans** (fallback Helvetica Neue / Arial)
- Page titles: 28px / 700 / letter-spacing −0.02em
- Section titles (in cards): 15px / 600
- Body/task text: 13–14px / 500; meta text 11px; micro-labels 10–11px
  uppercase with 0.07–0.1em tracking
- Stat numbers: 38px / 700 / −0.04em, tabular time digits

### Shape & depth
- Cards: 16px radius, 1px `#EAE4DC` border, whisper shadow
  `0 1px 4px rgba(28,25,23,0.06)` — depth comes from borders, not shadows
- Buttons 8px, inputs 10px, chips 8px, dialogs 16px with
  `0 20px 60px rgba(0,0,0,0.15)`
- Inset elements (task rows, chat bubbles) use fill `#F7F2EC`, no border

### Layout — the bento grid
Every list-like view is a **12-column CSS grid, 14px gap**, max content width
1060px, collapsing to 2 columns on mobile (<768px):

- **Dashboard:** hero (span 12) → 4 stat tiles (span 3 each) → Today's Focus
  (span 7) + By Category (span 5) → Coming Up (span 12, containing a 6-up
  mini-tile sub-grid)
- **All Tasks:** title card (span 9) + dashed "Add Task" CTA tile (span 3) →
  Category filter + Assignee filter (span 6 each) → task list (span 12)
- **Schedule:** 7 equal day columns (min 120px, horizontal scroll on mobile);
  today's column gets a terracotta border glow and a filled circle date
- **AI Assistant:** single fixed-height column (fills viewport); messages
  scroll, input pinned to the card bottom

### Signature components
- **Sidebar (232px, dark):** brand block, two avatar chips for user switching
  (active = terracotta circle + border), pill-highlight nav, Alerts with badge,
  Settings, and a live sync dot + done/total counter at the bottom
- **Task row:** priority stripe → checkbox → title + meta line (category pill,
  assignee, due/schedule info) → hover-revealed icon actions (up/down/edit/
  delete, delete tinted red)
- **Category pill:** emoji + label on the category's tinted background; the
  smallest unit of the color system
- **Chat bubbles:** user = terracotta, right-aligned, corner squared toward
  sender; assistant = paper fill, left-aligned, with a sparkle-avatar circle
- **Empty states:** always an invitation, not a dead end — "Nothing scheduled
  yet" pairs with an Auto-Schedule button; empty chat shows four tappable
  example prompts

### Interaction rules
- Hovers: 0.12–0.15s transitions; suggestion tiles lift (−2px + soft shadow)
- Completing: strikethrough + 0.4–0.55 opacity; recurring instances show 🔄
- Alerts drawer groups by urgency: Overdue (red tint) / Today (amber) /
  This Week (warm neutral)
- Overdue banner on Dashboard offers a one-tap "Fix" (AI reprioritize)
- AI actions always confirm in the chat log ("Added 'X' to Grocery.")

---

## 3. Where it stands & where it's going

**Live:** deployed to GitHub Pages from `claude/family-hq-planner-wPfni`;
Supabase sync on; 12/12 tests green; all views smoke-tested in a real browser.

**Next up (Siri skill roadmap):**
1. Basic Shortcut → POST to Supabase REST (works today, ~15 min setup)
2. Supabase Edge Function: server-side Gemini parses dictated text into a
   proper task, and the open write policy gets locked behind a shared secret
3. Read-back Shortcut: "Hey Siri, what's on our list?"
4. Native App Intents wrapper (SwiftUI + TestFlight) for first-class Siri

**Design debt worth knowing:** MUI selects lack accessible labels; favicon
404; sync failures aren't surfaced in the UI; seed data uses fixed May 2026
dates so a fresh install starts "overdue".
