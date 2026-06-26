# RouteMind — Agent Context

> Last updated: 2026-06-26  
> This file is the single source of truth for any AI agent or contributor onboarding to this repository. Keep it in sync with the codebase.

---

## Project Overview

RouteMind is an **intelligent AI model routing platform** with a unified chat interface. A user types a query; the routing engine analyses the prompt, dispatches it to the most suitable AI model automatically, and surfaces an explainability panel showing which model was chosen and why.

**Current status:**

- **Frontend** — React SPA fully functional. Client service layer (`src/services/api.js` + `chatService.js`) calls the real FastAPI `/chat` endpoint; `mockRouter.js` is preserved as a legacy fallback.
- **Backend** — FastAPI service operational. Rule-based intent classifier, model-policy router, lazy-cached provider manager, and OpenAI adapter are all wired together and working. Claude and Gemini adapters exist as structural placeholders only.
- **Deployment** — Frontend deployed to Vercel (`vercel.json` present). Backend not yet deployed.

---

## Architecture Intent (From Pitch Docs)

### Request Lifecycle (target)

1. User submits prompt via React frontend
2. `POST /chat` hits the FastAPI backend
3. `RuleBasedIntentClassifier` classifies prompt → intent + confidence
4. `LLMRouter` resolves intent × policy → `RoutingDecision` (provider, model, reason)
5. `ProviderManager` returns a cached, health-checked provider instance
6. Provider adapter calls downstream LLM SDK
7. Response streams back via **SSE** (planned — currently full JSON)
8. Routing metadata written to **Supabase** (planned)
9. Frontend renders response + `RoutingCard` explainability panel

### Classifier Design

- **Current impl:** `RuleBasedIntentClassifier` — regex keyword matching with scaling confidence heuristics. Runs in < 1 ms.
- **Target impl:** Fine-tuned lightweight transformer (DistilBERT-class). Must run < 20 ms on CPU.
- **Intents:** `coding`, `research`, `document`, `reasoning`, `writing`, `general`
- **Confidence threshold:** ~0.7. Below threshold → fallback to `general` intent.

### Provider Adapter Layer

Each provider implements `BaseProvider` (ABC):

```python
async def complete(self, prompt: str, model: str, **kwargs) -> dict
async def health_check(self) -> bool
```

Adding a new provider = implement `BaseProvider` + register in `ProviderManager`. No other changes.

Normalised delta format (target for streaming):

```
{ token: string, done: boolean, metadata: object }
```

### Failure Handling

- Primary provider fails (5xx / timeout): retry with next in fallback chain.
- Fallback chain: `openai` → `gemini` → `claude`
- Provider health: `health_check()` cached per `ProviderManager` instance. `get_available_providers()` filters to healthy-only.
- Rate limits: `x-ratelimit-remaining-requests` tracking planned.

---

## Repository Layout

```
RouteMind/
├── .github/workflows/ci.yml         # lint → test → build
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── classifier/
│   │   │   ├── __init__.py
│   │   │   └── intent_classifier.py
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── providers/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── openai_provider.py   # ✅ Live
│   │   │   ├── claude_provider.py   # ⚠️ Placeholder
│   │   │   └── gemini_provider.py   # ⚠️ Placeholder
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py
│   │   │   └── health.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── chat.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── provider_manager.py
│   │       └── router.py
│   ├── .env
│   ├── requirements.txt
│   └── tests/
│       ├── __init__.py
│       ├── test_classifier.py
│       ├── test_router.py
│       ├── test_provider_manager.py
│       └── test_chat_endpoint.py
├── src/
│   ├── components/
│   │   ├── AuthenticationComingSoonModal.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── RoutingCard.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TelemetryModal.jsx
│   │   ├── Tooltip.jsx
│   │   └── TypingIndicator.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── data/mockData.js
│   ├── pages/
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Benefits.jsx
│   │   └── Documentation.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── chatService.js
│   ├── utils/
│   │   ├── animations.js
│   │   ├── fileHelpers.jsx
│   │   └── mockRouter.js
│   ├── test/
│   │   ├── mockRouter.test.js
│   │   └── setup.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vercel.json
├── vite.config.js
├── eslint.config.js
├── package.json
├── AGENT_CONTEXT.md
└── README.md
```

---

## Backend — File-by-File Reference

### `app/main.py`

Composition root. Creates the `FastAPI` instance inside an async `lifespan` context manager that runs `logging.basicConfig` on startup. Attaches `CORSMiddleware` using `settings.cors_origins`. Registers `health_router` and `chat_router` with no prefix.

### `app/config.py`

Pydantic `Settings` model loaded from `backend/.env` via `python-dotenv`.

**Current declared fields:**

```python
OPENAI_API_KEY: str = ""
CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]
ENVIRONMENT: str = "development"
DEBUG: bool = False
API_VERSION: str = "1.0.0"
```

> ⚠️ **Bug #4:** `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` are not declared here. Adding them is required before implementing those providers.  
> ⚠️ **Bug #6:** `CORS_ORIGINS` default missing `http://localhost:5173` (Vite dev port) and any Vercel production URL.

### `app/schemas/chat.py`

Two Pydantic v2 models:

**`ChatRequest`** fields: `message` (str, stripped, 1–4000 chars), `conversation_id` (str, default uuid4), `routing_policy` (Literal `balanced|speed|cost|quality`, default `balanced`), `attachments` (list[str], default []), `user_id` (str, default `anonymous`), `timestamp` (datetime, default utcnow).

**`ChatResponse`** — nested structure:

```python
response: {
    content: str,
    conversation_id: str,
    attachments: list[str]
}
routing: {
    intent: str,
    provider: str,
    selected_model: str,
    routing_policy: str,
    confidence: float,
    reason: str,
    estimated_cost: float,
    processing_time_ms: float
}
metadata: {
    request_id: str,
    timestamp: str,
    status: str,
    api_version: str
}
```

### `app/routes/health.py`

- `GET /` → `{"message": "Welcome to RouteMind API", "version": ..., "status": "operational"}`
- `GET /health` → `{"status": "healthy", "environment": ..., "providers": [...], "version": ...}`

Health route calls `provider_manager.list_registered_providers()` (not health-checked — returns all registered names).

### `app/routes/chat.py`

The core pipeline endpoint. Execution order:

1. `classifier.classify(request.message)` → `(intent, confidence)`
2. `llm_router.route(intent, request.routing_policy)` → `RoutingDecision`
3. `provider_manager.get_provider(routing_decision.provider)` → provider instance
4. `provider.complete(request.message, routing_decision.model)` → raw response
5. Build `ChatResponse` and return

> ⚠️ **Bug #5 (Critical):** Step 2 calls `provider_manager.list_registered_providers()` internally at route time — not `get_available_providers()`. This means Claude and Gemini appear as valid routing targets even though their `health_check()` always returns `False`. Requests routed to them will raise `NotImplementedError` at step 4 and fall through to the mock fallback.  
> ⚠️ **Bug #10:** `estimated_cost` is calculated as `tokens × 0.000015` flat regardless of which provider or model tier was selected.

### `app/providers/base.py`

Abstract base class:

```python
class BaseProvider(ABC):
    @abstractmethod
    async def complete(self, prompt: str, model: str, **kwargs) -> dict: ...
    @abstractmethod
    async def health_check(self) -> bool: ...
```

Exception hierarchy:

- `ProviderError` (base)
  - `ProviderAuthenticationError`
  - `ProviderAPIError`
  - `ProviderConnectionError`

### `app/providers/openai_provider.py`

Fully implemented. Uses official `openai` SDK (`AsyncOpenAI`). Reads `OPENAI_API_KEY` from settings. `complete()` calls `client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt}])` and returns `{content, model, tokens, latency_ms}`. `health_check()` calls `client.models.list()` and returns `True`/`False`.

Maps SDK exceptions → `ProviderAuthenticationError`, `ProviderConnectionError`, `ProviderAPIError`.

### `app/providers/claude_provider.py`

> ⚠️ **Bug #1 (High):** Every method raises `NotImplementedError`. The class structure is correct and ready to implement with the `anthropic` SDK.

### `app/providers/gemini_provider.py`

> ⚠️ **Bug #2 (High):** Every method raises `NotImplementedError`. The class structure is correct and ready to implement with the `google-generativeai` SDK.

### `app/services/provider_manager.py`

Singleton-like manager. Lazy-initialises providers on first call. Exposes:

- `get_provider(name: str) -> BaseProvider` — returns cached instance, initialises if needed
- `list_registered_providers() -> list[str]` — returns all registered names (no health check)
- `get_available_providers() -> list[str]` — runs `health_check()` on each, returns healthy-only

Registered providers: `openai`, `claude`, `gemini`.

### `app/services/router.py`

`LLMRouter` maps intent × policy → `RoutingDecision(provider, model, reason, confidence)`.

**Intent → model mapping (actual values from source):**

| Intent      | `balanced`/`cost` model | `speed` model        | `quality` model                     |
| :---------- | :---------------------- | :------------------- | :---------------------------------- |
| `coding`    | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `openai/gpt-4o`                     |
| `research`  | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `gemini/gemini-1.5-pro`             |
| `document`  | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `claude/claude-3-5-sonnet-20241022` |
| `reasoning` | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `openai/gpt-4o`                     |
| `writing`   | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `claude/claude-3-5-sonnet-20241022` |
| `general`   | `openai/gpt-4o-mini`    | `openai/gpt-4o-mini` | `openai/gpt-4o`                     |

> ⚠️ **Bug #9:** `balanced` and `cost` map to identical models. No cost-weighted scoring is implemented.

Fallback chain (if selected provider unavailable): `openai` → `gemini` → `claude`.

### `app/classifier/intent_classifier.py`

`RuleBasedIntentClassifier` uses per-intent regex keyword lists. Confidence = `min(1.0, matches / total_keywords * scaling_factor)`. Returns `(intent, confidence)`.

> ⚠️ **Bug #8:** When two intents score equally, the winner depends on Python dict iteration order (non-deterministic across runs).

### `requirements.txt`

Currently installed:

```
fastapi==0.138.0
uvicorn==0.49.0
pydantic==2.13.4
python-dotenv==1.2.2
openai>=1.0.0
```

> ⚠️ **Bug #3 (High):** Missing packages needed for full implementation:

| Package               | Needed for                            |
| :-------------------- | :------------------------------------ |
| `anthropic`           | Claude provider SDK                   |
| `google-generativeai` | Gemini provider SDK                   |
| `pytest`              | Backend test runner                   |
| `httpx`               | Async HTTP (health pings, future SSE) |
| `supabase`            | Routing decision logging (roadmap)    |

---

## Known Bugs — Full List

| #   | Severity  | File                   | Description                                                                                             |
| :-- | :-------- | :--------------------- | :------------------------------------------------------------------------------------------------------ |
| 1   | 🔴 High   | `claude_provider.py`   | All methods raise `NotImplementedError` — no live Claude calls                                          |
| 2   | 🔴 High   | `gemini_provider.py`   | All methods raise `NotImplementedError` — no live Gemini calls                                          |
| 3   | 🔴 High   | `requirements.txt`     | Missing `anthropic`, `google-generativeai`, `pytest`                                                    |
| 4   | 🔴 High   | `config.py`            | `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` not declared in `Settings`                                       |
| 5   | 🟡 Medium | `routes/chat.py`       | Uses `list_registered_providers()` not `get_available_providers()` — dead providers treated as routable |
| 6   | 🟡 Medium | `config.py`            | `CORS_ORIGINS` default missing `localhost:5173` and Vercel prod URL                                     |
| 7   | 🟡 Medium | `services/api.js`      | 15 s timeout too short for GPT-4o / Gemini Pro on long responses                                        |
| 8   | 🟢 Low    | `intent_classifier.py` | Intent tie-breaking non-deterministic (dict iteration order)                                            |
| 9   | 🟢 Low    | `router.py`            | `balanced` and `cost` map to identical models — no real cost scoring                                    |
| 10  | 🟢 Low    | `routes/chat.py`       | Flat `tokens × 0.000015` cost formula ignores provider/model tier                                       |
| 11  | 🟢 Low    | `ChatInput.jsx`        | `text-[11px]` on helper text — below 12 px a11y floor                                                   |
| 12  | 🟢 Low    | `Tooltip.jsx`          | Hover-only — not keyboard/screen-reader accessible                                                      |
| 13  | 🟢 Low    | `Chat.jsx`             | `handleNewChat` in header is an inline lambda instead of shared handler                                 |
| 14  | 🟢 Low    | `chatService.js`       | No SSE streaming — full response buffered before render                                                 |

---

## Frontend — Routing & Page Structure

`App.jsx` wraps everything in `ThemeProvider` → `ToastProvider`, then `react-router-dom`:

| Route       | Component           | Notes                                    |
| :---------- | :------------------ | :--------------------------------------- |
| `/`         | `Home.jsx`          | Landing page with Navbar + Footer        |
| `/chat`     | `Chat.jsx`          | Main product interface; no Navbar/Footer |
| `/benefits` | `Benefits.jsx`      | Marketing page                           |
| `/docs`     | `Documentation.jsx` | Docs page                                |

`vercel.json` rewrites all routes to `index.html` (standard SPA pattern).

---

## Core State — `Chat.jsx`

All session state owned by `Chat.jsx`, passed as props. No global store.

### State Variables

| Variable                | Type                            | Purpose                                              |
| :---------------------- | :------------------------------ | :--------------------------------------------------- |
| `activeChatId`          | `string`                        | ID of the currently visible conversation             |
| `chatHistory`           | `Array<{id, title, timestamp}>` | Sidebar session list                                 |
| `conversationsMessages` | `Record<chatId, Message[]>`     | All messages keyed by chat ID                        |
| `isLoading`             | `boolean`                       | True while routing pipeline animation runs           |
| `loadingStep`           | `string`                        | Current step label shown in `TypingIndicator`        |
| `pendingModel`          | `string \| null`                | Model name revealed at step 3 of loading animation   |
| `timeoutRefs`           | `useRef(Array)`                 | All active `setTimeout` handles — cleared on unmount |

### Message Shape

```js
{
  id: string,           // e.g. "user-101", "assistant-102"
  role: 'user' | 'assistant',
  content: string,
  time: string,         // e.g. "Just now"
  files?: Array<{ name, size, type }>,   // user messages only
  routing?: {           // assistant messages only
    model: string,
    cost: string,       // e.g. "$0.0048"
    confidence: string, // e.g. "99%"
    reason: string
  }
}
```

### Key Handlers

- **`handleSendMessage(content, attachedFiles)`** — captures `activeChatId` at send time to prevent stale-closure bugs. Runs 4-step `setTimeout` chain (~4.2 s total) for animation. On completion, calls real `chatService.sendMessage()`, updates `conversationsMessages`, writes telemetry to `localStorage`, auto-renames chat on first message.
- **`handleRegenerateResponse(messageId)`** — slices messages back to before the target assistant message, re-calls `handleSendMessage` with preceding user content.
- **`handleNewChat(newChat)`** — adds to `chatHistory`, sets active, initialises message array.
- **`handleDeleteChat(id)`** — removes chat + messages. Creates a blank chat if all are deleted.
- **`handleRenameChat(id, newTitle)`** — updates title in `chatHistory`.
- **`handleClearConversation()`** — empties messages for active chat, shows toast.

---

## Service Layer — `src/services/`

### `api.js`

- `get(endpoint, timeout?)` and `post(endpoint, body, timeout?)` — generic async fetch wrappers.
- Base URL: `import.meta.env.VITE_API_URL` defaulting to `http://localhost:8000`.
- Timeout: `AbortController` with 15 000 ms default. ⚠️ See Bug #7.
- Error wrapping: extracts `detail` from non-OK responses, attaches as `{ cause }`.

### `chatService.js`

- `sendMessage(message, conversationId, routingPolicy, attachments, userId)` → `POST /chat`
- `healthCheck()` → `GET /health`

---

## Policies & Router Logic

| Policy     | Behaviour               | Current Implementation                               |
| :--------- | :---------------------- | :--------------------------------------------------- |
| `quality`  | Frontier models         | GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro per intent |
| `speed`    | Low-latency             | GPT-4o-mini across all intents                       |
| `balanced` | Cost + quality tradeoff | ⚠️ Same as `cost` — not differentiated               |
| `cost`     | Cheapest option         | GPT-4o-mini across all intents                       |

---

## Sidebar — Detailed Notes

- **Chat list** — scrollable, inline rename (double-click), delete (hover → trash). Active item: `bg-blue-950/30`.
- **`SettingsModal.jsx`** — `<select>` reads/writes `localStorage('routingPolicy')`, emits `policy-updated` window event.
- **`TelemetryModal.jsx`** — reads `localStorage('routingStats')` on mount and on `telemetry-updated` event. Seeded from `defaultStats` in `mockData.js`.
- **Theme toggle** — cycles `light` → `dark` → `system` via `ThemeContext`.
- **`Tooltip.jsx`** — hover-only. ⚠️ See Bug #12.
- **Mobile** — controlled by `mobileOpen` prop. Fixed overlay with backdrop below `md`.

---

## `ChatMessage.jsx` — Detailed Notes

- Handles both `user` and `assistant` roles in one component.
- `CodeBlock` uses `react-syntax-highlighter` Prism / `vscDarkPlus`. Inline detection: `!match || !String(children).includes('\n')`.
- `SkeletonMessage` rendered when `role === 'assistant'`, content empty, not yet streaming.
- Action toolbar on hover: Copy + Share (user); Copy + Regenerate + ThumbsUp + ThumbsDown + Share (assistant).
- `RoutingCard` rendered below assistant content when `message.routing` is present.

---

## Context Providers

### `ThemeContext.jsx`

Provides `{ theme, setTheme }`. Values: `'light'`, `'dark'`, `'system'`. Sets `document.documentElement.setAttribute('data-theme', resolved)` on every change.

### `ToastContext.jsx`

Provides `showToast(message, type: 'success'|'error'|'info')`. Renders fixed toast stack at bottom-right.

---

## Data Layer

### `src/data/mockData.js`

- `defaultStats` — `{ totalQueries: 0, savings: 0, models: {} }` — seed for `localStorage('routingStats')`.
- `modelList` — model descriptor objects for UI dropdowns.

### `localStorage` Keys

| Key             | Written by               | Read by                 | Purpose                   |
| :-------------- | :----------------------- | :---------------------- | :------------------------ |
| `routingPolicy` | Sidebar policy selector  | `Chat.jsx` at send time | Active routing preference |
| `routingStats`  | `Chat.jsx` post-response | Sidebar telemetry panel | Cumulative session stats  |

---

## Test Suite

### Frontend (`src/test/`)

| File                 | Coverage                                                                             |
| :------------------- | :----------------------------------------------------------------------------------- |
| `mockRouter.test.js` | `getMockRouting()` — code queries, research, attachments, policy overrides, fallback |
| `setup.js`           | `@testing-library/jest-dom` import                                                   |

Run: `pnpm test:run` (single pass) or `pnpm test` (watch). CI runs `pnpm test:run` after lint.

### Backend (`backend/tests/`)

| File                       | Coverage                                                |
| :------------------------- | :------------------------------------------------------ |
| `test_classifier.py`       | `RuleBasedIntentClassifier` intent detection            |
| `test_router.py`           | `LLMRouter` policy resolution and fallback              |
| `test_provider_manager.py` | Provider lazy-loading and health checks                 |
| `test_chat_endpoint.py`    | `POST /chat` schema validation and pipeline integration |

Run: `python -m pytest tests/ -v` from `backend/`.

> ⚠️ **Bug #3:** `pytest` is not in `requirements.txt` — install separately or add it.

---

## CI Pipeline — `.github/workflows/ci.yml`

1. **lint** — `pnpm lint`
2. **test** — `pnpm test:run`
3. **build** — `pnpm build`

---

## Deployment

- **Frontend:** Vercel. `vercel.json` SPA rewrite (`/* → /index.html`). Push to `main` = auto-deploy.
- **Backend:** Not yet deployed. Planned target: Railway.

---

## Design Tokens (`index.css`)

Custom Tailwind v4 tokens under `@theme`:

| Token               | Usage                             |
| :------------------ | :-------------------------------- |
| `bg-app-bg`         | Page background (dark: `#0E0E0E`) |
| `bg-card-bg`        | Card/input surfaces               |
| `bg-sidebar-bg`     | Sidebar background                |
| `border-border-app` | All borders                       |
| `text-primary`      | Primary text                      |
| `text-secondary`    | Muted/secondary text              |

Custom animations: `animate-slide-up-fade`, `animate-slide-in-right`, `stagger-1` through `stagger-4` — defined as `@keyframes` in `index.css`.

---

## Dependency Reference

### Frontend (`package.json`)

| Package                         | Purpose                                     |
| :------------------------------ | :------------------------------------------ |
| `react` + `react-dom`           | UI framework                                |
| `react-router-dom`              | Client-side routing                         |
| `react-markdown` + `remark-gfm` | Markdown in assistant messages              |
| `react-syntax-highlighter`      | Code block highlighting (Prism/vscDarkPlus) |
| `lucide-react`                  | Icons                                       |
| `framer-motion`                 | Animations                                  |
| `tailwindcss` v4                | Styling                                     |

### Backend (`requirements.txt`)

| Package               | Version | Status       |
| :-------------------- | :------ | :----------- |
| `fastapi`             | 0.138.0 | ✅ Installed |
| `uvicorn`             | 0.49.0  | ✅ Installed |
| `pydantic`            | 2.13.4  | ✅ Installed |
| `python-dotenv`       | 1.2.2   | ✅ Installed |
| `openai`              | >=1.0.0 | ✅ Installed |
| `anthropic`           | latest  | ⚠️ Missing   |
| `google-generativeai` | latest  | ⚠️ Missing   |
| `pytest`              | latest  | ⚠️ Missing   |
| `httpx`               | latest  | ⚠️ Missing   |
