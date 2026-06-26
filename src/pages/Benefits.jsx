import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sliders,
  Zap,
  Eye,
  Coins,
  Workflow,
  Terminal,
  Cpu,
  ArrowRight,
  Check,
  ChevronRight,
  TrendingDown,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fadeInUp, stagger } from '../utils/animations'

// Reusable scroll-reveal wrapper so we don't repeat viewport props
const Reveal = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-70px' }}
    transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
)

const Benefits = () => {
  return (
    <div className="min-h-screen bg-app-bg text-primary flex flex-col font-sans selection:bg-blue-600/30 selection:text-white relative overflow-x-hidden">
      <Navbar />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <main className="max-w-[1100px] w-full mx-auto px-6 py-16 md:py-24 flex-1 flex flex-col gap-28 md:gap-36">
        {/* ── HERO ── */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="text-center max-w-3xl mx-auto space-y-6 pt-6"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm text-[10px] font-semibold text-blue-400 font-mono tracking-wider uppercase select-none"
          >
            <span className="flex h-1 w-1 rounded-full bg-blue-400"></span>
            Why RouteMind
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-primary leading-[1.1]"
          >
            The intelligence of every model. <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Zero complexity.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-secondary text-base sm:text-lg leading-relaxed font-medium"
          >
            RouteMind removes the complexity of choosing between AI models by automatically
            selecting the best option for every task.
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="text-neutral-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Modern AI users spend unnecessary time deciding which model to use. RouteMind eliminates
            that decision-making process while remaining transparent about every routing decision.
          </motion.p>
        </motion.section>

        {/* ── BENEFIT SECTIONS ── */}
        <section className="space-y-20 md:space-y-28">
          {/* 1 — Smarter Model Selection */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400 animate-pulse">
                  <Sliders size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Smarter Model Selection
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Different AI models excel at different tasks. Groq may perform better for coding,
                  NVIDIA NIM may excel at reasoning, and Gemini may be stronger for large documents.
                  RouteMind analyzes each request and automatically chooses the most suitable model.
                </p>
              </div>

              {/* Frosted glass widget */}
              <div className="bg-card-bg/50 backdrop-blur-xl border border-border-app rounded-xl p-5 font-mono text-xs text-left shadow-lg relative group/widget">
                <div className="absolute inset-0 bg-blue-500/3 blur-xl pointer-events-none rounded-xl"></div>
                <div className="flex items-center justify-between border-b border-border-app/40 pb-3 mb-4 text-[10px] text-neutral-500 uppercase tracking-wider">
                  <span>Proxy Analysis Layer</span>
                  <span className="text-blue-400 font-semibold">RM_ANALYZER</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-sidebar-bg/70 backdrop-blur-sm border border-border-app rounded-lg">
                    <div className="text-[10px] text-neutral-500 mb-1">User Query</div>
                    <div className="text-primary flex items-center gap-1.5">
                      <span className="text-blue-500 font-bold shrink-0">&gt;</span>
                      <span>Debug a React application state synchronization hook</span>
                    </div>
                  </div>
                  <div className="flex justify-center py-1">
                    <ArrowRight
                      size={14}
                      className="text-neutral-600 rotate-90 md:rotate-0 animate-pulse"
                    />
                  </div>
                  <div className="p-3 bg-sidebar-bg/60 backdrop-blur-sm border border-blue-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-neutral-500">Route Evaluated</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-[9px] text-blue-400 font-semibold border border-blue-500/10 animate-pulse">
                        Active Node
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu size={13} className="text-blue-500 dark:text-blue-400" />
                      <span className="text-primary font-bold">Groq (Llama 3.3)</span>
                    </div>
                    <div className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-normal">
                      Reason: Low latency coding and debugging performance for React 19 concurrent
                      render states.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 2 — Reduced Decision Fatigue */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Frosted glass widget */}
              <div className="order-last md:order-first bg-card-bg/50 backdrop-blur-xl border border-border-app rounded-xl p-5 font-mono text-xs text-left shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-sidebar-bg/70 backdrop-blur-sm border border-border-app rounded-lg flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="text-[9px] text-red-400 font-semibold tracking-wider uppercase mb-2">
                        Manual Workflow
                      </div>
                      <div className="space-y-1.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                        {[
                          'Open Gemini tab',
                          'Open Groq tab',
                          'Open NVIDIA NIM tab',
                          'Compare outputs',
                        ].map((s) => (
                          <div key={s} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400/40 shrink-0"></span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-3 font-semibold">
                      Cognitive overhead
                    </span>
                  </div>

                  <div className="p-3.5 bg-sidebar-bg/60 backdrop-blur-sm border border-green-500/20 rounded-lg flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="text-[9px] text-green-400 font-semibold tracking-wider uppercase mb-2">
                        RouteMind
                      </div>
                      <div className="space-y-1.5 text-[10px] text-neutral-700 dark:text-neutral-200">
                        <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"></span>
                          <span>Ask once</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0 animate-pulse"></span>
                          <span>Orchestrator routes</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-green-400 font-semibold">Focused solving</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                  <Zap size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Reduced Decision Fatigue
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Users should focus on solving problems, not choosing tools. RouteMind removes the
                  need to constantly switch between AI platforms and compare results. Type your
                  query once, and let our infrastructure orchestrate the processing steps.
                </p>
              </div>
            </div>
          </Reveal>

          {/* 3 — Transparent AI Decisions */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                  <Eye size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Transparent AI Decisions
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Most AI products hide how decisions are made. RouteMind explains every routing
                  choice. Users always know which model answered, why it was selected, and what
                  performance factors influenced the decision.
                </p>
              </div>

              {/* Frosted glass widget */}
              <div className="bg-card-bg/50 backdrop-blur-xl border border-border-app rounded-xl p-5 font-mono text-xs text-left shadow-lg">
                <div className="flex items-center justify-between border-b border-border-app/40 pb-2.5 mb-3">
                  <span className="text-[9px] text-neutral-500 font-semibold uppercase">
                    Explainability Metadata
                  </span>
                  <span className="text-green-400 text-[10px] flex items-center gap-1">
                    <Check size={11} /> ROUTED
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-border-app/20">
                    <span className="text-neutral-500">Selected Model</span>
                    <span className="text-primary font-bold">Gemini Flash</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-app/20">
                    <span className="text-neutral-500">Confidence Score</span>
                    <span className="text-green-400 font-semibold">95%</span>
                  </div>
                  <div className="py-1">
                    <span className="text-neutral-600 dark:text-neutral-500 block mb-1">
                      Selection Parameter
                    </span>
                    <span className="text-neutral-700 dark:text-neutral-300 leading-normal block bg-sidebar-bg/60 backdrop-blur-sm p-2 rounded border border-border-app/40">
                      Large context requirements (32,450 tokens matched) processed via Google
                      low-latency node.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 4 — Cost Optimization */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Frosted glass widget */}
              <div className="order-last md:order-first bg-card-bg/50 backdrop-blur-xl border border-border-app rounded-xl p-5 font-mono text-xs text-left shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-app/40 pb-2.5">
                    <span className="text-[9px] text-neutral-500 font-semibold uppercase">
                      Token Budget Comparison
                    </span>
                    <span className="text-blue-400 text-[10px] flex items-center gap-1 font-semibold">
                      <TrendingDown size={11} /> OPTIMIZED
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-neutral-600 dark:text-neutral-500 mb-1">
                        <span>Frontier Default Option (GPT-4o)</span>
                        <span>$0.0150</span>
                      </div>
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-400 dark:bg-neutral-700 w-full rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-green-600 dark:text-green-400 font-medium mb-1">
                        <span>Intelligent Proxy Route (Gemini Flash)</span>
                        <span>$0.0003</span>
                      </div>
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[4%] rounded-full animate-[pulse_1s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-blue-950/20 backdrop-blur-sm border border-blue-500/10 rounded-lg text-blue-400 text-[10px] leading-normal">
                    Savings Check: 98% reduced cost with comparable accuracy for simple text
                    summaries.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                  <Coins size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Cost Optimization
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  Not every task requires the most expensive frontier model. RouteMind intelligently
                  matches simpler tasks with highly efficient, low-cost models. This helps users
                  receive premium, lightning-fast responses while reducing unnecessary API usage
                  costs.
                </p>
              </div>
            </div>
          </Reveal>

          {/* 5 — Unified AI Experience */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-400">
                  <Workflow size={18} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Unified AI Experience
                </h2>
                <p className="text-secondary text-sm leading-relaxed">
                  AI usage is becoming fragmented. Users have to manage multiple developer accounts,
                  separate interfaces, and disconnected workflows. RouteMind creates a single, clean
                  interface for interacting with multiple global AI providers seamlessly.
                </p>
                <ul className="space-y-2 pt-2 select-none">
                  {[
                    'One workflow',
                    'One interface',
                    'Multiple AI providers',
                    'Less context switching',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      <Check size={12} className="text-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frosted glass widget */}
              <div className="bg-card-bg/50 backdrop-blur-xl border border-border-app rounded-xl p-5 font-mono text-xs text-left shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-border-app/40 pb-2.5 mb-2.5 text-[9px] text-neutral-500 font-semibold uppercase">
                    <Terminal size={12} className="text-blue-500" />
                    <span>RouteMind Consolidated Node Shell</span>
                  </div>
                  {['Google Gemini API', 'Groq API', 'NVIDIA NIM API'].map((ep) => (
                    <div
                      key={ep}
                      className="flex justify-between items-center bg-sidebar-bg/60 backdrop-blur-sm p-2.5 border border-border-app/40 rounded-lg"
                    >
                      <span className="text-neutral-400">{ep}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/20 text-blue-400 font-semibold font-mono">
                        CONNECTED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── SCENARIOS ── */}
        <section className="space-y-8">
          <Reveal className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase font-semibold">
              Workspace Contexts
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Real-world Scenarios
            </h2>
            <p className="text-secondary text-sm">
              See how RouteMind automatically distributes workflow requirements depending on user
              roles and prompt context:
            </p>
          </Reveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                tag: 'DEV',
                color: 'blue',
                role: 'Developer',
                sub: 'Refactoring & Review',
                task: 'Review React Architecture',
                model: 'Llama 3.3 70b',
                reason:
                  'Selected due to low latency code understanding and debugging capabilities on Groq.',
              },
              {
                tag: 'RES',
                color: 'green',
                role: 'Researcher',
                sub: 'Document Parsing',
                task: 'Analyze 50-page PDF report',
                model: 'Gemini 1.5 Pro',
                reason:
                  'Selected for massive context window capabilities and semantic retrieval accuracy.',
              },
              {
                tag: 'STU',
                color: 'purple',
                role: 'Student',
                sub: 'Concept Explanation',
                task: 'Explain Quantum Physics',
                model: 'Llama 3.1 405b (NVIDIA)',
                reason:
                  'Selected for high-precision reasoning, clear analogical pedagogics, and step descriptions on NVIDIA NIM.',
              },
              {
                tag: 'FND',
                color: 'yellow',
                role: 'Founder',
                sub: 'Creative Copywriting',
                task: 'Draft pitch email templates',
                model: 'Gemini 1.5 Pro',
                reason: 'Selected for highly polished writing style and narrative structure flow.',
              },
            ].map(({ tag, color, role, sub, task, model, reason }) => {
              const scenarioColors = {
                blue: 'bg-blue-100 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
                green:
                  'bg-green-100 dark:bg-green-950/20 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400',
                purple:
                  'bg-purple-100 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400',
                yellow:
                  'bg-amber-100 dark:bg-yellow-950/20 border-amber-200 dark:border-yellow-500/20 text-amber-700 dark:text-yellow-400',
              }
              return (
                <motion.div
                  key={role}
                  variants={fadeInUp}
                  className="bg-card-bg/50 backdrop-blur-md border border-border-app rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-border-app/80 hover:-translate-y-1 transition-all duration-200 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${scenarioColors[color]}`}
                      >
                        {tag}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-primary">{role}</h3>
                        <p className="text-[9px] text-neutral-600 dark:text-neutral-500">{sub}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 font-mono text-[10px]">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-500">Task:</span>
                        <p className="text-primary mt-0.5">{task}</p>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-500">
                          Selected Model:
                        </span>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Cpu size={10} /> {model}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-border-app/30 pt-3">
                    {reason}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="space-y-8">
          <Reveal className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase font-semibold">
              Workflow Efficiency
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Workflow Comparison
            </h2>
            <p className="text-secondary text-sm">
              How RouteMind differs from traditional, manual multi-model workspaces:
            </p>
          </Reveal>

          <Reveal>
            <div className="w-full overflow-x-auto rounded-xl border border-border-app bg-card-bg/40 backdrop-blur-xl">
              <table className="w-full border-collapse text-left text-sm font-sans">
                <thead className="bg-card-bg/70 border-b border-border-app text-xs font-semibold text-primary uppercase select-none">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-neutral-700 dark:text-neutral-300">
                      Feature Parameter
                    </th>
                    <th className="px-6 py-4 font-semibold text-red-500 dark:text-red-400/90">
                      Traditional Workflow
                    </th>
                    <th className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400/90">
                      RouteMind Workflow
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-app/40">
                  {[
                    ['Interface Model', 'Multiple tabs & developer keys', 'One unified console'],
                    ['Model Selection', 'Manual evaluation', 'Automatic proxy routing'],
                    [
                      'Experience Focus',
                      'Fragmented context switching',
                      'Unified conversation stream',
                    ],
                    [
                      'Orchestration Visibility',
                      'Hidden decisions & scores',
                      'Explainable routing decisions',
                    ],
                  ].map(([feature, before, after]) => (
                    <tr key={feature} className="hover:bg-card-bg/30 transition-colors">
                      <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                        {feature}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{before}</td>
                      <td className="px-6 py-4 text-primary font-medium">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                          {after}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* ── CLOSING CTA ── */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center max-w-2xl mx-auto space-y-8 py-12 select-none border border-border-app/40 bg-card-bg/30 backdrop-blur-xl rounded-2xl p-8 relative"
        >
          <div className="absolute inset-0 bg-blue-500/2 blur-2xl pointer-events-none rounded-2xl"></div>

          <div className="space-y-4">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight text-primary"
            >
              Focus on the problem. <br className="sm:hidden" />
              Let RouteMind choose the tool.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-secondary text-sm leading-relaxed">
              The future of AI is not about using a single model. It is about intelligently
              orchestrating multiple models and delivering the best outcome for every task.
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

      <Footer />
    </div>
  )
}

export default Benefits
