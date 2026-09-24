import { HeartPulse, Sparkles, Timer, Hash, CalendarDays, Award } from 'lucide-react'
import FeatureCard from '../components/FeatureCard.jsx'

const FEATURES = [
  { icon: HeartPulse, title: 'Health dashboard', description: 'Sleep, hydration, energy, and mood tracked in one wellness view.' },
  { icon: Sparkles, title: 'Gamified lifestyle', description: 'XP, levels, streaks, and badges for the habits you build.' },
  { icon: Timer, title: 'Timer tracking', description: 'Count up to a target duration for focus sessions and workouts.' },
  { icon: Hash, title: 'Numeric tracking', description: 'Log any measurable value — water, pages, reps, screen time.' },
  { icon: CalendarDays, title: 'Scheduling', description: 'Everyday, specific weekdays, or a one-off date for tasks.' },
  { icon: Award, title: 'Achievements', description: 'Badges that unlock as your streaks and totals grow.' },
]

export default function Features() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Features</h1>
      <p className="text-gray-400 text-sm mb-6">Everything LevelUp tracks, across both Health and Lifestyle.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </div>
  )
}
