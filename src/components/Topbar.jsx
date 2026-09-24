import { Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import DomainToggle from './DomainToggle.jsx'

export default function Topbar() {
  const { user } = useAuth()
  const initial = user?.name?.[0]?.toUpperCase() || '?'

  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <DomainToggle />

      <div className="flex items-center gap-5">
        <button aria-label="Notifications" className="text-gray-400 hover:text-white transition-colors">
          <Bell size={19} />
        </button>
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--domain-accent)]/20 text-[var(--domain-accent)] flex items-center justify-center text-sm font-semibold transition-colors duration-300">
            {initial}
          </div>
          <span className="text-sm font-medium">{user?.name || '...'}</span>
          <ChevronDown size={15} className="text-gray-400" />
        </button>
      </div>
    </header>
  )
}
