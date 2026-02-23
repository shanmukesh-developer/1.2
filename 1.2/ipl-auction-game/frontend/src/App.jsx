import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Room from './pages/Room.jsx'
import Rooms from './pages/Rooms.jsx'
import Auction from './pages/Auction.jsx'
import Squad from './pages/Squad.jsx'
import Analysis from './pages/Analysis.jsx'
import Results from './pages/Results.jsx'
import Celebration from './pages/Celebration.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room" element={<Room />} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/results" element={<Results />} />
        <Route path="/celebration" element={<Celebration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
