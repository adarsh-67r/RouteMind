# RouteMind — Agent Context

> Last updated: 2026-06-25
> This file is the single source of truth for any AI agent or contributor onboarding to this repository. Keep it in sync with the codebase.

---

## Project Overview

RouteMind is an **intelligent AI model routing platform** with a unified chat interface. A user types a query; a routing engine analyses the prompt and dispatches it to the most suitable AI model automatically, surfacing an explainability panel that tells the user which model was chosen and why.

**Current status:** Hackathon prototype.
- **Frontend** — React SPA, fully functional UI. All routing is client-side mock logic (`src/utils/mockRouter.js`). No real LLM API calls are made.
- **Backend** — FastAPI scaffold committed (`backend/`). Routes and classifier logic are **not yet implemented** — only `/` and `/health` exist. This is the active development area.
- **Deployment** — Frontend deployed to Vercel (`vercel.json` present). Backend not yet deployed.

---

## Architecture Intent (From Pitch Docs)

This section describes the **planned real architecture** the mock currently approximates. Use this when building out the backend.

### Request Lifecycle (target)

1. User submits prompt via React frontend
2. `POST /route` hits the FastAPI backend
3. Feature extraction runs synchronously on the prompt text
4. Classifier inference (fine-tuned DistilBERT-class model) produces a task-class probability distribution
5. Routing engine queries the model scoring table; selects winning provider + model via weighted score (cost × latency × quality benchmark)
6. API call dispatched to selected provider endpoint (OpenAI / Anthropic / Google / etc.)
7. Response streams back through backend → frontend via **SSE**
8. Routing decision metadata written to **Supabase**: model used, confidence score, task class, cost estimate
9. Frontend renders response + explainability panel side by side

### Classifier Design

- **Model type:** Fine-tuned lightweight transformer (DistilBERT-class). NOT an LLM — must run in under 20ms on CPU.
- **Task categories:** `code`, `writing`, `long-document`, `research`, `general-qa`
- **Features extracted per prompt:**
  - Lexical: domain vocabulary, keyword density for code tokens, citation patterns
  - Structural: prompt length, presence of code blocks, file references, URLs
  - Contextual: prior turn task type in multi-turn conversations
- **Confidence threshold:** ~0.7. Below threshold → fallback to default general-purpose model.
- **Compound prompts:** When no single class clears threshold (e.g. code+writing), route to a model that ranks well on both dimensions. Multi-step decomposition is roadmap, not v1.

### Routing Table

Each task category maps to a ranked list of models with:
- `cost_per_token` (from public provider pricing)
- `avg_latency_ms`
- `quality_score` (SWE-bench for code, MT-Bench for general tasks)

A **weighted scoring function** selects the winner. Weights are user-adjustable via a preference slider (speed vs quality vs cost) — maps to the `routingPolicy` concept already in the frontend.

### Provider Adapter Layer

Each provider (OpenAI, Anthropic, Google, etc.) has a thin adapter that normalises their streaming API into a common delta format:
```
{ token: string, done: boolean, metadata: object }
```
Adding a new provider = write one adapter + add models to routing table. No other changes needed.

### Failure Handling

- **Primary model fails (5xx / timeout after 8s):** retry with second-ranked model in same category. Frontend shows "switching model" indicator.
- **All models in category fail:** fall back to default general-purpose model with error note in explainability panel.
- **Provider health:** lightweight ping every 60s, cached. Avoid routing to known-down provider.
- **Rate limits:** track `x-ratelimit-remaining-requests` headers; soft circuit-breaker at 10% of limit.

### Data Storage (Supabase)

Stores **routing decisions only** — not prompt content:
- `prompt_hash`, `task_class`, `model_selected`, `confidence_score`, `latency_ms`, `cost_estimate_usd`, `user_feedback`
- Real-time subscriptions used to push live cost/usage analytics to dashboard without polling.

### Security

- Provider API keys: environment variables on backend — never in the frontend bundle.
- Frontend requests authenticated via Supabase JWT; backend validates token before any provider call.
- Production target: secrets manager (AWS Secrets Manager / HashiCorp Vault), per-user BYOK support.

---

## Repository Layout

```
RouteMind/
├── .github/
│   └── workflows/              # CI pipeline (lint → test → build)
├── backend/                    # FastAPI backend (Clean Architecture)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── classifier/          # Deterministic & extensible intent classification
│   │   │   ├── __init__.py
│   │   │   └── intent_classifier.py # BaseIntentClassifier contract & RuleBasedIntentClassifier
│   │   ├── config.py           # Centralized configuration and environment loading (python-dotenv & Pydantic)
│   │   ├── main.py             # Composition root: CORS middleware, logging, and routing registrations
│   │   ├── providers/           # Swappable LLM provider integration adapters
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Abstract BaseProvider & custom provider exceptions
│   │   │   ├── claude_provider.py # Claude API TODO placeholder
│   │   │   ├── gemini_provider.py # Gemini API TODO placeholder
│   │   │   └── openai_provider.py # Live OpenAI SDK client integration with latency logs
│   │   ├── routes/             # Modular API routes
│   │   │   ├── __init__.py     # Package marker
│   │   │   ├── chat.py         # POST /chat endpoint (mock routing with schema validation)
│   │   │   └── health.py       # GET /health & GET / root welcome endpoints
│   │   ├── schemas/            # Request and response contract validations
│   │   │   ├── __init__.py     # Exposes schemas for external modules
│   │   │   └── chat.py         # Pydantic schemas: ChatRequest and ChatResponse
│   │   └── services/            # Orchestration & routing logic
│   │       ├── __init__.py
│   │       ├── provider_manager.py # Lazy-loading & availability monitor
│   │       └── router.py        # Intent-driven rule router & fallback engine
│   ├── .env                    # Local environment variables configuration
│   ├── requirements.txt        # Python deps: fastapi, uvicorn, pydantic, python-dotenv, openai>=1.0.0
│   └── .gitignore
├── src/
│   ├── main.jsx                # React entry point — mounts App inside StrictMode
│   ├── App.jsx                 # Router setup (react-router-dom), context providers
│   ├── index.css               # Tailwind base + custom keyframes/animations
│   ├── pages/
│   │   ├── Chat.jsx            # PRIMARY PAGE — all chat/session state lives here
│   │   ├── Home.jsx            # Landing page (teammate's frontend work)
│   │   ├── Benefits.jsx        # Benefits/features marketing page
│   │   └── Documentation.jsx  # Docs page
│   ├── components/
│   │   ├── Sidebar.jsx         # Chat history, rename/delete, routing policy, telemetry panel
│   │   ├── ChatMessage.jsx     # Renders user + assistant messages; inline RoutingCard; feedback buttons
│   │   ├── ChatInput.jsx       # Auto-resizing textarea, file attachment, keyboard shortcuts
│   │   ├── TypingIndicator.jsx # Animated loading state with step labels and model preview
│   │   ├── RoutingCard.jsx     # Expandable card: model, confidence, cost, reasoning
│   │   ├── Navbar.jsx          # Top nav for marketing pages; AuthComingSoonModal trigger
│   │   ├── Footer.jsx          # Simple footer for marketing pages
│   │   ├── Tooltip.jsx         # Lightweight tooltip wrapper (hover-based)
│   │   └── AuthenticationComingSoonModal.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx    # Dark/light/system — applied to <html data-theme="...">
│   │   └── ToastContext.jsx    # Global toast system: showToast(message, type)
│   ├── data/
│   │   └── mockData.js        # defaultStats seed for localStorage telemetry; mock model list
│   ├── utils/
│   │   ├── mockRouter.js      # getMockRouting(query, file, policy) — keyword-based mock classifier
│   │   ├── fileHelpers.jsx    # formatFileSize(), getFileIcon()
│   │   └── animations.js      # Framer Motion variant presets
│   └── test/
│       ├── mockRouter.test.js # Vitest unit tests for getMockRouting()
│       └── setup.js           # Vitest global setup (jsdom)
├── index.html                 # Vite entry HTML
├── vercel.json                # Vercel deployment config (rewrites for SPA routing)
├── vite.config.js             # Vite + Vitest config; path alias @ → src/
├── eslint.config.js           # ESLint flat config (react + hooks rules)
├── package.json               # Scripts: dev, build, preview, lint, test, test:run
├── AGENT_CONTEXT.md           # This file
└── README.md                  # Public-facing project overview
```

---

## Backend — Current State (`backend/`)

The backend is refactored into a **Clean Architecture** structure, segregating configuration, route handlers, composition root entrypoints, and validation schemas.

### What exists

#### 1. Composition Root (`app/main.py`)
Initializes the `FastAPI` instance. It configures the CORS middleware using loaded settings, sets up basic console logs with `logging.basicConfig` inside an async `lifespan` manager, and registers routers.

#### 2. Settings Configuration (`app/config.py`)
Uses `python-dotenv` to parse settings from a local `.env` file into a Pydantic `Settings` model. Exposes CORS origins list, environment indicators, and API key placeholders.

#### 3. Modular Routes (`app/routes/`)
* **`health.py`** — GET `/` (Welcome greeting) and GET `/health` (Service operational status details).
* **`chat.py`** — POST `/chat` (Mock routing endpoint verifying the schema and input validation).

#### 4. Validated Schema Contracts (`app/schemas/`)
* **`ChatRequest`** — Request schema validating `message` length/whitespaces, `conversation_id`, `routing_policy` (Literal: `balanced`, `speed`, `cost`, `quality`), list of `attachments`, `user_id`, and default ISO-8601 UTC `timestamp`.
* **`ChatResponse`** — Output serialization contract tracking `response`, `selected_model`, `provider`, `reason`, `confidence`, `processing_time_ms`, `estimated_cost`, and `conversation_id`.

#### 5. AI Provider Adapters (`app/providers/`)
* **`base.py`** — Abstract base class `BaseProvider` and custom local exceptions (`ProviderError`, `ProviderAuthenticationError`, `ProviderAPIError`, `ProviderConnectionError`) mapping vendor SDK errors to RouteMind structures.
* **`openai_provider.py`** — Live integration with official `openai` SDK client, supporting dynamic API keys, structured logging, latency tracking, and error mapping.
* **`claude_provider.py`** — Structurally complete placeholder provider returning `NotImplementedError`.
* **`gemini_provider.py`** — Structurally complete placeholder provider returning `NotImplementedError`.

#### 6. Routing & Orchestration (`app/services/`)
* **`provider_manager.py`** — Singleton-like manager loading, lazy-caching, and health-checking provider adapter instances.
* **`router.py`** — Rule-based `LLMRouter` resolving task intent and policy into a `RoutingDecision`, with support for fallback providers when a preferred choice goes offline.

#### 7. Intent Classification (`app/classifier/`)
* **`intent_classifier.py`** — Defines standard contract `BaseIntentClassifier` and `RuleBasedIntentClassifier` which uses keyword regex heuristics to detect intents and calculate scaling confidence scores.

### What needs to be built

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` (Router/Classifier wiring) | POST | Replace static handler in `app/routes/chat.py` with the newly created classifier, router, and provider manager. |
| `/chat` (SSE Streaming) | POST | Transition response delivery from synchronous JSON to Server-Sent Events (SSE). |
| `/chat` (Supabase Logging) | POST | Log routing telemetry metadata (prompt hash, model, latency, cost) to Supabase db. |
| `/feedback` | POST | Log user override/thumbs-down for classifier retraining signal. |
| `/health/providers` | GET | Return cached provider health status (ping results). |

### Python dependencies (requirements.txt)

Currently includes: `fastapi 0.138.0`, `uvicorn 0.49.0`, `pydantic 2.13.4`, `python-dotenv 1.2.2`, `openai>=1.0.0` (installed). Missing for full implementation:
- `anthropic`, `google-generativeai` — provider SDKs (currently mock/placeholder)
- `httpx` — async HTTP for provider calls + health pings
- `supabase` — DB client for routing decision logging

### Running locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Frontend — Routing & Page Structure

`App.jsx` wraps everything in `ThemeProvider` and `ToastProvider`, then uses `react-router-dom`:

| Route       | Component           | Notes                                    |
| ----------- | ------------------- | ---------------------------------------- |
| `/`         | `Home.jsx`          | Landing page with Navbar + Footer        |
| `/chat`     | `Chat.jsx`          | Main product interface; no Navbar/Footer |
| `/benefits` | `Benefits.jsx`      | Marketing page                           |
| `/docs`     | `Documentation.jsx` | Docs page                                |

`vercel.json` contains a rewrite rule so all routes return `index.html` (standard SPA deployment pattern).

---

## Core State — `Chat.jsx`

All session state is owned by `Chat.jsx` and passed down as props. No global state store (no Redux, no Zustand).

### State Variables

| Variable                | Type                            | Purpose                                                                      |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `activeChatId`          | `string`                        | ID of the currently visible conversation                                     |
| `chatHistory`           | `Array<{id, title, timestamp}>` | Sidebar list of all sessions                                                 |
| `conversationsMessages` | `Record<chatId, Message[]>`     | All messages keyed by chat ID                                                |
| `isLoading`             | `boolean`                       | True while the simulated routing pipeline runs                               |
| `loadingStep`           | `string`                        | Current step label shown in `TypingIndicator`                                |
| `pendingModel`          | `string \| null`                | Model name revealed partway through loading animation                        |
| `timeoutRefs`           | `useRef(Array)`                 | All active `setTimeout` handles; cleared on unmount and before each new send |

### Message Shape

```js
{
  id: string,           // e.g. "user-101", "assistant-102"
  role: 'user' | 'assistant',
  content: string,
  time: string,         // display string, e.g. "Just now" or "2h ago"
  files?: Array<{       // only on user messages with attachments
    name: string,
    size: number,
    type: string
  }>,
  routing?: {           // only on assistant messages
    model: string,
    cost: string,       // e.g. "$0.0048"
    confidence: string, // e.g. "99%"
    reason: string
  }
}
```

### Key Handlers

- **`handleSendMessage(content, attachedFiles)`** — captures `activeChatId` at send time (`chatIdAtSend`) to prevent stale-closure bugs. Runs a 4-step `setTimeout` chain (~4.2s total) simulating: intent analysis → model comparison → model selection → response generation. On completion, updates `conversationsMessages`, writes telemetry to `localStorage`, and auto-renames the chat on first message. All timer handles stored in `timeoutRefs` and cancelled on unmount.
- **`handleRegenerateResponse(messageId)`** — slices message array back to before target assistant message, calls `handleSendMessage` with the preceding user message.
- **`handleNewChat(newChat)`** — adds entry to `chatHistory`, sets it active, initialises its messages array.
- **`handleDeleteChat(id)`** — removes chat and messages. Creates new blank chat if all deleted.
- **`handleRenameChat(id, newTitle)`** — updates title in `chatHistory`.
- **`handleClearConversation()`** — empties messages for active chat; shows a toast.

---

## `getMockRouting` — `src/utils/mockRouter.js`

**Signature:** `getMockRouting(query: string, file: File | null, policy: string): RoutingResult`

This is the **frontend mock** of the classifier. When the real backend `/route` endpoint is implemented, this module will be replaced by an API call.

**Policies** (read from `localStorage` key `routingPolicy`, default `'balanced'`):

- `'speed'` — biases toward low-latency models (Gemini Flash, GPT-4o mini)
- `'cost'` — biases toward cheapest models (DeepSeek, Gemini Flash)
- `'quality'` — biases toward frontier models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)
- `'balanced'` — default, weighted scoring across latency, cost, and capability

**Classification logic (keyword-based, in priority order):**

1. File attachment present → `Gemini 1.5 Pro` (document) or `GPT-4o` (image)
2. `code / rust / python / javascript / debug / function / algorithm` → `Claude 3.5 Sonnet`
3. `react / next.js / remix / vue / svelte / frontend` → `Claude 3.5 Sonnet`
4. `research / paper / study / analysis / compare` → `Perplexity`
5. `explain / summarize / what is / how does` → `GPT-4o`
6. `write / essay / blog / email / draft` → `GPT-4o`
7. `math / calculate / equation / formula` → `GPT-4o` (with reasoning note)
8. `translate / language / spanish / french` → `GPT-4o mini`
9. `image / draw / generate / create a picture` → `DALL-E 3` (note: no real image generation)
10. Default fallback → `GPT-4o` (balanced)

**Returns:** `{ model, cost, confidence, reason, latency }` — all strings for display.

> **Migration note:** When the real backend is ready, replace calls to `getMockRouting()` in `Chat.jsx` with a `fetch('http://localhost:8000/route', { method: 'POST', body: JSON.stringify({ query, file_ref, policy }) })` call, consuming the SSE stream.

---

## `Sidebar.jsx` — Detailed Notes

The sidebar is the most complex component. Key sub-sections:

- **Chat list** — scrollable, with inline rename (double-click title) and delete (hover → trash icon). Active item: `bg-blue-950/30 text-white` (no colored side border).
- **Routing policy selector** — `<select>` reads/writes `localStorage('routingPolicy')`. Emits `storage` event on change so `Chat.jsx` reads latest value at send time.
- **Telemetry panel** — shows `totalQueries`, `savings`, model breakdown pie. Reads from `localStorage('routingStats')` on mount and on `telemetry-updated` window event (fired by `Chat.jsx` after each response). `defaultStats` from `src/data/mockData.js` seeds empty state.
- **Theme toggle** — wired to `ThemeContext`. Cycles `'light'` → `'dark'` → `'system'`. Applied to `<html data-theme="...">` by `ThemeContext.jsx`.
- **`Tooltip.jsx`** — imported from `src/components/Tooltip.jsx`. Hover-only; not keyboard/screen-reader accessible yet.
- **Mobile** — controlled by `mobileOpen` prop from `Chat.jsx`. Fixed overlay with backdrop below `md` breakpoint.

---

## `ChatMessage.jsx` — Detailed Notes

Handles both `role: 'user'` and `role: 'assistant'` in a single component.

- **Prop contract:** single `message` object (dual-prop API from earlier version removed).
- **`CodeBlock`** — uses `react-syntax-highlighter` (Prism / `vscDarkPlus`). Inline detection: `!match || !String(children).includes('\n')`.
- **`markdownComponents`** — custom renderers for `react-markdown` + `remark-gfm`: headings, paragraphs, lists, blockquotes, links, tables, code.
- **`SkeletonMessage`** — rendered when `role === 'assistant'`, content empty, not streaming. Uses `animate-pulse`.
- **Action toolbar** — appears on hover. User: Copy + Share. Assistant: Copy + Regenerate + ThumbsUp + ThumbsDown + Share.
- **`RoutingCard`** rendered inline below assistant content when `message.routing` is present.

---

## `RoutingCard.jsx` — Detailed Notes

Expandable card showing routing decision for each assistant message.

- Takes single `routing` prop: `{ model, cost, confidence, reason }`.
- Collapsed: model badge, cost, confidence percentage.
- Expanded: adds `reason` text and visual model indicator.
- Actively used — rendered inside `ChatMessage.jsx` for every assistant message with a `routing` object.

---

## `ChatInput.jsx` — Detailed Notes

- Auto-resizing `<textarea>` via `useEffect` on `value`. Clamped 56px–200px.
- File attachment via hidden `<input type="file">`. Accepted: `.pdf`, `.txt`, `.md`, `.doc`, `.docx`, `.csv`, `.json`, `.png`, `.jpg`, `.jpeg`, `.webp`.
- **Keyboard:** `Enter` submits; `Shift+Enter` newline.
- **Known issue:** Helper text uses `text-[11px]` — below the 12px accessibility floor. Should be `text-xs`.

---

## `TypingIndicator.jsx` — Detailed Notes

Shown while `isLoading === true`.

- Props: `loadingStep` (step label string), `selectedModel` (null until step 3).
- Step labels: "Analyzing Intent…" → "Comparing Models…" → "Selecting Best Model…" → "Generating Response…"
- When `selectedModel` is non-null (step 3), renders model badge preview inside the indicator.

---

## Context Providers

### `ThemeContext.jsx`

- Provides `{ theme, setTheme }` — values: `'light'`, `'dark'`, `'system'`.
- Sets `document.documentElement.setAttribute('data-theme', resolved)` on mount and on every change.
- Used by: `Sidebar.jsx`, `Navbar.jsx`.

### `ToastContext.jsx`

- Provides `showToast(message: string, type: 'success' | 'error' | 'info')`.
- Renders toast stack in fixed portal at bottom-right.
- Used by: `Chat.jsx`, `ChatMessage.jsx`, `ChatInput.jsx`, `Sidebar.jsx`.

---

## Data Layer

### `src/data/mockData.js`

- `defaultStats` — `{ totalQueries: 0, savings: 0, models: {} }` — seed for `localStorage('routingStats')`.
- `modelList` — model descriptor objects for UI dropdowns.

### `localStorage` keys

| Key             | Written by              | Read by                 | Purpose                   |
| --------------- | ----------------------- | ----------------------- | ------------------------- |
| `routingPolicy` | Sidebar policy selector | `Chat.jsx` at send time | Active routing preference |
| `routingStats`  | `Chat.jsx` post-response| Sidebar telemetry panel | Cumulative session stats  |

---

## Test Suite — `src/test/`

| File                 | What it covers                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `mockRouter.test.js` | `getMockRouting()` — code queries, research queries, file attachments, policy overrides, fallback |
| `setup.js`           | `@testing-library/jest-dom` import                                                           |

Run: `pnpm test:run` (single pass) or `pnpm test` (watch).
CI runs `pnpm test:run` after `lint`.

---

## CI Pipeline — `.github/workflows/`

Three sequential jobs:

1. **lint** — `pnpm lint`
2. **test** — `pnpm test:run`
3. **build** — `pnpm build`

---

## Deployment

- **Frontend:** Vercel. `vercel.json` contains an SPA rewrite rule (`/* → /index.html`). Push to `main` triggers auto-deploy.
- **Backend:** Not yet deployed. Planned target: Railway (mentioned in pitch docs as the hosting choice for the FastAPI service).

---

## Known Issues & Pending Work

| Area                | Issue                                                                                      | Priority |
| ------------------- | ------------------------------------------------------------------------------------------ | -------- |
| `backend/`          | Core LLM routing and classifier integration missing in `/chat` endpoint                     | **High** |
| `backend/`          | `requirements.txt` missing provider SDKs (`openai`, `anthropic`, `httpx`, `supabase`)     | **High** |
| `ChatInput.jsx`     | `text-[11px]` on helper text — below 12px a11y floor, should be `text-xs`                 | Low      |
| `Sidebar.jsx`       | `Tooltip.jsx` not keyboard/screen-reader accessible                                        | Low      |
| `Chat.jsx`          | `handleNewChat` in header button is an inline lambda; should call the shared function      | Low      |
| All pages           | No real API integration — all routing is mock                                              | Future   |
| Auth flow           | `AuthenticationComingSoonModal` is a placeholder; no auth system exists                    | Future   |
| `Documentation.jsx` | Content is static/hardcoded                                                                | Future   |

---

## Dependency Notes

### Frontend (package.json)

| Package                         | Purpose                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `react` + `react-dom`           | UI framework                                                    |
| `react-router-dom`              | Client-side routing                                             |
| `react-markdown` + `remark-gfm` | Markdown rendering in assistant messages                        |
| `react-syntax-highlighter`      | Code block syntax highlighting (Prism / vscDarkPlus)            |
| `lucide-react`                  | Icon set                                                        |
| `framer-motion`                 | Animation — landing/benefits pages and transitions              |
| `tailwindcss` (v4)              | Styling — utility classes + custom design tokens in `index.css` |

### Backend (requirements.txt)

| Package          | Purpose                    |
| ---------------- | -------------------------- |
| `fastapi 0.138`  | API framework              |
| `uvicorn 0.49`   | ASGI server                |
| `pydantic 2.13`  | Request/response schemas   |
| `python-dotenv`  | `.env` loading             |

---

## Design Tokens (index.css)

Custom Tailwind tokens under `@theme`:

| Token               | Usage                             |
| ------------------- | --------------------------------- |
| `bg-app-bg`         | Page background (dark: `#0E0E0E`) |
| `bg-card-bg`        | Card/input surfaces               |
| `bg-sidebar-bg`     | Sidebar background                |
| `border-border-app` | All borders                       |
| `text-primary`      | Primary text                      |
| `text-secondary`    | Muted/secondary text              |

Custom animations: `animate-slide-up-fade`, `animate-slide-in-right`, `stagger-1` through `stagger-4` — defined as `@keyframes` in `index.css`.
