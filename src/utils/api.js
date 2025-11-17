import axios from 'axios'

const BASE = 'https://api.nasa.gov'
const KEY = import.meta.env.VITE_NASA_KEY || '3mUV2yyMHbvdFAFCi1DekHWqoFUoFHKF8DQLnYDx'

export async function fetchAPOD(date) {
  const url = `${BASE}/planetary/apod`;
  const params = { api_key: KEY }
  if (date) params.date = date
  const res = await axios.get(url, { params })
  return res.data
}

export async function fetchMarsPhotos(rover = 'curiosity', params = {}) {
  const url = `${BASE}/mars-photos/api/v1/rovers/${rover}/photos`
  const p = { api_key: KEY, ...params }
  const res = await axios.get(url, { params: p })
  return res.data.photos || []
}

export async function fetchNeoWs(start_date, end_date) {
  const url = `${BASE}/neo/rest/v1/feed`
  const params = { api_key: KEY, start_date, end_date }
  const res = await axios.get(url, { params })
  return res.data
}
