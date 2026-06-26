# RouteMind

> Intelligent AI model routing — one interface, the right model, every time.

RouteMind eliminates the decision fatigue of choosing between AI tools. Instead of manually switching between ChatGPT, Claude, Gemini, and others depending on your task, RouteMind analyses your query and automatically routes it to the most suitable model — then explains why.

---

## 🚀 Features

### 1. Intelligent Query Routing

- **Intent Classification:** Dispatches each query to the best-fit model based on its nature (e.g. Coding → Groq Llama, Research → Gemini, Reasoning → NVIDIA NIM).
- **Multi-Step Routing Pipeline:** Real-time visual feedback for intent analysis → model comparison → model selection → response generation.
- **Explainable AI Decisions:** Confidence score, estimated cost, latency, and routing reason surfaced alongside every response.
- **Adaptive Routing Policies:** Toggle between _Cost_, _Speed_, _Balanced_, and _Quality_ policies.

### 2. Rich Chat Interface

- **Auto-Resizing Text Input:** Textarea grows as you type (clamped 56px–200px), auto-focuses on load.
- **File Attachments:** Drag-and-drop or select documents, code files, and images (up to 20 MB). Validated file extensions: PDF, DOC/DOCX, TXT/MD, PNG/JPG/JPEG/WEBP, CSV, JSON, and common source-code extensions.
- **Dynamic File Icons:** Format-matched icons for attached files inside message bubbles.
- **Typing Indicator:** Step-by-step animated labels show which routing stage is active.

### 3. Premium UX & Design

- **Dark-first Theme:** Glassmorphism surfaces, glowing accents, Framer Motion transitions.
- **Theme Management:** Light / Dark / System preference via `ThemeContext`.
- **Global Notifications:** Toast system for errors, file-validation warnings, and info messages.
- **Accessible Modals:** Focus trap + Escape-key dismiss on all modal overlays.

### 4. Scalable Backend

- **FastAPI:** Clean Python backend with health monitoring and CORS.
- **Provider Adapter Pattern:** `BaseProvider` ABC — adding a new LLM = one new file.
- **Composite-Scoring Router:** Intent × Policy × live health metrics → model selection with automatic failover chains.
- **Extensible Classifier:** Regex-heuristic `RuleBasedIntentClassifier` with confidence scoring and complexity detection.
- **Background Health Monitor:** EMA-latency tracking, consecutive-failure counting, and per-provider block lists.

---

## 🛠️ Tech Stack

| Layer                  | Choice                                                       |
| :--------------------- | :----------------------------------------------------------- |
| **Frontend Framework** | React 19 + Vite 8                                            |
| **Backend Framework**  | FastAPI (Python 3.x) + Uvicorn                               |
| **Styling**            | Tailwind CSS v4                                              |
| **Routing**            | React Router v7                                              |
| **Animations**         | Framer Motion                                                |
| **Markdown Rendering** | `react-markdown` + `react-syntax-highlighter` + `remark-gfm` |
| **Icons**              | Lucide React                                                 |
| **Unit Testing**       | Vitest + React Testing Library + JSDOM                       |
| **CI/CD**              | GitHub Actions (`ci.yml`)                                    |
| **Deployment Routing** | Vercel SPA Rewrites (`vercel.json`)                          |

---

## 📂 Project Directory Structure

```
RouteMind/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI: lint → test → build
├── backend/
│   ├── app/
│   │   ├── classifier/
│   │   │   └── intent_classifier.py      # RuleBasedIntentClassifier + complexity detection
│   │   ├── config/
│   │   │   ├── __init__.py               # Pydantic Settings (dotenv loader)
│   │   │   └── pricing.py                # Per-model cost parsing utility
│   │   ├── errors.py                     # Unified exception hierarchy
│   │   ├── main.py                       # Composition root: CORS, lifespan, exception handlers
│   │   ├── providers/
│   │   │   ├── base.py                   # BaseProvider ABC + ProviderError types
│   │   │   ├── gemini_provider.py        # ✅ Live — Google Gemini API
│   │   │   ├── groq_provider.py          # ✅ Live — Groq Llama completions
│   │   │   ├── nvidia_provider.py        # ✅ Live — NVIDIA NIM hosted models
│   │   │   └── openrouter_provider.py    # ✅ Live — OpenRouter free-tier models
│   │   ├── routes/
│   │   │   ├── chat.py                   # POST /chat — classify → route → call → respond
│   │   │   └── health.py                 # GET / and GET /health
│   │   ├── schemas/
│   │   │   └── chat.py                   # ChatRequest + flat ChatResponse Pydantic models
│   │   └── services/
│   │       ├── health_monitor.py         # Background EMA-latency + failure tracking
│   │       ├── provider_manager.py       # Lazy-loading provider registry
│   │       └── router.py                 # LLMRouter: composite-scoring engine
│   ├── .env                              # Local secrets (never commit)
│   ├── requirements.txt
│   └── tests/
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
│   │   ├── ChatInput.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── RoutingCard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── TelemetryModal.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── Tooltip.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── AuthenticationComingSoonModal.jsx
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
│   │   ├── api.js               # Fetch wrapper with AbortController timeout
│   │   └── chatService.js       # POST /chat + GET /health mappings
│   ├── utils/
│   │   ├── fileHelpers.jsx
│   │   └── animations.js
│   ├── test/
│   │   ├── fileHelpers.test.js
│   │   └── setup.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vercel.json
├── vite.config.js
├── eslint.config.js
├── package.json
├── AGENT_CONTEXT.md
└── README.md
```

---

## ⚡ Getting Started

Requires Node.js v18+ and Python v3.9+.

### Frontend Setup

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Production build
pnpm build
pnpm preview

# Lint + test
pnpm lint
pnpm test:run
```

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/ -v

# Start API server (http://127.0.0.1:8000)
uvicorn app.main:app --reload
```

Interactive API docs available at `http://127.0.0.1:8000/docs` (local only).

### Environment Variables (`.env`)

Create `backend/.env` with:

```env
# Provider API keys
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
NVIDIA_NIM_API_KEY=nvapi-...
OPENROUTER_API_KEY=sk-or-...

# CORS — add your deployed frontend URL here
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","https://your-app.vercel.app"]

ENVIRONMENT=development
```

---

## 📡 API Reference

### `POST /chat`

**Request:**

```json
{
  "message": "Write a fast Rust HTTP server using actix-web",
  "conversation_id": "conv_8f3a9e2d",
  "routing_policy": "quality",
  "attachments": [],
  "user_id": "usr_9x12bc8f",
  "timestamp": "2026-06-26T07:00:00Z"
}
```

`routing_policy` must be one of: `balanced` | `speed` | `cost` | `quality`

**Response (flat `ChatResponse`):**

```json
{
  "success": true,
  "response": "Here is a minimal actix-web server...",
  "conversation_id": "conv_8f3a9e2d",
  "routing_metadata": {
    "intent": "coding",
    "provider": "groq",
    "selected_model": "llama-3.3-70b-versatile",
    "routing_policy": "quality",
    "confidence": 95.0,
    "reason": "Routed to Groq Llama-3.3-70b for low-latency high-quality code generation.",
    "processing_time_ms": 820
  },
  "estimated_cost": 0.00012,
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 380,
    "total_tokens": 422
  }
}
```

### `GET /health`

Returns service status and per-provider health state.

---

## 🔀 Routing Logic

### Intent → Provider Mapping

| Intent      | `balanced`               | `speed`               | `cost`                | `quality`                | Failover Chain                      |
| :---------- | :----------------------- | :-------------------- | :-------------------- | :----------------------- | :---------------------------------- |
| `coding`    | groq / llama-3.3-70b     | groq / llama-3.1-8b   | groq / llama-3.1-8b   | groq / llama-3.3-70b     | groq → nvidia → gemini → openrouter |
| `research`  | gemini / flash           | gemini / flash        | gemini / flash        | gemini / pro             | gemini → nvidia → groq → openrouter |
| `document`  | gemini / flash           | gemini / flash        | gemini / flash        | gemini / pro             | gemini → nvidia → groq → openrouter |
| `reasoning` | nvidia / llama-3.1-70b   | nvidia / llama-3.1-8b | nvidia / llama-3.1-8b | nvidia / llama-3.1-70b   | nvidia → gemini → groq → openrouter |
| `analysis`  | nvidia / llama-3.1-70b   | nvidia / llama-3.1-8b | nvidia / llama-3.1-8b | nvidia / llama-3.1-70b   | nvidia → gemini → groq → openrouter |
| `writing`   | openrouter / deepseek-r1 | groq / llama-3.1-8b   | openrouter / free     | openrouter / deepseek-r1 | openrouter → groq → gemini → nvidia |
| `general`   | gemini / flash           | gemini / flash        | gemini / flash        | gemini / pro             | gemini → nvidia → groq → openrouter |

### Composite Scoring Weights

Each healthy provider is scored across five dimensions before selection:

| Factor                            | Weight |
| :-------------------------------- | :----- |
| Specialization capability         | 35%    |
| Latency (from health monitor EMA) | 20%    |
| Cost efficiency                   | 15%    |
| Health status                     | 15%    |
| Historical success rate           | 15%    |

### Failover Chains

If the selected provider fails, RouteMind retries up to 3 times then executes a provider failover chain, always prioritizing healthy nodes first:

- `groq` → `nvidia` → `gemini` → `openrouter`
- `gemini` → `nvidia` → `groq` → `openrouter`
- `nvidia` → `gemini` → `groq` → `openrouter`
- `openrouter` → `groq` → `gemini` → `nvidia`

---

## ⚠️ Known Bugs

| #   | Severity  | File                   | Description                                                                         |
| :-- | :-------- | :--------------------- | :---------------------------------------------------------------------------------- |
| 1   | 🟡 Medium | `services/api.js`      | 15 s `AbortController` timeout too short for large Gemini / NVIDIA responses        |
| 2   | 🟢 Low    | `intent_classifier.py` | Intent tie-breaking is non-deterministic (dict iteration order)                     |
| 3   | 🟢 Low    | `router.py`            | `balanced` and `cost` policies resolve to identical models — no cost-weighted delta |
| 4   | 🟢 Low    | `routes/chat.py`       | Flat `tokens × 0.000015` cost formula applied regardless of provider or model tier  |
| 5   | 🟢 Low    | `ChatInput.jsx`        | Helper text uses `text-[11px]` — below the 12 px accessibility floor                |
| 6   | 🟢 Low    | `Tooltip.jsx`          | Hover-only; not keyboard or screen-reader accessible                                |
| 7   | 🟢 Low    | `Chat.jsx`             | `handleNewChat` in header is an inline lambda instead of calling the shared handler |
| 8   | 🟢 Low    | `chatService.js`       | No SSE streaming — full response is buffered before rendering                       |

---

## ⚙️ CI/CD Pipeline

Every push and pull request to `main` triggers the GitHub Actions workflow (`ci.yml`):

1. **Lint** — ESLint with React rules
2. **Test** — Vitest unit tests (`pnpm test:run`)
3. **Build** — Vite production build

---

## 🌐 Deployment

- **Frontend:** Vercel. `vercel.json` rewrites all routes to `index.html` (standard SPA pattern). Push to `main` auto-deploys.
- **Backend:** Deployed and serving live requests. Local dev server runs at `http://127.0.0.1:8000`.

---

## 👥 Team

- [pritesh-4](https://github.com/pritesh-4)
- [adarsh-67r](https://github.com/adarsh-67r)
