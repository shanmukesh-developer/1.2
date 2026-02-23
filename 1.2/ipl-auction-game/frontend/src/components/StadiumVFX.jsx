import { useMemo } from 'react'

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function StadiumVFX({ density = 18 }) {
  const particles = useMemo(() => {
    const seed = 1337
    const rnd = mulberry32(seed)
    const arr = []
    for (let i = 0; i < density; i++) {
      const left = Math.round(rnd() * 100)
      const top = Math.round(rnd() * 100)
      const size = Math.round(1 + rnd() * 2)
      const dur = 4 + rnd() * 6
      const delay = rnd() * 4
      const hue = Math.round(180 + rnd() * 120)
      arr.push({ left, top, size, dur, delay, hue })
    }
    return arr
  }, [density])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)] blur-2xl" />

      <div className="absolute inset-0 vfx-spotlight vfx-spotlight-a" />
      <div className="absolute inset-0 vfx-spotlight vfx-spotlight-b" />

      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_10%,rgba(34,211,238,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_90%_10%,rgba(245,197,66,0.10),transparent_60%)]" />

      {particles.map((p, idx) => (
        <div
          key={idx}
          className="absolute rounded-full vfx-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `hsla(${p.hue}, 95%, 70%, 0.55)`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 vfx-grain" />
    </div>
  )
}
