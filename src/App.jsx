import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Features from './pages/Features.jsx'
import Habits from './pages/Habits.jsx'
import TimerPage from './pages/TimerPage.jsx'
import Progress from './pages/Progress.jsx'
import Achievements from './pages/Achievements.jsx'
import Rewards from './pages/Rewards.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

function AppShell() {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-8 py-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/features" element={<Features />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}