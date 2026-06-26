# RouteMind — Agent Context

> Last updated: 2026-06-26
> This file is the single source of truth for any AI agent or contributor onboarding to this repository. Keep it in sync with the codebase.

---

## Project Overview

RouteMind is an **intelligent AI model routing platform** with a unified chat interface. A user types a query; the routing engine analyses the prompt, dispatches it to the most suitable AI model automatically, and surfaces an explainability panel showing which model was chosen and why.

**Current status:**

- **Frontend** — React SPA fully functional. Client service layer (`src/services/api.js` + `chatService.js`) calls the live FastAPI `/chat` endpoint. Stats are persisted in-memory and updated via window events.
- **Backend** — FastAPI service fully operational. Four live provider adapters (Gemini, Groq, NVIDIA NIM, OpenRouter) are integrated. Rule-based intent classifier with complexity detection, composite-scoring router, lazy-cached provider manager, and background health monitor are all active.
- **CI/CD** — GitHub Actions on every push to `main`: lint → test → build.
- **Deployment** — Frontend on Vercel. Backend deployed and serving live requests.

---

## Architecture Intent

### Request Lifecycle

1. User submits prompt via React frontend
2. `POST /chat` hits the FastAPI backend
3. `RuleBasedIntentClassifier` classifies prompt → intent + confidence + complexity tier
4. `LLMRouter` resolves intent × policy → `RoutingDecision` (provider, model, reason, score)
5. `ProviderManager` retrieves cached provider instance
6. `health_monitor` verifies provider health; healthy providers are always prioritised
7. Provider adapter calls downstream LLM API (Gemini, Groq, NVIDIA NIM, OpenRouter)
8. On failure: up to 3 retries on same provider, then execute provider failover chain
9. Flat `ChatResponse` is returned to the frontend
10. Frontend renders response + `RoutingCard` explainability panel

### Classifier Design

- **Implementation:** `RuleBasedIntentClassifier` — regex keyword matching with scaling confidence heuristics. Runs in < 1 ms.
- **Intents:** `coding`, `research`, `document`, `reasoning`, `writing`, `general`, `math`, `analysis`, `planning`, `strategy`, `image`
- **Complexity tiers:** `simple` / `medium` / `complex` — derived from prompt length + keyword signal density. Complexity upgrades or downgrades effective routing policy automatically.
- **Known issue:** Tie-breaking is non-deterministic (dict iteration order). Fix: add explicit priority weights.

### Provider Adapter Layer

All providers implement `BaseProvider` (ABC in `providers/base.py`):

```python
def generate_response(self, prompt: str, model: str, **kwargs) -> dict
def health_check(self) -> bool
```

Adding a new provider = create one file implementing `BaseProvider` + register it in `ProviderManager`. No other changes required.

**Active providers:**

| Provider      | File                     | Models                                                                             |
| :------------ | :----------------------- | :--------------------------------------------------------------------------------- |
| Google Gemini | `gemini_provider.py`     | gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite                            |
| Groq          | `groq_provider.py`       | llama-3.3-70b-versatile, llama-3.1-8b-instant                                      |
| NVIDIA NIM    | `nvidia_provider.py`     | meta/llama-3.1-70b-instruct, meta/llama-3.1-8b-instruct                            |
| OpenRouter    | `openrouter_provider.py` | deepseek/deepseek-r1-0528:free, qwen/qwen3-coder:free, cohere/north-mini-code:free |

### Health Monitor (`services/health_monitor.py`)

- Runs as a background async task during FastAPI lifespan
- Tracks EMA latency, consecutive failure count, and last-checked timestamp per provider
- Providers exceeding failure threshold are block-listed for 5 minutes (auth failures) or shorter for transient errors
- `LLMRouter` reads live health state before scoring candidates — unhealthy providers are deprioritised, not skipped (still used as last-resort fallback)

### Failure Handling & Retries

- **Execution retry:** Same provider retried up to 3× on connection/timeout errors
- **Provider failover chains** (executed in order, healthy-first):
  - `groq` → `nvidia` → `gemini` → `openrouter`
  - `gemini` → `nvidia` → `groq` → `openrouter`
  - `nvidia` → `gemini` → `groq` → `openrouter`
  - `openrouter` → `groq` → `gemini` → `nvidia`

---

## Repository Layout

```
RouteMind/
├── .github/workflows/ci.yml
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── classifier/
│   │   │   ├── __init__.py
│   │   │   └── intent_classifier.py      # RuleBasedIntentClassifier
│   │   ├── config/
│   │   │   ├── __init__.py               # Pydantic Settings
│   │   │   └── pricing.py               # Per-model cost table
│   │   ├── errors.py                     # Exception hierarchy
│   │   ├── main.py                       # Composition root
│   │   ├── providers/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                   # BaseProvider ABC
│   │   │   ├── gemini_provider.py        # ✅ Live
│   │   │   ├── groq_provider.py          # ✅ Live
│   │   │   ├── nvidia_provider.py        # ✅ Live
│   │   │   └── openrouter_provider.py    # ✅ Live
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py                   # POST /chat orchestration
│   │   │   └── health.py                 # GET / and GET /health
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── chat.py                   # ChatRequest + flat ChatResponse
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── health_monitor.py         # Background EMA-latency tracker
│   │       ├── provider_manager.py       # Lazy-loading registry
│   │       └── router.py                 # Composite-scoring engine
│   ├── .env                              # Local secrets (never commit)
│   ├── requirements.txt
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_classifier.py
│       ├── test_router.py
│       ├── test_provider_manager.py
│       ├── test_chat_endpoint.py
│       ├── test_nvidia_provider.py
│       ├── test_openrouter_provider.py
│       └── test_production_readiness.py
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
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Chat.jsx
│   │   ├── Home.jsx
│   │   ├── Benefits.jsx
│   │   └── Documentation.jsx
│   ├── services/
│   │   ├── api.js               # Fetch wrapper with AbortController
│   │   └── chatService.js       # POST /chat + GET /health
│   ├── utils/
│   │   ├── animations.js
│   │   └── fileHelpers.jsx
│   ├── test/
│   │   ├── fileHelpers.test.js
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

Composition root. Configures CORS (origins read from `Settings.CORS_ORIGINS`), registers unified exception handlers for `BaseRouteMindError` and `RequestValidationError`, and wires up the FastAPI lifespan context to start and stop the background `health_monitor` task on app startup/shutdown.

### `app/config/__init__.py`

Pydantic `Settings` class. Reads from `.env` via `python-dotenv`. Centralises credentials for `GEMINI_API_KEY`, `GROQ_API_KEY`, `NVIDIA_NIM_API_KEY`, `OPENROUTER_API_KEY`, and `CORS_ORIGINS`. **No OpenAI or Anthropic keys** — those providers are not used.

### `app/config/pricing.py`

Static per-model cost lookup table used by `routes/chat.py` to compute `estimated_cost` in the response. Currently a flat multiplier — see Known Bugs #4 for the inaccuracy.

### `app/errors.py`

Exception hierarchy rooted at `BaseRouteMindError`. Sub-classes: `ProviderError`, `ProviderAuthenticationError`, `ProviderRateLimitError`, `ProviderTimeoutError`, `RouterError`, `ClassifierError`. All are caught in `main.py` and serialised to consistent JSON error responses.

### `app/schemas/chat.py`

Pydantic models:

- `ChatRequest` — `message`, `conversation_id`, `routing_policy`, `attachments`, `user_id`, `timestamp`
- `ChatResponse` (flat) — `success`, `response`, `conversation_id`, `routing_metadata` (dict), `estimated_cost`, `usage` (`TokenUsage`)

### `app/routes/chat.py`

Orchestrates the full request pipeline:

1. Validate `ChatRequest`
2. Call `RuleBasedIntentClassifier` → intent + complexity
3. Call `LLMRouter.route()` → `RoutingDecision`
4. Retrieve provider from `ProviderManager`
5. Verify health via `health_monitor`; if unhealthy, walk failover chain
6. Call `provider.generate_response()` with up to 3 retries
7. Compute `estimated_cost` from `pricing.py`
8. Return serialised `ChatResponse`

**Known issue (Bug #2):** `chat.py` uses `list_registered_providers()` at routing time rather than `get_available_providers()` — dead / unhealthy providers are still passed to the router as candidates.

### `app/providers/base.py`

Defines `BaseProvider` abstract class and the `ProviderError` exception family. Every concrete provider must implement `generate_response()` and `health_check()`.

### `app/providers/gemini_provider.py`

Live integration using the `google-generativeai` SDK. Handles streaming disabled (full response buffered). Supports `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`.

### `app/providers/groq_provider.py`

Live integration using the `groq` SDK (OpenAI-compatible). Supports `llama-3.3-70b-versatile` (quality/balanced) and `llama-3.1-8b-instant` (speed/cost).

### `app/providers/nvidia_provider.py`

Live integration using the NVIDIA NIM OpenAI-compatible endpoint. Supports `meta/llama-3.1-70b-instruct` and `meta/llama-3.1-8b-instruct`.

### `app/providers/openrouter_provider.py`

Live integration using the OpenRouter completions API (OpenAI-compatible base URL). Free-tier models: `deepseek/deepseek-r1-0528:free`, `qwen/qwen3-coder:free`, `cohere/north-mini-code:free`.

### `app/services/provider_manager.py`

Lazy-loading provider registry. Providers are instantiated on first use and cached. Exposes `list_registered_providers()` (all registered) and `get_available_providers()` (health-checked). `routes/chat.py` currently uses `list_registered_providers()` — see Known Bugs.

### `app/services/router.py`

`LLMRouter` computes a composite score for each provider candidate:

| Factor                                 | Weight |
| :------------------------------------- | :----- |
| Specialization (per-intent capability) | 35%    |
| Latency (from health monitor EMA)      | 20%    |
| Cost efficiency                        | 15%    |
| Health status                          | 15%    |
| Historical success rate                | 15%    |

Intent × policy → base candidate list, then scored and sorted. Top scorer wins. Fallback chain is returned alongside the primary decision.

### `app/services/health_monitor.py`

Background async task started at lifespan. Polls each provider's `health_check()` on a configurable interval. Tracks:

- `ema_latency_ms` — exponential moving average of response latency
- `consecutive_failures` — resets on success
- `blocked_until` — timestamp-based block list (5 min for auth errors)

### `app/classifier/intent_classifier.py`

`RuleBasedIntentClassifier` — keyword regex matching mapped to intent categories with per-category confidence scaling. Complexity detection uses prompt token count + keyword signal density to assign `simple` / `medium` / `complex`. No ML model — all rules-based, deterministic except for tie-breaking (see Known Bugs).

---

## Policies & Router Logic

| Policy     | Behaviour                      | Notes                                                |
| :--------- | :----------------------------- | :--------------------------------------------------- |
| `quality`  | Frontier / largest models      | gemini-2.5-pro, llama-3.3-70b, llama-3.1-70b         |
| `speed`    | Lowest-latency models          | gemini-2.5-flash-lite, llama-3.1-8b, north-mini-code |
| `cost`     | Cheapest (free-tier preferred) | Same model set as `speed` — see Known Bugs #3        |
| `balanced` | Optimised compromise           | Pro or flash depending on complexity tier            |

---

## Known Bugs

| #   | Severity  | File                   | Description                                                                                                                   |
| :-- | :-------- | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| 1   | 🟡 Medium | `services/api.js`      | 15 s timeout too short for large Gemini / NVIDIA responses                                                                    |
| 2   | 🟡 Medium | `routes/chat.py`       | Uses `list_registered_providers()` not `get_available_providers()` — unhealthy providers treated as available at routing time |
| 3   | 🟢 Low    | `router.py`            | `balanced` and `cost` policies resolve to identical models — no cost-weighted scoring delta                                   |
| 4   | 🟢 Low    | `config/pricing.py`    | Flat `tokens × 0.000015` cost formula regardless of provider or model tier                                                    |
| 5   | 🟢 Low    | `intent_classifier.py` | Tie-breaking is non-deterministic (dict iteration order)                                                                      |
| 6   | 🟢 Low    | `ChatInput.jsx`        | Helper text uses `text-[11px]` — below 12 px a11y floor                                                                       |
| 7   | 🟢 Low    | `Tooltip.jsx`          | Hover-only; not keyboard or screen-reader accessible                                                                          |
| 8   | 🟢 Low    | `Chat.jsx`             | `handleNewChat` in header is an inline lambda instead of the shared handler                                                   |
| 9   | 🟢 Low    | `chatService.js`       | No SSE streaming — full response buffered before render                                                                       |

---

## Test Suite

### Frontend (`src/test/`)

- `fileHelpers.test.js` — Vitest unit tests for file size validation and formatting helpers
- Run: `pnpm test:run`

### Backend (`backend/tests/`)

- `conftest.py` — shared fixtures
- `test_classifier.py` — intent + complexity classification
- `test_router.py` — routing decision correctness per policy
- `test_provider_manager.py` — lazy-loading and health gating
- `test_chat_endpoint.py` — full POST /chat integration tests
- `test_nvidia_provider.py` — NVIDIA NIM adapter unit tests
- `test_openrouter_provider.py` — OpenRouter adapter unit tests
- `test_production_readiness.py` — smoke tests for deployment readiness
- Run: `python -m pytest tests/ -v` from `backend/` with venv active

---

## Environment Variables Quick Reference

| Variable             | Required | Description                                                   |
| :------------------- | :------- | :------------------------------------------------------------ |
| `GEMINI_API_KEY`     | Yes      | Google AI Studio key                                          |
| `GROQ_API_KEY`       | Yes      | Groq Console key                                              |
| `NVIDIA_NIM_API_KEY` | Yes      | NVIDIA NGC key                                                |
| `OPENROUTER_API_KEY` | Yes      | OpenRouter key                                                |
| `CORS_ORIGINS`       | Yes      | JSON array of allowed origins including deployed frontend URL |
| `ENVIRONMENT`        | No       | `development` or `production` (defaults to `development`)     |
