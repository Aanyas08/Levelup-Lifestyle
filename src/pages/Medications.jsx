import { useEffect, useState, useCallback } from 'react'
import { Pill, Plus, Check, X as XIcon, Pencil, Trash2, Clock } from 'lucide-react'
import { medicationsApi } from '../api/client.js'
import MedicationFormModal from '../components/MedicationFormModal.jsx'
import NotificationPermissionBanner from '../components/NotificationPermissionBanner.jsx'

const STATUS_STYLE = {
  scheduled: 'text-gray-400 bg-surface-light',
  taken: 'text-[var(--domain-accent)] bg-[var(--domain-accent)]/10',
  missed: 'text-red-400 bg-red-400/10',
  skipped: 'text-amber-400 bg-amber-400/10',
}

function formatTime12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function DoseRow({ event, onLog }) {
  const [busy, setBusy] = useState(false)

  async function act(status) {
    setBusy(true)
    await onLog(event, status)
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-3 bg-surface-light rounded-xl px-4 py-3">
      <span className="w-9 h-9 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center shrink-0">
        <Pill size={16} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.medication_name}</p>
        <p className="text-xs text-gray-500">
          {formatTime12(event.scheduled_time)} · {event.dosage} · {event.form}
        </p>
      </div>

      {event.status === 'taken' ? (
        <span className="text-xs font-medium text-[var(--domain-accent)] flex items-center gap-1 shrink-0">
          <Check size={13} /> Taken{event.taken_at ? ` at ${new Date(event.taken_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
        </span>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLE[event.status]}`}>
            {event.status}
          </span>
          <button
            onClick={() => act('taken')}
            disabled={busy}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all disabled:opacity-50"
          >
            Mark taken
          </button>
          <button
            onClick={() => act('skipped')}
            disabled={busy}
            aria-label="Skip dose"
            className="w-8 h-8 rounded-lg bg-surface text-gray-400 flex items-center justify-center hover:text-white transition-colors disabled:opacity-50"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function Medications() {
  const [medications, setMedications] = useState([])
  const [todayEvents, setTodayEvents] = useState([])
  const [history, setHistory] = useState([])
  const [adherence, setAdherence] = useState(null)
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingMed, setEditingMed] = useState(null)

  const loadAll = useCallback(async () => {
    setError('')
    try {
      const [medsRes, todayRes, historyRes] = await Promise.all([
        medicationsApi.list(),
        medicationsApi.today(),
        medicationsApi.history({ days: 14 }),
      ])
      setMedications(medsRes.data)
      setTodayEvents(todayRes.data)
      setHistory(historyRes.data)
    } catch {
      setError('Could not load your medications right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAdherence = useCallback(async (p) => {
    try {
      const res = await medicationsApi.adherence(p)
      setAdherence(res.data)
    } catch {
      setAdherence(null)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    loadAdherence(period)
  }, [period, loadAdherence])

  async function handleLogDose(event, status) {
    try {
      await medicationsApi.logDose({
        medication_id: event.medication_id,
        scheduled_date: event.scheduled_date,
        scheduled_time: event.scheduled_time,
        status,
      })
      await loadAll()
      loadAdherence(period)
    } catch {
      setError('Could not update that dose — try again.')
    }
  }

  async function handleSaveMedication(payload) {
    try {
      if (editingMed) await medicationsApi.update(editingMed.id, payload)
      else await medicationsApi.create(payload)
      setFormOpen(false)
      setEditingMed(null)
      await loadAll()
      loadAdherence(period)
      return { ok: true }
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Could not save.'
      return { ok: false, error: message }
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this medicine? Its history will be removed too.')) return
    try {
      await medicationsApi.remove(id)
      await loadAll()
      loadAdherence(period)
    } catch {
      setError('Could not delete that medicine — try again.')
    }
  }

  const historyByDate = history.reduce((acc, e) => {
    ;(acc[e.scheduled_date] ||= []).push(e)
    return acc
  }, {})

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Medications</h1>
        <button
          onClick={() => { setEditingMed(null); setFormOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all"
        >
          <Plus size={15} /> Add medicine
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Track your medicines and scheduled doses — this doesn't offer medical advice, just reminders and records.
      </p>
      <NotificationPermissionBanner />

      {error && (
        <div className="text-xs text-orange-300 bg-orange-400/10 border border-orange-400/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Today's schedule */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold mb-4">Today's schedule</p>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 bg-surface-light rounded-xl animate-pulse" />)}
          </div>
        ) : todayEvents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No doses scheduled today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayEvents.map((e) => (
              <DoseRow key={`${e.medication_id}-${e.scheduled_time}`} event={e} onLog={handleLogDose} />
            ))}
          </div>
        )}
      </div>

      {/* Adherence */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">Adherence</p>
          <div className="flex bg-surface-light rounded-lg p-1">
            {['week', 'month', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  period === p ? 'bg-[var(--domain-accent)] text-bg' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {adherence ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-bold text-[var(--domain-accent)]">{adherence.adherence_pct}%</p>
              <p className="text-xs text-gray-500 mt-0.5">{adherence.taken} / {adherence.scheduled} doses taken</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Taken <b className="text-white">{adherence.taken}</b></span>
              <span>Missed <b className="text-white">{adherence.missed}</b></span>
              <span>Skipped <b className="text-white">{adherence.skipped}</b></span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No data yet for this period.</p>
        )}
      </div>

      {/* My medicines */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold mb-4">My medicines</p>
        {medications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No medicines added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {medications.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-surface-light rounded-xl px-4 py-3">
                <span className="w-9 h-9 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center shrink-0">
                  <Pill size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name} <span className="text-gray-500 font-normal">· {m.dosage} · {m.form}</span></p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={11} /> {m.times.map(formatTime12).join(', ')}
                    {!m.reminder_enabled && ' · reminders off'}
                    {m.end_date && ` · ends ${m.end_date}`}
                  </p>
                </div>
                <button onClick={() => { setEditingMed(m); setFormOpen(true) }} aria-label="Edit medicine"
                  className="w-8 h-8 rounded-lg bg-surface text-gray-400 flex items-center justify-center hover:text-white transition-colors shrink-0">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(m.id)} aria-label="Delete medicine"
                  className="w-8 h-8 rounded-lg bg-surface text-gray-400 flex items-center justify-center hover:text-orange-300 transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4">History (last 14 days)</p>
        {Object.keys(historyByDate).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nothing logged yet.</p>
        ) : (
          <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
            {Object.entries(historyByDate).map(([d, events]) => (
              <div key={d}>
                <p className="text-xs font-semibold text-gray-400 mb-2">{d}</p>
                <div className="flex flex-col gap-1.5">
                  {events.map((e) => (
                    <div key={`${e.medication_id}-${e.scheduled_time}`} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{formatTime12(e.scheduled_time)} — {e.medication_name}</span>
                      <span className={`font-medium capitalize ${
                        e.status === 'taken' ? 'text-[var(--domain-accent)]' : e.status === 'missed' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <MedicationFormModal
          medication={editingMed}
          onClose={() => { setFormOpen(false); setEditingMed(null) }}
          onSave={handleSaveMedication}
        />
      )}
    </div>
  )
}