import { useEffect, useRef } from 'react'

export default function CheerFlash({ triggerKey }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!triggerKey || !ref.current) return
    const el = ref.current
    el.classList.remove('animate-cheer')
    void el.offsetWidth // reflow
    el.classList.add('animate-cheer')
    const t = setTimeout(() => el.classList.remove('animate-cheer'), 600)
    return () => clearTimeout(t)
  }, [triggerKey])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[55] opacity-0"
      style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.35), transparent 60%)' }}
    />
  )
}
