export function xpForLevel(level) {
  if (level <= 1) return 100
  const n = level
  return Math.round(100 + 12.5 * (n - 1) * (n + 2))
}

const RANKS = [
  { minLevel: 1, name: 'Beginner' },
  { minLevel: 3, name: 'Habit Apprentice' },
  { minLevel: 6, name: 'Consistency Knight' },
  { minLevel: 10, name: 'XP Hunter' },
  { minLevel: 15, name: 'Discipline Warrior' },
  { minLevel: 20, name: 'Focus Master' },
  { minLevel: 25, name: 'Routine Architect' },
  { minLevel: 30, name: 'Habit Legend' },
]

export function rankForLevel(level) {
  let current = RANKS[0].name
  for (const r of RANKS) {
    if (level >= r.minLevel) current = r.name
  }
  return current
}

export function nextRank(level) {
  return RANKS.find((r) => r.minLevel > level) || null
}

export const DIFFICULTY_REWARDS = {
  Easy: { xp: 15, coins: 5 },
  Medium: { xp: 25, coins: 10 },
  Hard: { xp: 50, coins: 20 },
  Epic: { xp: 100, coins: 40 },
}

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Epic']
