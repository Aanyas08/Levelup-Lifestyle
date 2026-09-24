import {
  BookOpen, Droplet, Dumbbell, Sparkles, Sun, Moon, Brain, Heart,
  Music, Coffee, Pencil, Code, Leaf, Target, Timer, Hash, Wallet,
  Bike, Utensils, Bed, PenTool, GraduationCap, HeartPulse, Smile,
  Activity, Salad, Wind, Footprints,
} from 'lucide-react'

export const ICONS = {
  BookOpen, Droplet, Dumbbell, Sparkles, Sun, Moon, Brain, Heart,
  Music, Coffee, Pencil, Code, Leaf, Target, Timer, Hash, Wallet,
  Bike, Utensils, Bed, PenTool, GraduationCap, HeartPulse, Smile,
  Activity, Salad, Wind, Footprints,
}

export function getIcon(key) {
  return ICONS[key] || Target
}

// Tailwind-safe color classes (must exist as literal strings somewhere
// in source for the JIT compiler to pick them up).
export const COLOR_CLASSES = {
  purple: { text: 'text-purple', bg: 'bg-purple/10' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-400/10' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-400/10' },
  teal: { text: 'text-teal', bg: 'bg-teal/10' },
  gold: { text: 'text-gold', bg: 'bg-gold/10' },
  green: { text: 'text-green-400', bg: 'bg-green-400/10' },
  pink: { text: 'text-pink-300', bg: 'bg-pink-300/10' },
}

export function colorClasses(color) {
  return COLOR_CLASSES[color] || COLOR_CLASSES.teal
}

// Categories used to group the Health-domain dashboard widgets. A habit's
// `category` string is matched case-insensitively against these known
// buckets; anything unmatched falls into "Other" so the widget grid never
// silently drops a habit.
export const HEALTH_CATEGORY_ICONS = {
  Sleep: Moon,
  Hydration: Droplet,
  Energy: Activity,
  Nutrition: Salad,
  Fitness: Dumbbell,
  Mood: Smile,
  Mindfulness: Wind,
  Steps: Footprints,
  Vitals: HeartPulse,
  Other: Target,
}
