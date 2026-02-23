import { useEffect, useMemo, useState } from 'react'

const memCache = new Map()

function toWikiTitle(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '_')
}

export function useWikiThumbnail(name) {
  const title = useMemo(() => toWikiTitle(name), [name])
  const [url, setUrl] = useState(() => {
    if (!title) return null
    return memCache.get(title) || null
  })

  useEffect(() => {
    if (!title) return
    const cached = memCache.get(title)
    if (cached) {
      setUrl(cached)
      return
    }

    let cancelled = false
    const ac = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
          signal: ac.signal,
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) return
        const data = await res.json()
        const thumb = data?.thumbnail?.source || null
        if (thumb) memCache.set(title, thumb)
        if (!cancelled) setUrl(thumb)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
      ac.abort()
    }
  }, [title])

  return url
}
