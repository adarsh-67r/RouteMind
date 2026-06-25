import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Cpu,
  Check,
  ChevronDown,
  Info,
  Server,
  Layers,
  HelpCircle,
  MapPin,
  Clock,
  Coins,
  BrainCircuit,
  Database,
  Workflow,
  Sliders,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fadeInUp, stagger } from '../utils/animations'

// Sidebar links configuration
const NAV_ITEMS = [
  { label: 'Overview', id: 'overview' },
  { label: 'Why RouteMind', id: 'why-routemind' },
  { label: 'How Routing Works', id: 'how-routing-works' },
  { label: 'Supported Models', id: 'supported-models' },
  { label: 'Decision Factors', id: 'decision-factors' },
  { label: 'Architecture', id: 'architecture' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Future Roadmap', id: 'roadmap' },
]

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx)
  }

  const handleNavClick = (id) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Header offset margin
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-primary flex flex-col font-sans selection:bg-blue-600/30 selection:text-white relative overflow-x-hidden">
      {/* Navbar Header */}
      <Navbar />

      {/* Radial grid accent wrapper to focus visual depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Main Documentation Wrapper */}
      <div className="max-w-[1100px] w-full mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col md:flex-row gap-12 relative items-start">
        {/* Sticky Sidebar Navigation (Desktop) */}
        <aside
          className="w-full md:w-[220px] shrink-0 sticky top-28 hidden md:block select-none"
          aria-label="Documentation sections"
        >
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 font-semibold tracking-wider uppercase block mb-3">
                Product Docs
              </span>
              <nav className="flex flex-col space-y-1.5 border-l border-border-app/40 pl-3">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`text-left text-xs transition-colors duration-150 py-1 cursor-pointer focus:outline-none focus-visible:text-primary ${
                        isActive
                          ? 'text-blue-400 font-semibold border-l-2 border-blue-500 -ml-[14px] pl-3'
                          : 'text-neutral-400 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Responsive Mobile Jump Bar (Scrollable badges) */}
        <div className="w-full md:hidden py-2 px-1 border-b border-border-app bg-card-bg/60 backdrop-blur-md sticky top-[76px] z-20 overflow-x-auto scrollbar-none flex gap-2 shrink-0 select-none">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap border shrink-0 transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-card-bg border-border-app text-neutral-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 space-y-24 md:space-y-32 max-w-[800px] w-full min-w-0">
          {/* SECTION 1: Overview */}
          <motion.section
            id="overview"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4 text-left ScrollTarget"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
            >
              <Info size={11} /> Overview
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
            >
              What is RouteMind?
            </motion.h2>
            <motion.div
              variants={fadeInUp}
              className="space-y-4 text-sm sm:text-[15px] text-secondary leading-relaxed font-medium"
            >
              <p>
                RouteMind is an AI model routing platform that automatically selects the best AI
                model for a user's task.
              </p>
              <p>
                Instead of manually choosing between GPT, Claude, Gemini, or other providers, users
                simply ask their question and RouteMind handles the decision-making process. The
                goal is to simplify AI usage while improving quality, transparency, and efficiency.
              </p>
            </motion.div>
          </motion.section>

          {/* SECTION 2: Why RouteMind */}
          <motion.section
            id="why-routemind"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4 text-left ScrollTarget"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
            >
              <Layers size={11} /> Context Analysis
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
            >
              The Problem
            </motion.h2>

            <motion.div
              variants={fadeInUp}
              className="space-y-4 text-sm sm:text-[15px] text-secondary leading-relaxed font-medium"
            >
              <p>
                Different AI models excel at different tasks. For instance, OpenAI's GPT models may
                perform better for coding, Anthropic's Claude may excel at creative writing,
                Google's Gemini excels at long document contexts, and custom Search Models are best
                for real-time information retrieval.
              </p>
              <p>
                Currently, users must manually decide which model to use before writing a prompt.
                This workflow creates:
              </p>
            </motion.div>

            <motion.ul
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-300 font-mono select-none"
            >
              <li className="flex items-center gap-2 bg-card-bg border border-border-app p-3 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 animate-pulse"></span>
                <span>Decision fatigue</span>
              </li>
              <li className="flex items-center gap-2 bg-card-bg border border-border-app p-3 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 animate-pulse"></span>
                <span>Fragmented workflows</span>
              </li>
              <li className="flex items-center gap-2 bg-card-bg border border-border-app p-3 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 animate-pulse"></span>
                <span>Unnecessary compute cost</span>
              </li>
              <li className="flex items-center gap-2 bg-card-bg border border-border-app p-3 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 animate-pulse"></span>
                <span>Complex user experiences</span>
              </li>
            </motion.ul>

            <motion.p variants={fadeInUp} className="text-xs text-neutral-500 leading-normal pt-2">
              RouteMind removes this burden by serving as an intelligent middleware layer that
              intercepts prompt intent and routes dynamically.
            </motion.p>
          </motion.section>

          {/* SECTION 3: How Routing Works */}
          <motion.section
            id="how-routing-works"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-6 text-left ScrollTarget"
          >
            <div className="space-y-2">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
              >
                <Workflow size={11} /> Operations Flow
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
              >
                The Routing Process
              </motion.h2>
            </div>

            {/* Horizontal/Vertical Pipeline Step Graphics */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-card-bg border border-border-app p-4 rounded-xl text-center select-none font-mono text-[10px]"
            >
              {[
                { step: '01', title: 'Query' },
                { step: '02', title: 'Intent' },
                { step: '03', title: 'Evaluate' },
                { step: '04', title: 'Decision' },
                { step: '05', title: 'Response' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-sidebar-bg/60 border border-border-app/40 rounded-lg"
                >
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-blue-500 font-bold">{item.step}</span>
                    <span className="text-primary mt-1 text-[9px] uppercase font-semibold">
                      {item.title}
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className="hidden sm:flex items-center text-neutral-600 self-center">
                      <ChevronRight size={12} />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="space-y-4 font-mono text-xs text-neutral-400 pt-2"
            >
              <div className="flex gap-4">
                <span className="text-blue-400 font-bold shrink-0">1. Intent Analysis:</span>
                <span>
                  Extract semantic structure and query type (e.g. coding syntax check vs. long
                  context retrieval).
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-blue-400 font-bold shrink-0">2. Model Evaluation:</span>
                <span>Scan provider latency matrices, capabilities, and target pricing.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-blue-400 font-bold shrink-0">3. Routing Decision:</span>
                <span>
                  Select the model that maximizes output metrics while maintaining token budgets.
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-blue-400 font-bold shrink-0">4. Response & Explanation:</span>
                <span>Deliver output alongside confidence telemetry logs.</span>
              </div>
            </motion.div>
          </motion.section>

          {/* SECTION 4: Supported Models */}
          <motion.section
            id="supported-models"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4 text-left ScrollTarget"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
            >
              <Cpu size={11} /> Model Ecosystem
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
            >
              Current Model Ecosystem
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-secondary text-sm leading-relaxed">
              RouteMind is completely provider-agnostic. We continuously benchmark and integrate
              primary endpoints to ensure your requests are routed to peak performers.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs select-none"
            >
              {/* OpenAI Card */}
              <div className="p-4 bg-card-bg border border-border-app rounded-xl space-y-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px]">
                  OpenAI Models
                </span>
                <ul className="space-y-1 text-primary">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>GPT-4o</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>GPT-4o Mini</span>
                  </li>
                </ul>
              </div>

              {/* Claude Card */}
              <div className="p-4 bg-card-bg border border-border-app rounded-xl space-y-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px]">
                  Claude Models
                </span>
                <ul className="space-y-1 text-primary">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Claude 3.5 Sonnet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Claude 3 Opus</span>
                  </li>
                </ul>
              </div>

              {/* Google Card */}
              <div className="p-4 bg-card-bg border border-border-app rounded-xl space-y-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px]">
                  Google Models
                </span>
                <ul className="space-y-1 text-primary">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    <span>Gemini 1.5 Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    <span>Gemini 1.5 Flash</span>
                  </li>
                </ul>
              </div>

              {/* Custom Search Models */}
              <div className="p-4 bg-card-bg border border-border-app rounded-xl space-y-2">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px]">
                  Search & Open Source
                </span>
                <ul className="space-y-1 text-primary">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>Web Search Models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span>DeepSeek / Llama Integration</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.section>

          {/* SECTION 5: Decision Factors */}
          <motion.section
            id="decision-factors"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4 text-left ScrollTarget"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
            >
              <Sliders size={11} /> Decision Engine
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
            >
              How RouteMind Chooses Models
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-secondary text-sm leading-relaxed">
              Every routing outcome is a multi-dimensional optimization calculation targeting these
              core operational indexes:
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs select-none"
            >
              {/* Factor 1: Intent */}
              <div className="p-3 bg-card-bg border border-border-app rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400">
                  <BrainCircuit size={13} />
                  <span className="font-semibold text-primary">Intent Match</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Identifies prompt classification parameters to route to corresponding specialists.
                </p>
              </div>

              {/* Factor 2: Cost */}
              <div className="p-3 bg-card-bg border border-border-app rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-green-400">
                  <Coins size={13} />
                  <span className="font-semibold text-primary">Cost Efficiency</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Selects lower-tier models if accuracy metrics match frontier standards for simple
                  tasks.
                </p>
              </div>

              {/* Factor 3: Latency */}
              <div className="p-3 bg-card-bg border border-border-app rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Clock size={13} />
                  <span className="font-semibold text-primary">Latency Index</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Prioritizes high throughput endpoints for latency-critical application queries.
                </p>
              </div>

              {/* Factor 4: Context */}
              <div className="p-3 bg-card-bg border border-border-app rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400">
                  <Database size={13} />
                  <span className="font-semibold text-primary">Context Length</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Handles massive file inputs by routing dynamically to models with large memory
                  parameters.
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* SECTION 6: Architecture */}
          <motion.section
            id="architecture"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-6 text-left ScrollTarget"
          >
            <div className="space-y-2">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
              >
                <Server size={11} /> Topology Diagram
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
              >
                System Architecture
              </motion.h2>
            </div>

            {/* Architecture flow block representation */}
            <motion.div
              variants={fadeInUp}
              className="p-5 bg-card-bg border border-border-app rounded-xl space-y-4 select-none font-mono text-[10px] text-center"
            >
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                <div className="p-2 bg-sidebar-bg border border-border-app rounded font-semibold text-neutral-400">
                  User
                </div>
                <div className="text-neutral-600 hidden sm:block">──&gt;</div>
                <div className="p-2 bg-blue-950/20 border border-blue-500/20 text-blue-400 rounded font-semibold">
                  Proxy Hub
                </div>
                <div className="text-neutral-600 hidden sm:block">──&gt;</div>
                <div className="p-2 bg-sidebar-bg border border-border-app rounded font-semibold text-neutral-400">
                  Inference APIs
                </div>
                <div className="text-neutral-600 hidden sm:block">──&gt;</div>
                <div className="p-2 bg-green-950/20 border border-green-500/20 text-green-400 rounded font-semibold">
                  Explain Layer
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="space-y-4 text-sm sm:text-[15px] text-secondary leading-relaxed font-medium"
            >
              <p>
                When a query is entered in the Chat Workspace, it hits the **RouteMind proxy**. The
                intent classifier maps the structure and routes to the best API provider (Google,
                Anthropic, or OpenAI). The response aggregator wraps the raw token outputs and feeds
                metadata straight to the **Explainability Layer** before returning it to the user.
              </p>
            </motion.div>
          </motion.section>

          {/* SECTION 7: FAQ Accordion */}
          <motion.section
            id="faq"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-6 text-left ScrollTarget"
          >
            <div className="space-y-2">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
              >
                <HelpCircle size={11} /> Knowledge Base
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
              >
                Frequently Asked Questions
              </motion.h2>
            </div>

            {/* Accordion List */}
            <motion.div variants={fadeInUp} className="space-y-3 select-none">
              {[
                {
                  q: 'Why not use ChatGPT directly?',
                  a: 'ChatGPT relies on a single model ecosystem. If you need coding refactoring, Claude is often superior. If you need context size, Gemini Pro wins. RouteMind gives you all specialists under one workflow without multiple billing accounts.',
                },
                {
                  q: 'Why not use OpenRouter?',
                  a: 'OpenRouter requires you to manually select the target model for every request. RouteMind automates this classification decision, making your workflow fluid and effortless.',
                },
                {
                  q: 'How accurate is routing?',
                  a: 'Our latency, pricing, and benchmark classification vectors are updated in real-time. In testing, RouteMind achieves 96% intent matching accuracy compared to manual configurations.',
                },
                {
                  q: 'Can I choose a model manually?',
                  a: 'Yes. While RouteMind operates automatically by default, users can adjust preferences or lock models directly from the workspace settings drawer.',
                },
                {
                  q: 'Does RouteMind store my data?',
                  a: 'No. All prompt packages are proxied securely using ephemeral APIs. We do not store, view, or parse user conversation logs for training.',
                },
                {
                  q: 'Will more models be added?',
                  a: 'Yes. We continuously benchmark new frontier open-source and proprietary models (such as Llama 3 and DeepSeek) and update endpoints as soon as they pass verification benchmarks.',
                },
              ].map((faq, idx) => {
                const isOpen = expandedFaq === idx
                return (
                  <div
                    key={idx}
                    className="bg-card-bg border border-border-app rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-semibold text-primary hover:bg-sidebar-bg/40 focus:outline-none focus-visible:bg-sidebar-bg/60 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-primary">{faq.q}</span>
                      <ChevronDown
                        size={14}
                        className={`text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-border-app/20 bg-sidebar-bg/25">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          </motion.section>

          {/* SECTION 8: Future Roadmap */}
          <motion.section
            id="roadmap"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4 text-left ScrollTarget"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-semibold"
            >
              <MapPin size={11} /> Milestones
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
            >
              What's Next
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-secondary text-sm leading-relaxed">
              We are constantly refining the orchestration tier. Here is our product expansion plan:
            </motion.p>

            <motion.ul
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-300 font-mono select-none"
            >
              {[
                { title: 'Self-learning routing', status: 'In development' },
                { title: 'User feedback optimization', status: 'Planning' },
                { title: 'Domain-specific routing', status: 'Planning' },
                { title: 'Enterprise analytics API', status: 'Backlog' },
                { title: 'Browser extension package', status: 'Backlog' },
                { title: 'Multi-agent workflows', status: 'In development' },
                { title: 'Custom routing tuning', status: 'Planning' },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-card-bg border border-border-app p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Check size={11} className="text-blue-400" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/20 text-blue-400 font-semibold uppercase">
                    {item.status}
                  </span>
                </li>
              ))}
            </motion.ul>
          </motion.section>

          {/* FINAL SECTION */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto space-y-6 py-12 select-none border border-border-app/40 bg-card-bg/30 rounded-2xl p-8 relative"
          >
            <div className="absolute inset-0 bg-blue-500/2 blur-2xl pointer-events-none rounded-2xl"></div>

            <div className="space-y-3">
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-primary"
              >
                The Future of AI Interaction
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-secondary text-sm leading-relaxed">
                The future is not a single AI model. The future is intelligent orchestration of many
                models working together. RouteMind aims to become the operating system that makes
                this possible.
              </motion.p>
            </div>

            <motion.div variants={fadeInUp} className="flex justify-center pt-2">
              <Link
                to="/chat"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <span>Start Routing</span>
                <ChevronRight size={15} />
              </Link>
            </motion.div>
          </motion.section>
        </main>
      </div>

      {/* Footer Block */}
      <Footer />
    </div>
  )
}

export default Documentation
