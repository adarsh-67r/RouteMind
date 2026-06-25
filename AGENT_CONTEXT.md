# RouteMind — AI Agent Context Document

> **Purpose:** This document is written for AI coding agents (Copilot, Claude, Cursor, Perplexity, etc.) assisting either team member on this codebase. It captures the current architecture, data flows, recent changes, known issues, and working conventions so any agent can get up to speed without reading every file.

---

## 1. Project Overview

RouteMind is a **React + Vite** single-page app that simulates an intelligent AI model router. Users type a query (and optionally attach files), and the app selects the "best" AI model for that task — showing which model was picked, why, what it costs, and how confident the router is.

**Current status:** The routing engine is fully mocked (`src/utils/mockRouter.js`). No real API calls are made to any LLM. All responses are pre-written strings.

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
| Persistence | `localStorage` (routing policy + telemetry stats) |
| Testing | Vitest v4 + React Testing Library v16 |
| CI | GitHub Actions (lint → test → build) |

---

## 3. Directory Structure

```
src/
├── components/
│   ├── ChatInput.jsx       # Text input + file attachment UI
│   ├── ChatMessage.jsx     # Renders user & assistant messages
│   ├── Sidebar.jsx         # Nav, chat history, settings modal, telemetry modal
│   ├── TypingIndicator.jsx # Animated "thinking" indicator
│   └── RoutingCard.jsx     # (Currently unused — imported but hidden in Chat.jsx)
├── context/
│   ├── ThemeContext.jsx     # Light/dark/system theme provider
│   └── ToastContext.jsx     # Global toast notification system
├── pages/
│   ├── Chat.jsx            # Main chat page — holds all app state
│   ├── Home.jsx            # Landing page with terminal simulator
│   ├── Benefits.jsx        # Features/benefits page
│   └── Documetation.jsx    # Documentation page (note: filename has typo)
├── utils/
│   └── mockRouter.js       # Routing logic (keyword matching → model selection)
├── data/
│   └── mockData.js         # Static data (TERMINAL_EXAMPLES, legacy routingStats)
└── main.jsx                # Entry point — wraps app in BrowserRouter > ThemeProvider > ToastProvider
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

**Custom events (for localStorage → React sync):**
- `telemetry-updated` — dispatched by Chat.jsx after updating `routingStats`; Sidebar listens and re-reads localStorage to update its `stats` state
- `policy-updated` — dispatched by Sidebar when routing policy changes (currently not consumed anywhere — future use)

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
    ├─ 4. Starts 3-step timeout chain (simulates routing latency):
    │      t1 (800ms) → setLoadingStep(step2)
    │      t2 (600ms) → setLoadingStep(step3), setPendingModel(model)
    │      t3 (700ms) → setLoadingStep('Generating Response...')
    │                   → appends assistantMsg to conversationsMessages
    │                   → updates routingStats in localStorage
    │                   → dispatches 'telemetry-updated' event
    │                   → auto-renames chat if it's first message
    │
    └─ All timeout IDs pushed to timeoutRefs.current for cleanup
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
   - Math/logic → `GPT-4o`
   - General → `GPT-4o-mini`

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
- Applied as a `data-theme` attribute on `<html>`
- Tailwind classes use `dark:` prefix for dark mode variants
- The Sidebar settings modal has a theme picker (3 options)

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

---

## 12. Known Issues & TODOs

| # | File | Issue | Severity |
|---|---|---|---|
| 1 | `Chat.jsx` | Stale `currentMessages` closure in auto-rename logic — condition checks stale value; should check state inside the `setChatHistory` callback | 🔴 Bug |
| 2 | `Chat.jsx` | `defaultStats` object duplicated — defined identically in both `handleSendMessage` and Sidebar state initialiser; extract to `src/data/mockData.js` | 🟡 DRY |
| 3 | `ChatMessage.jsx` | Dual prop API (`message` object OR individual `role`/`content`/`model` props); all call sites use `message={}`  — remove the flat prop API | 🟡 Confusing |
| 4 | `ChatInput.jsx` + `ChatMessage.jsx` | `formatFileSize` and `getFileIcon` are duplicated identically in both files; move to `src/utils/fileHelpers.js` | 🟡 DRY |
| 5 | `Sidebar.jsx` | `Tooltip` component defined at the bottom of the file — move to `src/components/Tooltip.jsx` | 🟢 Organisation |
| 6 | `RoutingCard.jsx` | Imported in `Chat.jsx` but rendered with `aria-hidden="true"` and never shown — remove the import | 🟢 Dead code |
| 7 | `ChatInput.jsx` | `text-[11px]` on helper labels is below 12px accessibility floor; use `text-xs` | 🟠 Accessibility |
| 8 | `mockRouter.js` | `policy-updated` event dispatched by Sidebar is never consumed — wire it up if real-time policy switching mid-session is needed | 🟡 Incomplete |

---

## 13. Working Conventions

- **No real API calls exist yet.** Every model response is a hardcoded string in `Chat.jsx`'s `handleSendMessage`.
- **File objects are not persisted.** Only metadata (`name`, `size`, `type`) is stored in message state. If you add server-side file processing, upload the raw `File` before serialising.
- **Commit messages are informal** — use them as rough labels, not precise changelogs. See this document for details.
- **localStorage is the cross-component bus** — `routingPolicy` and `routingStats` are the only shared state outside React. Use custom events (`dispatchEvent`) to notify React components of changes.
- **`timeoutRefs.current`** must be cleared at the start of every `handleSendMessage` call (already done) to prevent stale callbacks from previous sends running out of order.
- **Test files** live alongside source or in `__tests__/` — check `vitest.config.js` for the pattern.
