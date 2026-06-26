# RouteMind — Agent Context

> Last updated: 2026-06-26  
> This file is the single source of truth for any AI agent or contributor onboarding to this repository. Keep it in sync with the codebase.

---

## Project Overview

RouteMind is an **intelligent AI model routing platform** with a unified chat interface. A user types a query; the routing engine analyzes the prompt, dispatches it to the most suitable AI model automatically, and surfaces an explainability panel showing which model was chosen and why.

**Current status:**

- **Frontend** — React SPA fully functional. Client service layer (`src/services/api.js` + `chatService.js`) calls the real FastAPI `/chat` endpoint. Live stats are persisted to local storage and updated via window events.
- **Backend** — FastAPI service operational. Rule-based intent classifier with complexity analysis, model-policy router using dynamic scoring, lazy-cached provider manager, background health monitoring, and active provider adapters (Gemini, Groq, NVIDIA NIM, OpenRouter) are all integrated and operational.
- **Deployment** — Frontend deployed to Vercel (`vercel.json` present). Backend configured for local execution and ready for staging.

---

## Architecture Intent

### Request Lifecycle

1. User submits prompt via React frontend
2. `POST /chat` hits the FastAPI backend
3. `RuleBasedIntentClassifier` classifies prompt → intent + confidence + complexity
4. `LLMRouter` resolves intent × policy → `RoutingDecision` (provider, model, reason)
5. `ProviderManager` retrieves cached provider instance
6. Backend verifies provider health using `health_monitor` (prioritizing healthy providers first)
7. Provider adapter calls downstream LLM API (Gemini, Groq, NVIDIA NIM, OpenRouter)
8. If execution fails, automatic fallback retries (up to 3 times) and provider failovers are triggered
9. Flat `ChatResponse` object is returned to the frontend
10. Frontend renders response + `RoutingCard` explainability panel

### Classifier Design

- **Current impl:** `RuleBasedIntentClassifier` — regex keyword matching with scaling confidence heuristics and complexity detection (`simple`, `medium`, `complex`). Runs in < 1 ms.
- **Intents:** `coding`, `research`, `document`, `reasoning`, `writing`, `general`, `math`, `analysis`, `planning`, `strategy`, `image`
- **Tie-Breaking:** Evaluated in sequential dictionary iteration matching first category with maximum keyword overlap.

### Provider Adapter Layer

Each provider implements `BaseProvider` (ABC):

```python
def generate_response(self, prompt: str, model: str) -> dict
def health_check(self) -> bool
```

Adding a new provider = implement `BaseProvider` + register in `ProviderManager`. No other changes.

### Failure Handling & Retries

- **Health Monitor:** Tracks consecutive execution failures, EMA latency, and block lists (e.g. 5 minutes for authentication failures).
- **Execution Retry:** Retries the same API connection up to 3 times on connection/timeout issues.
- **Fallback Chains:**
  - `nvidia` → `gemini` → `groq`
  - `gemini` → `nvidia` → `groq`
  - `groq` → `openrouter` → `gemini` → `nvidia`
  - `openrouter` → `groq` → `gemini`
- Prioritizes healthy providers in the fallback chain first before attempting flagged/unhealthy ones.

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
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── pricing.py           # Cost parsing utility
│   │   ├── main.py                  # composition root & exception mapping
│   │   ├── errors.py                # exception hierarchy
│   │   ├── providers/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── gemini_provider.py   # ✅ Live
│   │   │   ├── groq_provider.py     # ✅ Live
│   │   │   ├── nvidia_provider.py   # ✅ Live
│   │   │   └── openrouter_provider.py # ✅ Live
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py              # orchestration router
│   │   │   └── health.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── chat.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── health_monitor.py    # background tracking
│   │       ├── provider_manager.py
│   │       └── router.py            # composite scoring engine
│   ├── .env
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
│   │   └── fileHelpers.jsx
│   ├── test/
│   │   ├── fileHelpers.test.js     # ✅ Vitest unit tests
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

Composition root. Configures CORS, initializes the global exception handlers (formatting `BaseRouteMindError` and `RequestValidationError` to unified JSON schemas), and configures startup/shutdown lifespan callbacks to trigger the background health monitoring loop.

### `app/config/__init__.py`

Pydantic settings manager parsing variables loaded from `.env`. Centralizes credentials for `GEMINI_API_KEY`, `GROQ_API_KEY`, `NVIDIA_NIM_API_KEY`, `OPENROUTER_API_KEY` and CORS lists.

### `app/schemas/chat.py`

Contains request and response Pydantic models. Refactored to a fully flat `ChatResponse` model for easy client consumption. Implements backward-compatible fields: `success`, `response`, `estimated_cost`, `usage` (`TokenUsage`), and `routing_metadata`.

### `app/routes/chat.py`

Orchestrates request processing: intention extraction → target routing decision → fallback chains validation → healthy node prioritization → API request with 3x retry → result mapping and serialization.

### `app/providers/`

- `base.py` — Defines `BaseProvider` interface and custom `ProviderError` types.
- `gemini_provider.py` — Operates live Gemini API requests.
- `groq_provider.py` — Operates live Groq completions using Llama models.
- `nvidia_provider.py` — Integrates NVIDIA NIM API host models.
- `openrouter_provider.py` — Hooks to OpenRouter completions (`cohere/north-mini-code:free`).

### `app/services/router.py`

Calculates dynamic composite scores per provider candidate using weighting policy parameters (Latency, Cost, Quality, Health, Success Rate). Maps specialized tasks directly to Groq, Gemini, or NVIDIA.

---

## Policies & Router Logic

| Policy     | Behavior              | Target Model Mappings                                  |
| :--------- | :-------------------- | :----------------------------------------------------- |
| `quality`  | Frontier models       | Llama-3.3-70b, Gemini-2.5-pro, Llama-3.1-405b          |
| `speed`    | Low-latency           | Gemini-2.5-flash, Llama-3.1-8b, North-Mini-Code        |
| `cost`     | Cheapest option       | Gemini-2.5-flash, Llama-3.1-8b, North-Mini-Code        |
| `balanced` | Optimized compromises | Pro or flash models depending on complexity evaluation |

---

## Test Suite

### Frontend (`src/test/`)

- `fileHelpers.test.js` — Unit tests covering formatting and size validation.
- Run: `npm run test:run`

### Backend (`backend/tests/`)

- Run: `.\venv\Scripts\pytest -v` from the backend directory.
