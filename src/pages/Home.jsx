import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sliders,
  Coins,
  ArrowUpRight,
  Activity,
  Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { TERMINAL_EXAMPLES as EXAMPLES } from '../data/mockData'
import { fadeInUp, stagger } from '../utils/animations'

// Terminal Simulator Component
const TerminalSimulator = () => {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [typedPrompt, setTypedPrompt] = useState('')
  const [visibleSteps, setVisibleSteps] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [phase, setPhase] = useState('typing')

  const current = EXAMPLES[exampleIndex]

  useEffect(() => {
    let active = true
    let timer

    if (phase === 'typing') {
      timer = setTimeout(() => {
        if (!active) return
        setTypedPrompt('')
        setVisibleSteps([])
        setShowResult(false)

        let charIndex = 0
        const fullText = current.prompt

        const typeChar = () => {
          if (!active) return
          if (charIndex < fullText.length) {
            setTypedPrompt(fullText.slice(0, charIndex + 1))
            charIndex++
            timer = setTimeout(typeChar, 40 + Math.random() * 20)
          } else {
            timer = setTimeout(() => {
              if (active) setPhase('steps')
            }, 350)
          }
        }
        timer = setTimeout(typeChar, 100)
      }, 0)
    } else if (phase === 'steps') {
      let stepIdx = 0
      const printStep = () => {
        if (!active) return
        if (stepIdx < current.steps.length) {
          setVisibleSteps((prev) => [...prev, current.steps[stepIdx]])
          stepIdx++
          timer = setTimeout(printStep, 450)
        } else {
          timer = setTimeout(() => {
            if (active) setPhase('result')
          }, 400)
        }
      }
      printStep()
    } else if (phase === 'result') {
      timer = setTimeout(() => {
        if (!active) return
        setShowResult(true)
        timer = setTimeout(() => {
          if (!active) return
          setPhase('typing')
          setExampleIndex((prev) => (prev + 1) % EXAMPLES.length)
        }, 4500)
      }, 0)
    }

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [exampleIndex, phase, current.prompt, current.steps])

  return (
    <div className="w-full max-w-2xl bg-card-bg/60 backdrop-blur-xl border border-border-app rounded-xl shadow-2xl overflow-hidden font-mono text-left select-none relative">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-sidebar-bg/70 backdrop-blur-md border-b border-border-app text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] opacity-80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] opacity-80" />
        </div>
        <span className="text-[10px] tracking-wider text-neutral-500 font-mono font-medium">
          routemind-proxy-edge-01
        </span>
        <div className="flex items-center gap-1 text-[#22C55E] text-[10px] animate-pulse">
          <Activity size={10} />
          <span>PROXY ACTIVE</span>
        </div>
      </div>

      {/* Terminal Window Content */}
      <div className="p-5 space-y-4 text-[13px] min-h-[290px] leading-relaxed">
        <div className="flex items-start gap-2">
          <span className="text-[#3B82F6] font-bold shrink-0">$</span>
          <p className="text-neutral-900 dark:text-[#FAFAFA] font-medium break-words">
            {typedPrompt}
            {phase === 'typing' && (
              <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse ml-0.5" />
            )}
          </p>
        </div>

        <div className="space-y-2">
          {visibleSteps.map((step, idx) => {
            const isLast = idx === visibleSteps.length - 1
            const isCompleted = !isLast || phase === 'result'
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-neutral-400 animate-in fade-in slide-in-from-left-1 duration-200"
              >
                {isCompleted ? (
                  <span className="text-[#22C55E] font-semibold shrink-0">✓</span>
                ) : (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                )}
                <span>{step}</span>
              </div>
            )
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 pt-4 border-t border-border-app/60 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-950/20 border border-blue-500/20 text-blue-400 font-semibold font-mono text-xs">
                  <Cpu size={11} className="text-blue-500" />
                  <span>{current.selectedModel} Selected</span>
                </div>
                <div className="text-[10px] text-green-400 font-mono bg-green-950/20 border border-green-500/10 px-2 py-0.5 rounded">
                  Savings: {current.savings}
                </div>
              </div>
              <div className="text-neutral-400 text-xs leading-relaxed bg-sidebar-bg border border-border-app/80 p-3 rounded-lg flex items-start gap-2">
                <Info size={12} className="text-neutral-500 shrink-0 mt-0.5" />
                <p>{current.reason}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2 border-t border-border-app/40 bg-sidebar-bg/30 text-[9px] text-neutral-600 flex justify-between font-mono">
        <span>Latency: &lt;12ms Edge Overhead</span>
        <span>Route Code: RM_AUTO_PROXY</span>
      </div>
    </div>
  )
}

const Home = () => {
  return (
    <div className="min-h-screen bg-app-bg text-primary flex flex-col font-sans selection:bg-blue-600/30 selection:text-white relative overflow-x-hidden">
      <Navbar />

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-card-bg)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-card-bg)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] opacity-85 pointer-events-none -z-10"></div>

      {/* Glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pt-20 pb-28 relative">
        <motion.div
          className="max-w-4xl mx-auto space-y-12 flex flex-col items-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/20 backdrop-blur-sm text-[11px] font-medium text-blue-400 font-mono select-none"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            ACTIVE PROXY SYSTEM: ONLINE
          </motion.div>

          {/* Headline */}
          <div className="space-y-4">
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-6xl font-bold tracking-tight text-primary max-w-3xl leading-[1.08] sm:leading-[1.04]"
            >
              One Interface. <br className="hidden sm:inline" />
              Every AI.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Zero Guesswork.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-[#A1A1AA] text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            >
              RouteMind automatically selects the best AI model for every task based on intent,
              cost, latency, and performance requirements.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 pt-2 select-none"
          >
            <Link
              to="/chat"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <span>Start Routing</span>
              <ChevronRight size={15} />
            </Link>
            <a
              href="#features"
              className="bg-card-bg backdrop-blur-sm hover:bg-sidebar-bg text-primary font-medium text-sm px-6 py-3 rounded-lg border border-border-app flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-700/50"
            >
              <span>View Architecture</span>
            </a>
          </motion.div>

          {/* Terminal */}
          <motion.div
            variants={fadeInUp}
            className="w-full flex justify-center pt-8 relative group"
          >
            <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"></div>
            <TerminalSimulator />
          </motion.div>
        </motion.div>
      </main>

      {/* ── Provider logos ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="py-12 border-t border-border-app/40 bg-sidebar-bg/40 backdrop-blur-sm relative select-none"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-semibold text-neutral-600 font-mono tracking-widest uppercase mb-6">
            Supported Routing Destinations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-semibold font-mono text-neutral-500">
            {['OpenAI', 'Claude', 'Gemini', 'Search Models'].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-2 hover:text-primary transition-colors duration-200"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === 0
                      ? 'bg-blue-500/60'
                      : i === 1
                        ? 'bg-orange-500/60'
                        : i === 2
                          ? 'bg-red-500/60'
                          : 'bg-green-500/60'
                  }`}
                />
                <span>{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Features section ── */}
      <section id="features" className="py-24 border-t border-border-app/40 bg-app-bg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center gap-1.5 text-[#3B82F6] font-mono text-xs uppercase tracking-wider">
              <Sliders size={12} />
              <span>Core Engine Benefits</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-primary">
              High-Performance Optimization
            </h2>
            <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed">
              We manage inference complexity. Reduce cost overheads without sacrificing coding and
              contextual depths.
            </p>
          </motion.div>

          {/* Feature cards — staggered scroll reveal */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                icon: <Zap size={16} />,
                iconBg: 'bg-blue-950/20 border-blue-500/10 text-[#3B82F6]',
                title: 'Intelligent Routing',
                desc: 'Automatically analyze code prompts and long documents to match with optimal model specifications on the fly.',
              },
              {
                icon: <ShieldCheck size={16} />,
                iconBg: 'bg-green-950/20 border-green-500/10 text-[#22C55E]',
                title: 'Explainable Decisions',
                desc: 'Full transparency. Every decision shows model comparisons, latency measurements, and scoring logic breakdown.',
              },
              {
                icon: <Coins size={16} />,
                iconBg: 'bg-yellow-950/20 border-yellow-500/10 text-[#F59E0B]',
                title: 'Cost Optimization',
                desc: 'Route simpler intent queries to fast, cost-efficient models. Save up to 80% on standard inference pricing.',
              },
            ].map(({ icon, iconBg, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                className="bg-card-bg/60 backdrop-blur-md border border-border-app rounded-xl p-6 space-y-4 transition-all duration-200 hover:border-border-app/80 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div
                  className={`p-2 rounded border w-9 h-9 flex items-center justify-center ${iconBg}`}
                >
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55 }}
        className="py-24 border-t border-border-app/40 bg-sidebar-bg/40 backdrop-blur-sm relative"
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 select-none">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-primary">
            Experience AI Optimization
          </h2>
          <p className="text-[#A1A1AA] text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Integrate our proxy layer and experience sub-10ms routing decisions without changing
            your workflow.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/chat"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>Launch RouteMind Chat</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}

export default Home
