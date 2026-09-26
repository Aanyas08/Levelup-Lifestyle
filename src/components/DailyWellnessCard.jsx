import { Droplet, Moon, Smile, Zap, Activity, Dumbbell, Footprints, Brain, Smartphone, Utensils, Pencil } from 'lucide-react'

const METRICS = [
  { key: 'sleep', label: 'Sleep', icon: Moon, format: (w) => (w.sleep_hours != null ? `${w.sleep_hours} hrs` : '—') },
  { key: 'hydration', label: 'Hydration', icon: Droplet, format: (w) => w.hydration_ml != null ? `${w.hydration_ml} / ${w.hydration_target_ml ?? 2500} ml` : '—' },
  { key: 'mood', label: 'Mood', icon: Smile, format: (w) => (w.mood != null ? `${w.mood} / 5` : '—') },
  { key: 'energy', label: 'Energy', icon: Zap, format: (w) => (w.energy != null ? `${w.energy} / 5` : '—') },
  { key: 'activity', label: 'Activity', icon: Activity, format: (w) => (w.activity_minutes != null ? `${w.activity_minutes} min` : '—') },
  { key: 'workout', label: 'Workout', icon: Dumbbell, format: (w) => w.workout_minutes != null ? `${w.workout_minutes} min${w.workout_type ? ` · ${w.workout_type}` : ''}` : '—' },
  { key: 'steps', label: 'Steps', icon: Footprints, format: (w) => (w.steps != null ? w.steps.toLocaleString() : '—') },
  { key: 'meditation', label: 'Meditation', icon: Brain, format: (w) => (w.meditation_minutes != null ? `${w.meditation_minutes} min` : '—') },
  { key: 'screenTime', label: 'Screen time', icon: Smartphone, format: (w) => (w.screen_time_hours != null ? `${w.screen_time_hours} hrs` : '—') },
  { key: 'nutrition', label: 'Nutrition', icon: Utensils, format: (w) => w.nutrition_meals_logged != null ? `${w.nutrition_meals_logged} meal${w.nutrition_meals_logged === 1 ? '' : 's'} logged${w.nutrition_note ? ` · ${w.nutrition_note}` : ''}` : '—' },
]

export default function DailyWellnessCard({ wellness, loading, onEdit }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold">Daily wellness</p>
        <button
          onClick={onEdit}
          aria-label="Edit today's wellness"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--domain-accent)] hover:brightness-110 transition-all"
        >
          <Pencil size={13} />
          Update
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-light rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {METRICS.map(({ key, label, icon: Icon, format }) => (
            <button
              key={key}
              onClick={onEdit}
              className="text-left bg-surface-light rounded-xl p-3 hover:border hover:border-[var(--domain-accent)]/30 border border-transparent transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1.5">
                <Icon size={12} className="text-[var(--domain-accent)]" />
                {label}
              </span>
              <span className="text-sm font-semibold block truncate">{format(wellness)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}