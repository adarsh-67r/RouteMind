# RouteMind — AI Agent Context Document

> **Purpose:** This document is written for AI coding agents (Copilot, Claude, Gemini, Cursor, Perplexity, etc.) assisting either team member on this codebase. It captures the current architecture, data flows, recent changes, known issues, and working conventions so any agent can get up to speed without reading every file.
>
> **Last updated:** 2026-06-25

---

## 1. Project Overview

RouteMind is a **React + Vite** single-page app that simulates an intelligent AI model router. Users type a query (and optionally attach files), and the app selects the "best" AI model for that task — showing which model was picked, why, what it costs, and how confident the router is.

**Current status:** The routing engine is fully mocked (`src/utils/mockRouter.js`). No real API calls are made to any LLM. All responses are pre-written strings in `Chat.jsx`'s `handleSendMessage`.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion v12 |
| Icons | Lucide React v1 |
| Markdown | react-markdown v10 + remark-gfm v4 |
| Syntax Highlighting | react-syntax-highlighter v16 |
| State | `useState` / `useRef` (no Redux/Zustand) |
| Persistence | `localStorage` (routing policy + telemetry stats + theme) |
| Testing | Vitest v4 + React Testing Library v16 |
| CI | GitHub Actions (lint → test → build) |

---

## 3. Directory Structure

```
src/
├── components/
│   ├── AuthenticationComingSoonModal.jsx  # "Auth coming soon" modal (focus trap, future features list, light mode safe)
│   ├── ChatInput.jsx       # Text input + file attachment UI (drag/drop, paste, file validation)
│   ├── ChatMessage.jsx     # Renders user & assistant messages (markdown, code blocks, routing info inline)
│   ├── Footer.jsx          # Shared footer — import this, do NOT inline footer markup in pages
│   ├── Navbar.jsx          # Top navigation: scroll blur, theme cycle, mobile menu, auth modal trigger
│   ├── RoutingCard.jsx     # ⚠️ ORPHANED — not imported anywhere. Rich routing decision card (321 lines). See Known Issues #1.
│   ├── Sidebar.jsx         # Nav, chat history, settings modal, telemetry modal, theme cycle, keyboard shortcuts
│   ├── Tooltip.jsx         # Tooltip hover helper (collapsed sidebar only). ⚠️ Has light-mode bug, see Known Issues #5.
│   └── TypingIndicator.jsx # Animated multi-stage "processing" indicator with model candidate rotation
├── context/
│   ├── ThemeContext.jsx     # Light/dark/system theme provider — persists to localStorage, applies `dark` class on <html>
│   └── ToastContext.jsx     # Global toast notification system (success/error/info, auto-dismiss, manual close)
├── pages/
│   ├── Benefits.jsx        # Features/benefits marketing page (uses shared Footer + shared animations)
│   ├── Chat.jsx            # Main chat page — holds ALL app state (messages, history, routing, loading)
│   ├── Documentation.jsx   # Documentation page. ⚠️ Has local animation variants + inline footer (convention violations). See Known Issues #2, #3.
│   └── Home.jsx            # Landing page with terminal simulator demo
├── utils/
│   ├── animations.js       # Shared Framer Motion variants (fadeInUp, stagger) — ALWAYS import from here
│   ├── fileHelpers.jsx     # Centralized file size formatting and icon matching helpers
│   └── mockRouter.js       # Routing logic (keyword matching → model selection + policy overrides)
├── data/
│   └── mockData.js         # Static data & defaultStats. ⚠️ Contains dead exports, see Known Issues #4.
├── test/
│   ├── setup.js            # Vitest setup (imports @testing-library/jest-dom)
│   └── mockRouter.test.js  # Unit tests for getMockRouting (7 tests)
├── index.css               # Global CSS: Tailwind v4 config, CSS custom properties, theme variables, keyframes
├── main.jsx                # Entry point: BrowserRouter > ThemeProvider > ToastProvider > App
└── App.jsx                 # Route definitions: /, /chat, /benefits, /docs, * (404 NotFound)
```

---

## 4. State Architecture

All meaningful state lives in `src/pages/Chat.jsx`. There is no global state manager.

```
Chat.jsx (top-level state owner)
├── chatHistory[]               — list of chat sessions {id, title, timestamp}
├── conversationsMessages{}     — map of chatId → message[]
├── activeChatId                — which chat is open
├── isLoading                   — controls input disable + TypingIndicator visibility
├── loadingStep                 — string shown in TypingIndicator during routing sim
├── pendingModel                — model name shown during the fake "routing" delay
└── timeoutRefs (useRef)        — holds setTimeout IDs so they can be cancelled on unmount
```

**Derived state** (computed from the above, not stored):
- `currentMessages` = `conversationsMessages[activeChatId] || []`

**localStorage keys (cross-component sync):**
| Key | Type | Description |
|---|---|---|
| `routingPolicy` | `string` | `'balanced'` \| `'cost'` \| `'accuracy'` — set in Sidebar settings modal |
| `routingStats` | `JSON string` | `{ totalQueries, savings, models: {} }` — updated by Chat.jsx after each message |
| `theme` | `string` | `'light'` \| `'dark'` \| `'system'` — set by ThemeContext, read on init |

**Custom events (for localStorage → React sync):**
- `telemetry-updated` — dispatched by Chat.jsx after updating `routingStats`; Sidebar listens and re-reads localStorage to update its `stats` state
- `policy-updated` — dispatched by Sidebar when routing policy changes. **⚠️ Currently unconsumed** — no component listens for this event yet. See Known Issues #7.

---

## 5. Core Data Flow — Sending a Message

```
User types → handleSendMessage(content, files[]) in Chat.jsx
    │
    ├─ 1. Creates userMsg object: { id, role:'user', content, time, files: [{name,size,type}] }
    │      Files are stored as metadata only (name/size/type) — NOT as File objects (not serialisable)
    │
    ├─ 2. Reads routingPolicy from localStorage
    │
    ├─ 3. Calls getMockRouting(query, file, policy) → { model, cost, confidence, reason, latency }
    │
    ├─ 4. Starts 4-step timeout chain (simulates routing latency):
    │      t1 (1000ms) → setLoadingStep(step2)
    │      t2 (1000ms) → setLoadingStep(step3), setPendingModel(model)
    │      t3 (1000ms) → setLoadingStep('Generating Response...')
    │      t4 (1200ms) → appends assistantMsg to conversationsMessages
    │                   → updates routingStats in localStorage
    │                   → dispatches 'telemetry-updated' event
    │                   → auto-renames chat if it's first message
    │
    └─ All timeout IDs pushed to timeoutRefs.current for cleanup
```

### Regenerate Response Flow

```
User clicks regenerate → handleRegenerateResponse(messageId) in Chat.jsx
    │
    ├─ 1. Finds the assistant message by ID in current conversation
    ├─ 2. Walks backwards to find the preceding user message (prompt)
    ├─ 3. Truncates conversation to remove the old assistant message
    └─ 4. Re-calls handleSendMessage(prompt.content, prompt.files)
```

### Clear Conversation Flow

```
User clicks clear → handleClearConversation() in Chat.jsx
    │
    ├─ 1. Sets active chat's messages to empty array
    └─ 2. Shows toast: "Conversation cleared."
```

---

## 6. Routing Logic — `src/utils/mockRouter.js`

The `getMockRouting(query, file, policy)` function uses keyword matching — **not** a real ML classifier.

**Policy hierarchy (evaluated in order):**

1. **`accuracy`** — Forces premium models regardless of query type:
   - Code/debug keywords → `Claude 3.5 Sonnet`
   - Search/news keywords → `Perplexity Sonar Pro`
   - Image files → `GPT-4o`
   - Documents → `Gemini 1.5 Pro`
   - Default → `GPT-4o`

2. **`cost`** — Forces cheap models:
   - Code → `DeepSeek Coder`
   - Search → `Perplexity Sonar`
   - Image/doc files → `Gemini 1.5 Flash`
   - Default → `GPT-4o-mini`

3. **`balanced`** (default) — Heuristic matching:
   - Image files → `GPT-4o` (vision)
   - PDF/DOCX files → `Gemini 1.5 Pro` (long context)
   - Code/debug → `Claude 3.5 Sonnet`
   - Search/research → `Perplexity Sonar`
   - Documents/summarize → `Gemini 1.5 Pro`
   - Math/logic → `o3-mini`
   - General → `GPT-4o` (fallback)

**To replace with a real router:** swap the `getMockRouting` export with an async function that hits your backend and return the same `{ model, cost, confidence, reason, latency }` shape. Chat.jsx consumes this synchronously right now — you will need to add `await` and make `handleSendMessage` async.

---

## 7. File Attachment System

- `ChatInput.jsx` manages `selectedFiles[]` state locally
- Files can be added via: click (hidden `<input type="file">`), drag-and-drop on the form, or paste from clipboard
- Supported extensions: `pdf, txt, md, doc, docx, png, jpg, jpeg, webp, js, jsx, ts, tsx, py, cpp, java, json`
- Max file size: 20 MB per file
- Duplicate detection by `name + size`
- On submit: `onSubmit(content, selectedFiles)` passes raw `File[]` up to `Chat.jsx`
- In `Chat.jsx`: files are serialised to `{ name, size, type }` metadata before storing in state (raw `File` objects cannot be stored in React state safely across re-renders)
- `ChatMessage.jsx` renders attached files as a stack inside the user bubble using the stored metadata

---

## 8. Toast Notification System

Located in `src/context/ToastContext.jsx`.

- `ToastProvider` wraps the whole app in `main.jsx` (inside `ThemeProvider`)
- Use anywhere with: `const { showToast } = useToast()`
- API: `showToast(message: string, type: 'success' | 'error' | 'info', duration?: number)`
- Default duration: 3000ms
- Toasts auto-dismiss; also have a manual `X` close button
- Positioned fixed bottom-right

---

## 9. Theme System

- `ThemeContext.jsx` manages `'light' | 'dark' | 'system'` mode
- Applied as a `dark` class on `<html>` (Tailwind `dark:` prefix strategy)
- Persisted to `localStorage` under the key `theme`
- Exposes `resolvedTheme` ('light' | 'dark') for components that need to know the actual active mode
- Smooth transitions via temporary `theme-transition` class on `<html>` (200ms ease, removed after 300ms)
- **Theme switcher UX:** Single cycle-on-click button used in **two places**:
  - **Sidebar footer** — cycles `dark → light → system → dark`. Icon updates (Moon / Sun / Laptop). `aria-label` reflects next theme.
  - **Navbar** (desktop and mobile) — same cycle behavior.
- Tailwind classes use `dark:` prefix for dark-mode variants throughout all components

---

## 10. Telemetry Dashboard

- Clicking the "TELEMETRY" badge at the bottom of the Sidebar opens a modal
- Shows: total queries routed, estimated cost savings, per-model utilisation bars, edge node status
- Data source: `routingStats` in `localStorage`, synced via the `telemetry-updated` custom event
- **All data is simulated** — the savings calculation is a hardcoded formula in Chat.jsx, not real API billing data

---

## 11. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + N` | New conversation |
| `Ctrl/Cmd + K` | Focus sidebar search |
| `Ctrl/Cmd + \` | Toggle sidebar collapse |
| `Escape` | Close settings or telemetry modal |

Registered globally in `Sidebar.jsx` via `useEffect` + `window.addEventListener('keydown', ...)`. Uses functional state updates to avoid stale closures.

---

## 12. Navbar & Authentication Modal

### Navbar (`src/components/Navbar.jsx`)

- **Scroll detection:** Adds backdrop blur + stronger border + shadow when `window.scrollY > 10`
- **Desktop:** Logo, nav links (Features, Benefits, Documentation), GitHub link, theme cycle button, Sign In button, "Get Started" CTA
- **Mobile:** Hamburger menu → full-width dropdown with nav links, theme cycle button, GitHub link, Sign In, Get Started
- **Auth trigger:** "Sign In" button opens `AuthenticationComingSoonModal`

### AuthenticationComingSoonModal (`src/components/AuthenticationComingSoonModal.jsx`)

- Framer Motion animated modal with backdrop
- **Focus trap** implemented: Tab cycles within modal, Escape closes
- Shows planned features list: Cloud Chat History, Personalized Routing Preferences, Saved Conversations, Cross-Device Sync, Team Collaboration, Usage Analytics
- Backdrop click dismisses
- Links to `/docs#roadmap`

---

## 13. Component Import Map

Quick reference showing which components are imported where. Useful for identifying orphaned code.

| Component | Imported by |
|---|---|
| `App.jsx` | `main.jsx` |
| `Navbar.jsx` | `Home.jsx`, `Benefits.jsx`, `Documentation.jsx` |
| `Footer.jsx` | `Home.jsx`, `Benefits.jsx` (**NOT** `Documentation.jsx` — see Known Issues #3) |
| `Sidebar.jsx` | `Chat.jsx` |
| `ChatInput.jsx` | `Chat.jsx` |
| `ChatMessage.jsx` | `Chat.jsx` |
| `TypingIndicator.jsx` | `Chat.jsx` |
| `Tooltip.jsx` | `Sidebar.jsx` |
| `AuthenticationComingSoonModal.jsx` | `Navbar.jsx` |
| `RoutingCard.jsx` | **⚠️ NOWHERE — orphaned dead code** |
| `ThemeContext.jsx` | `main.jsx`, `Sidebar.jsx`, `Navbar.jsx` |
| `ToastContext.jsx` | `main.jsx`, `Chat.jsx`, `ChatInput.jsx`, `ChatMessage.jsx` |
| `mockRouter.js` | `Chat.jsx`, `mockRouter.test.js` |
| `animations.js` | `Home.jsx`, `Benefits.jsx` (**NOT** `Documentation.jsx` — see Known Issues #2) |
| `fileHelpers.jsx` | `ChatInput.jsx`, `ChatMessage.jsx` |
| `mockData.js` | `Home.jsx`, `Chat.jsx`, `Sidebar.jsx`, `TypingIndicator.jsx` |

---

## 14. Known Issues & TODOs

| # | File(s) | Issue | Severity |
|---|---|---|---|
| 1 | `RoutingCard.jsx` | **Orphaned dead code** (321 lines, 14KB). Not imported by any component. Was previously imported in `Chat.jsx` with `aria-hidden="true"` but import was removed. The component is well-built (confidence rings, factor bars, accordion details) — either integrate it into `ChatMessage.jsx` as a richer routing display, or delete the file. | 🔴 Dead code |
| 2 | `Documentation.jsx` | **Re-defines `fadeInUp` and `stagger` locally** (lines 25-37) instead of importing from `src/utils/animations.js`. Violates the DRY convention stated in this document. Fix: replace local definitions with `import { fadeInUp, stagger } from '../utils/animations'`. Note: the local definition uses `initial/animate` keys instead of `hidden/show` — the import would need the page to use `hidden/show` variants, or `animations.js` needs an export compatible with both patterns. | 🟡 Convention violation |
| 3 | `Documentation.jsx` | **Hardcodes its own footer markup** (lines 592-604) instead of importing the shared `Footer.jsx` component. Fix: `import Footer from '../components/Footer'` and replace the inline footer. | 🟡 Convention violation |
| 4 | `mockData.js` | **Dead exports that are never imported:** `chatHistory`, `messages`, `routingInfo`, `routingStages`, `terminalQueries`, `suggestedPrompts`, `routingStats`. Only `TERMINAL_EXAMPLES`, `ROUTING_STAGES`, `MODEL_CANDIDATES`, and `defaultStats` are consumed. Safe to delete the unused exports. | 🟡 Dead code |
| 5 | `Tooltip.jsx` | **Hardcodes `bg-[#181818]`** on the tooltip popup — breaks in light mode (dark box on light background). Should use `bg-card-bg` or `bg-sidebar-bg` for theme awareness. | 🟡 Light mode bug |
| 6 | `Navbar.jsx` | **Logo container uses hardcoded dark-mode colors** (`bg-neutral-900`, `border-neutral-800`, `fill="#171717"` in SVG). In light mode the logo area appears as a dark rectangle. Should use theme-aware classes. | 🟡 Light mode bug |
| 7 | `Sidebar.jsx` / `mockRouter.js` | **`policy-updated` event is dispatched but never consumed.** Sidebar dispatches `window.dispatchEvent(new Event('policy-updated'))` when routing policy changes, but no component listens for it. If real-time policy switching mid-session is needed, `Chat.jsx` should listen and re-read `localStorage.getItem('routingPolicy')` on this event. | 🟡 Incomplete |
| 8 | `Chat.jsx` | **Hardcoded response strings** — all assistant replies are static strings. Needs real API integration to become functional. The `isStreaming` prop on `ChatMessage` is accepted but never set to `true`. | 🔵 Planned |
| 9 | `main.jsx` | **No `React.StrictMode`** wrapping. Low priority but recommended for catching side-effect bugs during development. | 🟢 Low |

### Previously Resolved Issues (kept for history)

| # | Issue | Resolution |
|---|---|---|
| A | Stale `currentMessages` closure in auto-rename logic | Fixed — uses functional `setChatHistory` callback |
| B | `defaultStats` object duplicated in Chat.jsx and Sidebar.jsx | Fixed — extracted to `src/data/mockData.js` |
| C | Dual prop API on `ChatMessage.jsx` | Fixed — uses only `message={}` prop |
| D | `formatFileSize` / `getFileIcon` duplicated in ChatInput + ChatMessage | Fixed — moved to `src/utils/fileHelpers.jsx` |
| E | `Tooltip` defined inside Sidebar.jsx | Fixed — moved to `src/components/Tooltip.jsx` |
| F | `RoutingCard` import with `aria-hidden` in Chat.jsx | Fixed — import removed (but file still exists, see #1) |
| G | `text-[11px]` below 12px accessibility floor in ChatInput | Fixed — uses `text-xs` |
| H | Theme dropdown complexity in Sidebar | Fixed — replaced with single cycle-on-click button |
| I | `Documetation.jsx` typo in filename | Fixed — renamed to `Documentation.jsx` |

---

## 15. Working Conventions

### Code Organization
- **No real API calls exist yet.** Every model response is a hardcoded string in `Chat.jsx`'s `handleSendMessage`.
- **File objects are not persisted.** Only metadata (`name`, `size`, `type`) is stored in message state. If you add server-side file processing, upload the raw `File` before serialising.
- **State lives in `Chat.jsx`** — there is no global state manager. Do not introduce Redux/Zustand unless explicitly discussed.
- **localStorage is the cross-component bus** — `routingPolicy`, `routingStats`, and `theme` are the only shared state outside React. Use custom events (`dispatchEvent`) to notify React components of changes.

### Import Conventions — DO NOT VIOLATE
- **Shared animations:** Import `fadeInUp` and `stagger` from `src/utils/animations.js` — **never redefine locally** in page components.
- **Shared footer:** Import `Footer` from `src/components/Footer.jsx` — **never inline footer markup**.
- **Shared file helpers:** Import `formatFileSize` and `getFileIcon` from `src/utils/fileHelpers.jsx` — **never duplicate**.

### Styling Conventions
- **Use CSS custom properties for theme-aware colors:** `bg-app-bg`, `bg-sidebar-bg`, `bg-card-bg`, `border-border-app`, `text-primary`, `text-secondary`, `text-accent-blue`. These are defined in `src/index.css` with light/dark variants.
- **Never hardcode hex values** for colors that should change between themes (e.g., don't use `bg-[#181818]` for backgrounds — use `bg-card-bg`).
- **Use `dark:` prefix** for any Tailwind class that needs dark-mode variants.
- **Static class names only** — never construct dynamic Tailwind class names like `` bg-${color}-500 `` (Tailwind purges them in production). Use static mapping objects instead.

### Code Quality
- **`timeoutRefs.current`** must be cleared at the start of every `handleSendMessage` call (already done) to prevent stale callbacks from previous sends running out of order.
- **Commit messages are informal** — use them as rough labels, not precise changelogs.
- **Test files** live in `src/test/` — check `vite.config.js` for the vitest pattern.

---

## 16. Next Development Milestones

Prioritized list of what to work on next. Agents should consult this before starting work.

### Phase 1 — Cleanup & Polish (No new features)
1. **Delete or integrate `RoutingCard.jsx`** — It's 321 lines of dead code. Either wire it into `ChatMessage.jsx` as a richer routing explainer, or delete the file entirely.
2. **Fix `Documentation.jsx` convention violations** — Import shared `animations.js` and shared `Footer.jsx`. Note the animation variant key difference (`initial/animate` vs `hidden/show`) needs reconciling.
3. **Clean dead `mockData.js` exports** — Remove unused `chatHistory`, `messages`, `routingInfo`, `routingStages`, `terminalQueries`, `suggestedPrompts`, `routingStats`.
4. **Fix light-mode bugs** — `Tooltip.jsx` hardcoded background, `Navbar.jsx` logo dark colors.

### Phase 2 — Feature Wiring
5. **Wire up `policy-updated` event** — Add listener in `Chat.jsx` so changing routing policy mid-session affects the next message immediately.
6. **Enable streaming UI** — `ChatMessage.jsx` already accepts `isStreaming` prop. Set it to `true` during the response generation phase.

### Phase 3 — Real Integration
7. **Real API integration** — Replace `getMockRouting` with async backend calls. Make `handleSendMessage` async. Return the same `{ model, cost, confidence, reason, latency }` shape.
8. **Authentication** — Implement real auth flow (currently just the "coming soon" modal).
9. **Chat persistence** — Save conversations to backend or structured localStorage.
10. **More tests** — Only `mockRouter.test.js` exists. Add component tests for `ChatInput`, `ChatMessage`, `Sidebar`.

---

## 17. CI Pipeline

Every push and pull request to `main` runs three checks in order:

1. **Lint** — `pnpm lint` (ESLint with react-hooks and react-refresh rules)
2. **Test** — `pnpm test:run` (Vitest unit tests, non-watch mode)
3. **Build** — `pnpm build` (Vite production build — catches bad imports and Tailwind purge issues)

CI config: `.github/workflows/ci.yml` — uses pnpm v9, Node 20, with pnpm store caching.

---

## 18. Production-Readiness Audit History (June 2026)

A complete frontend production-readiness audit was conducted previously. The following improvements and fixes were successfully implemented:

### 🔴 Critical Production-Breaking Bugs Fixed
- **Tailwind Purge Mitigation**: Dynamic class names like `` bg-${color}-950/20 `` in `Home.jsx` (feature cards) and `Benefits.jsx` (scenario cards) were replaced with static CSS mapping maps.
- **Ghost Chat on Delete-All**: Fixed edge-case in `Chat.jsx` where deleting all conversations left the user in a broken active state. Now auto-initializes a fresh workspace.

### 🟡 High-Priority Improvements
- **SEO & Metadata**: Added meta descriptions, theme-color tags, and corrected the `<title>` in `index.html`.
- **Light Mode Aesthetics**: Resolved several dark-mode-only hardcoded colors in `TypingIndicator.jsx`, `RoutingCard.jsx`, `ChatInput.jsx`, `Benefits.jsx`, and `Chat.jsx`.
- **Keyboard Shortcuts & Modal Closures**: Refactored global shortcut listener in `Sidebar.jsx` to use functional state updates. Added backdrop click dismiss to Settings and Telemetry modals.
- **Navbar Integration**: Fixed broken GitHub URL in mobile navigation menu.
- **Typo Corrections**: Renamed `Documetation.jsx` to `Documentation.jsx`.

### 🟢 Refactoring & DRYness
- **Shared Footer**: Extracted footer into reusable `Footer.jsx` (note: `Documentation.jsx` was missed — see Known Issues #3).
- **Shared Animation System**: Consolidated Framer Motion variants into `src/utils/animations.js` (note: `Documentation.jsx` was missed — see Known Issues #2).
- **404 Route**: Added proper `NotFound` component in `App.jsx`.
- **Theme Switcher UX**: Replaced theme dropdown with single cycle button.
