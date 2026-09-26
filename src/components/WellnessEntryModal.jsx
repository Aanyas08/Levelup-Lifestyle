import { useState } from 'react'
import { X } from 'lucide-react'

function Field({ label, unit, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-400">
        {label}
        {unit && <span className="text-gray-600"> ({unit})</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'bg-surface-light border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--domain-accent)]/60 transition-colors'

export default function WellnessEntryModal({ wellness, onClose, onSave }) {
  const [form, setForm] = useState({
    sleep_hours: wellness.sleep_hours ?? '',
    hydration_ml: wellness.hydration_ml ?? '',
    hydration_target_ml: wellness.hydration_target_ml ?? 2500,
    mood: wellness.mood ?? '',
    energy: wellness.energy ?? '',
    activity_minutes: wellness.activity_minutes ?? '',
    workout_minutes: wellness.workout_minutes ?? '',
    workout_type: wellness.workout_type ?? '',
    steps: wellness.steps ?? '',
    meditation_minutes: wellness.meditation_minutes ?? '',
    screen_time_hours: wellness.screen_time_hours ?? '',
    nutrition_meals_logged: wellness.nutrition_meals_logged ?? '',
    nutrition_note: wellness.nutrition_note ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function num(field) {
    return (e) => set(field, e.target.value === '' ? '' : Number(e.target.value))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Empty strings mean "leave blank" — send null rather than "" so the
    // backend's optional numeric fields validate cleanly.
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    const res = await onSave(payload)
    setSaving(false)
    if (!res.ok) setError(res.error)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Update today's wellness</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="text-xs text-orange-300 bg-orange-400/10 border border-orange-400/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <Field label="Sleep" unit="hours">
            <input type="number" step="0.1" min="0" max="24" className={inputClass}
              value={form.sleep_hours} onChange={num('sleep_hours')} placeholder="7.2" />
          </Field>

          <Field label="Hydration" unit="ml">
            <input type="number" min="0" className={inputClass}
              value={form.hydration_ml} onChange={num('hydration_ml')} placeholder="1850" />
          </Field>

          <Field label="Hydration target" unit="ml">
            <input type="number" min="0" className={inputClass}
              value={form.hydration_target_ml} onChange={num('hydration_target_ml')} placeholder="2500" />
          </Field>

          <Field label="Mood" unit="1-5">
            <input type="number" min="1" max="5" className={inputClass}
              value={form.mood} onChange={num('mood')} placeholder="4" />
          </Field>

          <Field label="Energy" unit="1-5">
            <input type="number" min="1" max="5" className={inputClass}
              value={form.energy} onChange={num('energy')} placeholder="4" />
          </Field>

          <Field label="Activity" unit="minutes">
            <input type="number" min="0" className={inputClass}
              value={form.activity_minutes} onChange={num('activity_minutes')} placeholder="35" />
          </Field>

          <Field label="Workout" unit="minutes">
            <input type="number" min="0" className={inputClass}
              value={form.workout_minutes} onChange={num('workout_minutes')} placeholder="30" />
          </Field>

          <Field label="Workout type">
            <input type="text" maxLength={40} className={inputClass}
              value={form.workout_type} onChange={(e) => set('workout_type', e.target.value)} placeholder="Strength" />
          </Field>

          <Field label="Steps">
            <input type="number" min="0" className={inputClass}
              value={form.steps} onChange={num('steps')} placeholder="6500" />
          </Field>

          <Field label="Meditation" unit="minutes">
            <input type="number" min="0" className={inputClass}
              value={form.meditation_minutes} onChange={num('meditation_minutes')} placeholder="15" />
          </Field>

          <Field label="Screen time" unit="hours">
            <input type="number" step="0.1" min="0" max="24" className={inputClass}
              value={form.screen_time_hours} onChange={num('screen_time_hours')} placeholder="4.2" />
          </Field>

          <Field label="Meals logged">
            <input type="number" min="0" className={inputClass}
              value={form.nutrition_meals_logged} onChange={num('nutrition_meals_logged')} placeholder="3" />
          </Field>

          <div className="col-span-2">
            <Field label="Nutrition note" unit="optional">
              <input type="text" maxLength={200} className={inputClass}
                value={form.nutrition_note} onChange={(e) => set('nutrition_note', e.target.value)} placeholder="High protein" />
            </Field>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}