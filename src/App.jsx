import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Benefits from './pages/Benefits'
import Documentation from './pages/Documentation'

const NotFound = () => (
  <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center text-center px-4 select-none">
    <p className="text-blue-500 font-mono text-xs tracking-widest uppercase mb-3">Error 404</p>
    <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">Page Not Found</h1>
    <p className="text-secondary text-sm mb-8">
      The route you requested does not exist in the RouteMind proxy network.
    </p>
    <Link
      to="/"
      className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-lg border border-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      Return to Home
    </Link>
  </div>
)

const App = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
