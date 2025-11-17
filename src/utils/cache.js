export function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch (e) { /* ignore */ }
}

export function getCache(key, maxAge = 1000 * 60 * 10) {
  try {
    const s = sessionStorage.getItem(key)
    if (!s) return null
    const { ts, data } = JSON.parse(s)
    if (Date.now() - ts > maxAge) return null
    return data
  } catch (e) { return null }
}
