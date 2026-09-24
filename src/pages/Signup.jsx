import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    const res = await signup(name, email, password)
    setSubmitting(false)
    if (res.ok) navigate('/')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 levelup-glow">
      <div className="w-full max-w-sm levelup-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center mb-3">
            <Zap size={22} className="text-purple" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            LEVEL<span className="text-teal">UP</span>
          </span>
          <p className="text-gray-400 text-sm mt-1">Start your streak today.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4"
        >
          {error && (
            <div className="flex items-center gap-2 text-sm text-orange-300 bg-orange-400/10 border border-orange-400/20 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-400">Name</span>
            <div className="flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2.5 focus-within:border-purple/60 transition-colors">
              <User size={15} className="text-gray-500 shrink-0" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jay"
                className="bg-transparent text-sm w-full outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-400">Email</span>
            <div className="flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2.5 focus-within:border-purple/60 transition-colors">
              <Mail size={15} className="text-gray-500 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent text-sm w-full outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-400">Password</span>
            <div className="flex items-center gap-2 bg-surface-light border border-border rounded-lg px-3 py-2.5 focus-within:border-purple/60 transition-colors">
              <Lock size={15} className="text-gray-500 shrink-0" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="bg-transparent text-sm w-full outline-none placeholder:text-gray-600"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 bg-purple text-white font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
