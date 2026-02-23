import { useEffect, useMemo, useState } from 'react'

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function ConfettiBurst({ triggerKey }) {
  const [visible, setVisible] = useState(false)

  const pieces = useMemo(() => {
    const rnd = mulberry32((triggerKey || 1) ^ 0x9e3779b9)
    const colors = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#fb7185']
    const arr = []
    for (let i = 0; i < 44; i++) {
      const x = 20 + rnd() * 60
      const rot = rnd() * 360
      const drift = (rnd() - 0.5) * 360
      const dur = 900 + rnd() * 500
      const size = 6 + rnd() * 8
      arr.push({ x, rot, drift, dur, size, color: colors[i % colors.length] })
    }
    return arr
  }, [triggerKey])

  useEffect(() => {
    if (!triggerKey) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1400)
    return () => clearTimeout(t)
  }, [triggerKey])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, idx) => (
        <div
          key={idx}
          className="vfx-confetti"
          style={{
            left: `${p.x}%`,
            top: `-10px`,
            width: `${p.size}px`,
            height: `${Math.max(8, p.size * 1.6)}px`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDuration: `${p.dur}ms`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
