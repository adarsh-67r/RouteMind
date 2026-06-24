import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Benefits from './pages/Benefits'
import Documetation from './pages/Documetation'

const App = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/benefits' element={<Benefits/>}/>
        <Route path='/docs' element={<Documetation/>}/>
        <Route path='*' element={<Home/>}/>
      </Routes>
    </div>
  )
}

export default App
