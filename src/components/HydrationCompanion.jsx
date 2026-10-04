import { useEffect, useState } from 'react'
import walkLeft0 from '../assets/walk_left_0.png'
import walkLeft1 from '../assets/walk_left_1.png'
import walkLeft2 from '../assets/walk_left_2.png'
import walkLeft3 from '../assets/walk_left_3.png'
import walkLeft4 from '../assets/walk_left_4.png'
import walkLeft5 from '../assets/walk_left_5.png'
import walkLeft6 from '../assets/walk_left_6.png'
import walkLeft7 from '../assets/walk_left_7.png'

import walkRight0 from '../assets/walk_right_0.png'
import walkRight1 from '../assets/walk_right_1.png'
import walkRight2 from '../assets/walk_right_2.png'
import walkRight3 from '../assets/walk_right_3.png'
import walkRight4 from '../assets/walk_right_4.png'
import walkRight5 from '../assets/walk_right_5.png'
import walkRight6 from '../assets/walk_right_6.png'
import walkRight7 from '../assets/walk_right_7.png'

import drink0 from '../assets/drink_0.png'
import drink1 from '../assets/drink_1.png'
import drink2 from '../assets/drink_2.png'
import drink3 from '../assets/drink_3.png'
import drink4 from '../assets/drink_4.png'
import drink5 from '../assets/drink_5.png'
import drink6 from '../assets/drink_6.png'
import drink7 from '../assets/drink_7.png'

import celebrate0 from '../assets/celebrate_0.png'
import celebrate1 from '../assets/celebrate_1.png'
import celebrate2 from '../assets/celebrate_2.png'
import celebrate3 from '../assets/celebrate_3.png'
import celebrate4 from '../assets/celebrate_4.png'

const WALK_LEFT = [
  walkLeft0,
  walkLeft1,
  walkLeft2,
  walkLeft3,
  walkLeft4,
  walkLeft5,
  walkLeft6,
  walkLeft7,
]

const WALK_RIGHT = [
  walkRight0,
  walkRight1,
  walkRight2,
  walkRight3,
  walkRight4,
  walkRight5,
  walkRight6,
  walkRight7,
]

const DRINK = [
  drink0,
  drink1,
  drink2,
  drink3,
  drink4,
  drink5,
  drink6,
  drink7,
]

const CELEBRATE = [
  celebrate0,
  celebrate1,
  celebrate2,
  celebrate3,
  celebrate4,
]

export default function HydrationCompanion() {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('walking')
  const [frame, setFrame] = useState(0)
  const [showBubble, setShowBubble] = useState(false)

  // TESTING:
  // 15 seconds for now.
  // Later change this to 60 * 60 * 1000 for one hour.
  const REMINDER_DELAY = 15000

  // Bring MIZU onto the screen periodically
  useEffect(() => {
    const timeout = setTimeout(() => {
      startReminder()
    }, REMINDER_DELAY)

    return () => clearTimeout(timeout)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!visible) return

    let frames

    if (mode === 'walking-left') {
      frames = WALK_LEFT
    } else if (mode === 'walking-right') {
      frames = WALK_RIGHT
    } else if (mode === 'drinking') {
      frames = DRINK
    } else if (mode === 'celebrating') {
      frames = CELEBRATE
    } else {
      return
    }

    const interval = setInterval(() => {
      setFrame((previous) => {
        const next = previous + 1

        if (next >= frames.length) {
          if (mode === 'drinking') {
            setMode('celebrating')
            return 0
          }

          if (mode === 'celebrating') {
            setMode('walking-right')
            return 0
          }

          if (mode === 'walking-right') {
            setVisible(false)
            setShowBubble(false)
            return 0
          }

          return 0
        }

        return next
      })
    }, 90)

    return () => clearInterval(interval)
  }, [mode, visible])

  function startReminder() {
    setVisible(true)
    setShowBubble(false)
    setMode('walking-left')
    setFrame(0)
  }

  function handleHydrate() {
    setShowBubble(false)
    setMode('drinking')
    setFrame(0)
  }

  function handleLater() {
    setShowBubble(false)
    setMode('walking-right')
    setFrame(0)

    // Show again after 15 minutes
    setTimeout(() => {
      startReminder()
    }, 15 * 60 * 1000)
  }

  // When MIZU finishes walking in, show the bubble
  useEffect(() => {
    if (mode !== 'walking-left') return

    const timer = setTimeout(() => {
      setMode('still')
      setFrame(0)
      setShowBubble(true)
    }, 1800)

    return () => clearTimeout(timer)
  }, [mode])

  if (!visible) return null

  let currentImage = WALK_LEFT[frame]

  if (mode === 'walking-right') {
    currentImage = WALK_RIGHT[frame]
  }

  if (mode === 'drinking') {
    currentImage = DRINK[frame]
  }

  if (mode === 'celebrating') {
    currentImage = CELEBRATE[frame]
  }

  if (mode === 'still') {
    currentImage = WALK_LEFT[0]
  }

  return (
    <div className="fixed bottom-16 right-8 z-[100] pointer-events-none">

      {/* Speech bubble */}
      {showBubble && (
  <div className="absolute bottom-[220px] right-0 w-64 pointer-events-auto">
    <div className="relative bg-[#101c2f] border border-blue-400/20 rounded-2xl shadow-2xl px-5 py-4">
      
      <p className="text-sm font-bold text-blue-200">
        💧 Time to Hydrate!
      </p>

      <p className="text-xs text-gray-400 mt-1">
        You've been focused for a while.
        Take a little water break.
      </p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleHydrate}
          className="flex-1 rounded-lg bg-[#3b82c4] text-white text-xs font-semibold py-2 hover:bg-[#4b92d4] transition"
        >
          I Drank Water 💧
        </button>

        <button
          onClick={handleLater}
          className="px-3 rounded-lg bg-[#182840] text-gray-300 text-xs font-semibold hover:bg-[#203653] transition"
        >
          Later
        </button>
      </div>

      <div className="absolute -bottom-2 right-10 w-4 h-4 bg-[#101c2f] border-r border-b border-blue-400/20 rotate-45" />
    </div>
  </div>
)}

      {/* Character */}
      <div className="w-[170px] h-[220px] flex items-end justify-center">
        <img
          src={currentImage}
          alt="LevelUp hydration companion"
          className="max-w-full max-h-full object-contain drop-shadow-lg"
          draggable="false"
        />
      </div>
    </div>
  )
}