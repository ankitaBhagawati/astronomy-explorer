import { useState, useEffect, useRef } from 'react'

export default function useFetch(asyncFn, deps = []) {
  const isMounted = useRef(true)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    isMounted.current = true
    setLoading(true)
    asyncFn()
      .then(res => { if (isMounted.current) setData(res) })
      .catch(err => { if (isMounted.current) setError(err) })
      .finally(() => { if (isMounted.current) setLoading(false) })
    return () => { isMounted.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
