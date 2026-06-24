# RouteMind

> Intelligent AI model routing — one interface, the right model, every time.

RouteMind eliminates the decision fatigue of choosing between AI tools. Instead of manually switching between ChatGPT, Claude, Gemini, and Perplexity depending on your task, RouteMind analyses your query and automatically routes it to the most suitable model — then explains why.

---

## What it does

- **Unified chat interface** — one place to interact with all major AI models
- **Automatic routing** — intent classification dispatches each query to the best-fit model (coding → Claude, research → Perplexity, documents → Gemini, reasoning → o3-mini)
- **Explainable decisions** — every response shows which model was selected, confidence, estimated cost, and latency
- **Cost-aware** — avoids routing simple tasks to expensive frontier models

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Markdown rendering | react-markdown + react-syntax-highlighter |
| Unit tests | Vitest + Testing Library |
| CI | GitHub Actions |

---

## Getting started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run linter
pnpm lint

# Run unit tests (single pass)
pnpm test:run

# Run unit tests (watch mode)
pnpm test

# Build for production
pnpm build
```

---

## Project structure

```
src/
├── components/       # Shared UI components (Sidebar, Navbar, ChatMessage, ...)
├── pages/            # Route-level pages (Home, Chat, Benefits, Docs)
├── data/             # Mock data and routing stats
├── utils/
│   └── mockRouter.js # Routing logic — maps query intent to AI model
└── test/
    ├── setup.js
    └── mockRouter.test.js
```

---

## CI pipeline

Every push and pull request to `main` runs three checks in order:

1. **Lint** — ESLint with react-hooks and react-refresh rules
2. **Test** — Vitest unit tests (non-watch)
3. **Build** — Vite production build (catches bad imports and Tailwind issues)

---

## Current status

This is a hackathon project under active development. The routing engine currently uses a mock keyword-based classifier (`src/utils/mockRouter.js`). Real API integration is planned as the next milestone.

---

## Team

- [pritesh-4](https://github.com/pritesh-4)
- [adarsh-67r](https://github.com/adarsh-67r)
