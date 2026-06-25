# RouteMind

> Intelligent AI model routing — one interface, the right model, every time.

RouteMind eliminates the decision fatigue of choosing between AI tools. Instead of manually switching between ChatGPT, Claude, Gemini, and Perplexity depending on your task, RouteMind analyzes your query and automatically routes it to the most suitable model — then explains why.

---

## 🚀 Features

RouteMind is packed with features designed to provide a premium, seamless AI experience:

### 1. **Intelligent Query Routing**

- **Intent Classification:** Dispatches each query to the best-fit model based on its nature (e.g., Coding $\rightarrow$ Claude, Research $\rightarrow$ Perplexity, Document Processing $\rightarrow$ Gemini, Reasoning $\rightarrow$ o3-mini).
- **Multi-Step Simulated Routing Pipeline:** Real-time visual feedback indicating stages of intent analysis, model comparison, model selection, and response generation.
- **Explainable AI Decisions:** Detailed routing stats including confidence score, estimated cost savings, and latency metrics displayed alongside the AI responses.
- **Adaptive Routing Policies:** Toggle between _Cost-Effective_, _Balanced_, and _High-Performance_ policies to prioritize speed, budget, or output depth.

### 2. **Rich Chat Interface**

- **Auto-Resizing Text Input:** Textarea automatically expands as you type (constrained between 56px and 200px) and features auto-focus on load.
- **File Attachments & Uploads:** Drag-and-drop or select documents, code files, and images (up to 20MB) with dynamic validation for file extensions (PDF, DOC/DOCX, TXT/MD, PNG/JPG/JPEG/WEBP/GIF, and various programming source files).
- **Dynamic File Icons:** Custom file icon helper matches format extensions and visualizes attachments cleanly in chat messages.
- **Typing Indicator:** Dynamic steps visualization indicating which routing stage is currently active.

### 3. **Premium User Experience & Design**

- **Modern Aesthetic:** Curated dark-themed layout utilizing sleek glassmorphism, glowing accents, and smooth transitions powered by Framer Motion.
- **Theme Management:** Fully supported Light, Dark, and System-preference themes managed via Context API.
- **Global Notifications:** Toast system (`ToastContext`) dynamically triggers messages for errors, file validation warnings, or info notes.
- **Accessibility-Compliant Modal:** Interactive modals (like Authentication Coming Soon) complete with focus traps and keyboard navigation (Escape to close).

### 4. **Scalable Backend & Configuration**

- **FastAPI Server:** Clean python backend skeleton equipped with server health monitoring checks and standard CORS setup.
- **Swappable LLM Provider Adapters:** Fully encapsulated client layer with standard error translating wrappers (OpenAI SDK integrated; Claude/Gemini placeholders).
- **Decoupled Routing Services:** Dynamic model resolution by policy (`cost`, `speed`, `quality`) and auto-fallbacks for offline providers.
- **Extensible Intent Classification:** Abstract classifier model mapping user messages to categorized intents with confidence heuristics.
- **Production Configurations:** Production-ready single-page routing configurations (`vercel.json`) to prevent 404s on refresh.

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
│       └── ci.yml               # GitHub Actions CI workflow (lint → test → build)
├── backend/                     # Python FastAPI Backend API
│   ├── app/
│   │   ├── __init__.py
│   │   ├── classifier/          # Deterministic & extensible intent classification
│   │   │   ├── __init__.py
│   │   │   └── intent_classifier.py # BaseIntentClassifier contract & RuleBasedIntentClassifier
│   │   ├── config.py            # Centralized settings loading using dotenv & Pydantic
│   │   ├── main.py              # Composition root registering CORS, logging, & routers
│   │   ├── providers/           # Swappable LLM provider integration adapters
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Abstract BaseProvider & custom provider exceptions
│   │   │   ├── claude_provider.py # Claude API TODO placeholder
│   │   │   ├── gemini_provider.py # Gemini API TODO placeholder
│   │   │   └── openai_provider.py # Live OpenAI SDK client integration with latency logs
│   │   ├── routes/              # Modular API routes
│   │   │   ├── __init__.py      # Package marker
│   │   │   ├── chat.py          # /chat endpoint using Pydantic request/response schemas
│   │   │   └── health.py        # /health and root welcome API routes
│   │   ├── schemas/             # Pydantic data schemas
│   │   │   ├── __init__.py      # Schema exports
│   │   │   └── chat.py          # ChatRequest and ChatResponse schemas
│   │   └── services/            # Orchestration & routing logic
│   │       ├── __init__.py
│   │       ├── provider_manager.py # Lazy-loading & availability monitor
│   │       └── router.py        # Intent-driven rule router & fallback engine
│   ├── .env                     # Local environment variables
│   ├── .gitignore               # Python environment git ignores
│   ├── requirements.txt         # Backend Python dependencies
│   ├── tests/                   # Pytest integration & unit test suite
│   │   ├── __init__.py
│   │   ├── test_classifier.py
│   │   ├── test_router.py
│   │   ├── test_provider_manager.py
│   │   └── test_chat_endpoint.py
│   └── venv/                    # Python virtual environment (ignored)
├── src/                         # React Frontend Application
│   ├── assets/                  # Graphics and static resources
│   ├── components/              # Shared UI components
│   │   ├── AuthenticationComingSoonModal.jsx # Auth modal with accessibility focus trap
│   │   ├── ChatInput.jsx        # Auto-resizing input, drag/drop file attachment
│   │   ├── ChatMessage.jsx      # Message bubble rendering user files & RoutingCard
│   │   ├── Footer.jsx           # Global landing page footer
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── RoutingCard.jsx      # UI displaying routing statistics & rationale
│   │   ├── SettingsModal.jsx    # Extracted settings & policy selector modal
│   │   ├── Sidebar.jsx          # Sidebar for history orchestration
│   │   ├── TelemetryModal.jsx   # Extracted live routing statistics dashboard
│   │   ├── Tooltip.jsx          # Light hover tooltip wrapper
│   │   └── TypingIndicator.jsx  # Multi-step animated loading indicators
│   ├── context/                 # Context providers for global state
│   │   ├── ThemeContext.jsx     # Dark, light, and system themes configuration
│   │   └── ToastContext.jsx     # Global toast notification wrapper
│   ├── data/
│   │   └── mockData.js          # Shared mock models definitions & default stats
│   ├── services/                # API client services communicating with backend
│   │   ├── api.js               # Fetch wrapper with timeouts and error wrapping
│   │   └── chatService.js       # Chat /health and /chat endpoints mappings
│   ├── utils/                   # Helper utilities
│   │   ├── animations.js        # Framer Motion animations preset
│   │   ├── fileHelpers.jsx      # File icon assignment and size formatting
│   │   └── mockRouter.js        # Legacy local mock routing handler (preserved)
│   ├── test/                    # Front-end unit tests
│   │   ├── mockRouter.test.js
│   │   └── setup.js             # Vitest global setup configuration
│   ├── App.jsx                  # Main router config & views wrapper
│   ├── index.css                # Base tailwind styles and animation keyframes
│   └── main.jsx                 # Entry point mounting App
├── index.html                   # HTML Entry template
├── eslint.config.js             # ESLint flat config file
├── vite.config.js               # Vite configurations
├── vercel.json                  # Single-Page App deployment rewrites
├── package.json                 # Frontend scripts and Node packages
└── README.md                    # Project documentation
```

---

## ⚡ Getting Started

Ensure you have Node.js (v18+) and Python (v3.9+) installed on your machine.

### Frontend Setup

You can use either **npm** (default on local workspace) or **pnpm**:

1. **Install Frontend Dependencies:**

   ```bash
   npm install
   # OR
   pnpm install
   ```

2. **Start Frontend Development Server:**

   ```bash
   npm run dev
   # OR
   pnpm dev
   ```

   Open `http://localhost:5173` in your browser.

3. **Production Build & Preview:**

   ```bash
   npm run build
   npm run preview
   # OR
   pnpm build
   pnpm preview
   ```

4. **Linting and Testing:**

   ```bash
   # Run ESLint check
   npm run lint  # or pnpm lint

   # Run Vitest unit tests (watch mode)
   npm run test  # or pnpm test

   # Run Vitest unit tests (single pass)
   npm run test:run  # or pnpm test:run
   ```

### Backend Setup

1. **Create and Activate Python Virtual Environment:**

   ```bash
   cd backend
   python -m venv venv

   # Windows (PowerShell/CMD):
   venv\Scripts\activate

   # macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Python Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run Backend Tests:**

   ```bash
   python -m pytest tests/ -v
   ```

4. **Start the API Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will be available at `http://127.0.0.1:8000`. You can inspect the health check at `http://127.0.0.1:8000/health`, or open `http://127.0.0.1:8000/docs` to interactively view and test the schema endpoints (e.g. `POST /chat`).

---

## 📡 API Production Contracts

The backend enforces strict schemas for the pipeline using Pydantic models. Below is the structure of the JSON payloads transferred between the frontend and backend.

### Request Payload (`POST /chat`)

```json
{
  "message": "Write a fast Rust HTTP server using actix-web",
  "conversation_id": "conv_8f3a9e2d",
  "routing_policy": "quality",
  "attachments": ["server_design.pdf"],
  "user_id": "usr_9x12bc8f",
  "timestamp": "2026-06-25T15:41:00Z"
}
```

### Response Payload (`POST /chat`)

```json
{
  "response": {
    "content": "[Mock Response from OPENAI]\n\nYou asked: \"Write a fast Rust HTTP server...\"",
    "conversation_id": "conv_8f3a9e2d",
    "attachments": ["server_design.pdf"]
  },
  "routing": {
    "intent": "coding",
    "provider": "openai",
    "selected_model": "gpt-4o",
    "routing_policy": "quality",
    "confidence": 99.0,
    "reason": "Routed to GPT-4o for high-quality reasoning matching 'coding' intent under the 'quality' policy.",
    "estimated_cost": 0.00165,
    "processing_time_ms": 3250
  },
  "metadata": {
    "request_id": "req_84d72f9a1",
    "timestamp": "2026-06-25T15:41:04.123456Z",
    "status": "success",
    "api_version": "1.0.0"
  }
}
```

---

## ⚙️ CI/CD Pipeline

Every push and pull request targeting the `main` branch triggers the GitHub Actions workflow (`ci.yml`):

1. **Lint** — ESLint with React guidelines verifies code styling constraints.
2. **Test** — Vitest runs unit tests to ensure query intent logic works correctly.
3. **Build** — Vite executes a production build to check for bundler or syntax issues.

---

## 🌐 Current Status & Deployment

- **Current Status:** Full-stack integration complete. Frontend chat prompt flows through the services API layer and queries the live FastAPI backend routing pipeline (intent classifier, routing policy resolver, provider adapters), with local mock fallback mapping when API keys are absent.
- **Vercel Routing:** Custom `vercel.json` rewrite configuration allows single-page route paths to load smoothly on fresh refreshes.

---

## 👥 Team

- [pritesh-4](https://github.com/pritesh-4)
- [adarsh-67r](https://github.com/adarsh-67r)
