import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { quoteApi } from '../api/client.js'

/**
 * "AI Daily Insight" card. Calls the backend once per mount; the backend
 * itself caches the Gemini call once per calendar day, so repeated visits
 * (and other users) don't re-trigger generation. Falls back silently to
 * whatever the backend's fallback pool returns if Gemini is unavailable —
 * the card doesn't need to know which mode it's in, it just renders text.
 */
export default function DailyQuoteCard() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    quoteApi
      .today()
      .then((res) => {
        if (!cancelled) setQuote(res.data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return null

  return (
    <div className="bg-surface border border-[var(--domain-accent)]/25 rounded-2xl p-5 flex items-start gap-3 mb-6 transition-colors duration-300">
      <span className="w-9 h-9 rounded-lg bg-[var(--domain-accent)]/15 text-[var(--domain-accent)] flex items-center justify-center shrink-0">
        <Sparkles size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--domain-accent)] mb-1">AI Daily Insight</p>
        {loading ? (
          <div className="h-4 w-2/3 bg-surface-light rounded animate-pulse" />
        ) : (
          <p className="text-sm text-gray-200 leading-relaxed">
            "{quote?.text}"
            {quote?.author && <span className="text-gray-500"> — {quote.author}</span>}
          </p>
        )}
      </div>
    </div>
  )
}
