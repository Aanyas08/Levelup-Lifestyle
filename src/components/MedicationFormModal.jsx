import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

const FORMS = ['Tablet', 'Capsule', 'Syrup', 'Other']
const FREQUENCIES = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'custom', label: 'Custom' },
]
const INSTRUCTION_PRESETS = [
  { value: '', label: 'None' },
  { value: 'before_food', label: 'Before food' },
  { value: 'after_food', label: 'After food' },
  { value: 'with_food', label: 'With food' },
  { value: 'custom', label: 'Custom…' },
]

const inputClass =
  'bg-surface-light border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--domain-accent)]/60 transition-colors w-full'

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-gray-400">{label}</span>
      {children}
    </label>
  )
}

// Normalize an existing medication (edit mode) or blank defaults (add
// mode) into the modal's form state.
function initialForm(med) {
  const knownInstruction = INSTRUCTION_PRESETS.some((p) => p.value === (med?.instructions ?? ''))
  return {
    name: med?.name ?? '',
    dosage: med?.dosage ?? '',
    form: med?.form ?? 'Tablet',
    frequency: med?.frequency ?? 'once_daily',
    times: med?.times?.length ? [...med.times] : ['08:00'],
    instructionPreset: med ? (knownInstruction ? med.instructions || '' : 'custom') : '',
    instructionCustom: med && !knownInstruction ? med.instructions : '',
    start_date: med?.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: med?.end_date ?? '',
    reminder_enabled: med?.reminder_enabled ?? true,
    notes: med?.notes ?? '',
  }
}

export default function MedicationFormModal({ medication, onClose, onSave }) {
  const [form, setForm] = useState(() => initialForm(medication))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function setTime(i, value) {
    setForm((f) => {
      const times = [...f.times]
      times[i] = value
      return { ...f, times }
    })
  }

  function addTime() {
    setForm((f) => ({ ...f, times: [...f.times, ''] }))
  }

  function removeTime(i) {
    setForm((f) => ({ ...f, times: f.times.filter((_, idx) => idx !== i) }))
  }

  function validate() {
    if (!form.name.trim()) return 'Medicine name is required.'
    if (!form.dosage.trim()) return 'Dosage is required.'
    const cleanTimes = form.times.map((t) => t.trim()).filter(Boolean)
    if (cleanTimes.length === 0) return 'Add at least one reminder time.'
    if (form.end_date && form.end_date < form.start_date) return 'End date cannot be before start date.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const clientError = validate()
    if (clientError) {
      setError(clientError)
      return
    }
    setError('')
    setSaving(true)

    const instructions =
      form.instructionPreset === 'custom'
        ? form.instructionCustom.trim() || null
        : form.instructionPreset || null

    const payload = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      form: form.form,
      frequency: form.frequency,
      instructions,
      start_date: form.start_date,
      end_date: form.end_date || null,
      reminder_enabled: form.reminder_enabled,
      notes: form.notes.trim() || null,
      times: form.times.map((t) => t.trim()).filter(Boolean),
    }

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
          <h2 className="text-base font-semibold">{medication ? 'Edit medicine' : 'Add medicine'}</h2>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Medicine name">
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Medicine A" maxLength={120} required />
            </Field>
            <Field label="Dosage">
              <input className={inputClass} value={form.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="500 mg" maxLength={60} required />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Form">
              <select className={inputClass} value={form.form} onChange={(e) => set('form', e.target.value)}>
                {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Frequency">
              <select className={inputClass} value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Reminder times">
            <div className="flex flex-col gap-2">
              {form.times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="time" className={inputClass} value={t} onChange={(e) => setTime(i, e.target.value)} required />
                  {form.times.length > 1 && (
                    <button type="button" onClick={() => removeTime(i)} aria-label="Remove time"
                      className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-orange-300 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTime}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--domain-accent)] hover:brightness-110 transition-all self-start">
                <Plus size={13} /> Add another time
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" className={inputClass} value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required />
            </Field>
            <Field label="End date (optional)">
              <input type="date" className={inputClass} value={form.end_date} onChange={(e) => set('end_date', e.target.value)} min={form.start_date} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Instructions">
              <select className={inputClass} value={form.instructionPreset} onChange={(e) => set('instructionPreset', e.target.value)}>
                {INSTRUCTION_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            {form.instructionPreset === 'custom' && (
              <Field label="Custom instructions">
                <input className={inputClass} value={form.instructionCustom} onChange={(e) => set('instructionCustom', e.target.value)} maxLength={120} placeholder="e.g. with a full glass of water" />
              </Field>
            )}
          </div>

          <Field label="Notes (optional)">
            <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} maxLength={300} placeholder="Anything else worth remembering" />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.reminder_enabled} onChange={(e) => set('reminder_enabled', e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--domain-accent)]" />
            Enable reminders for this medicine
          </label>

          <p className="text-[11px] text-gray-500 -mt-1">
            This just tracks and reminds — it isn't medical advice and doesn't recommend dosages or changes.
          </p>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all disabled:opacity-60">
              {saving ? 'Saving…' : medication ? 'Save changes' : 'Add medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}