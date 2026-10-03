import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, TrendingUp, Award, Gift, User, LogOut, Zap, Timer, Pill } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/timer', label: 'Timer', icon: Timer },
  { to: '/medications', label: 'Medications', icon: Pill },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="w-8 h-8 rounded-lg bg-[var(--domain-accent)]/15 text-[var(--domain-accent)] flex items-center justify-center transition-colors duration-300">
          <Zap size={16} />
        </span>
        <span className="font-bold text-sm tracking-tight">LevelUp</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--domain-accent)]/10 text-[var(--domain-accent)]'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-surface-light transition-colors w-full"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  )
}