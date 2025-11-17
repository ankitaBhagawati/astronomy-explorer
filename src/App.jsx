import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import ImageCard from './components/ImageCard'
import Modal from './components/Modal'
import SkeletonGrid from './components/SkeletonGrid'
import { fetchAPOD, fetchMarsPhotos, fetchNeoWs } from './utils/api'
import useFetch from './hooks/useFetch'
import useDebounce from './hooks/useDebounce'
import { isValidSol } from './utils/validation'
import { getCache, setCache } from './utils/cache'

const todayISO = () => new Date().toISOString().slice(0, 10)

function useLocalFavorites() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fav')) || [] }
    catch { return [] }
  })
  useEffect(() => { localStorage.setItem('fav', JSON.stringify(items)) }, [items])
  return [items, setItems]
}

export default function App() {

  const [active, setActive] = useState('Home')

  // APOD
  const [apodDate, setApodDate] = useState(todayISO())
  const [apodDateError, setApodDateError] = useState('')
  const { data: apod, loading: apodLoading, error: apodError } =
    useFetch(() => fetchAPOD(apodDate), [apodDate])

  // Rovers
  const [rover, setRover] = useState('curiosity')
  const [sol, setSol] = useState(1000)
  const debouncedSol = useDebounce(sol, 400)
  const [marsPhotos, setMarsPhotos] = useState([])
  const [marsLoading, setMarsLoading] = useState(false)
  const [marsError, setMarsError] = useState('')

  // Asteroids
  const [neoData, setNeoData] = useState(null)
  const [neoLoading, setNeoLoading] = useState(false)
  const [neoError, setNeoError] = useState('')

  // Favorites
  const [favorites, setFavorites] = useLocalFavorites()

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalItem, setModalItem] = useState(null)

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (active === 'Rovers') fetchMars()
    if (active === 'Asteroids') fetchNeo()
  }, [active])

  function onChangeApodDate(value) {
    const max = todayISO()
    if (value > max) {
      setApodDateError('Cannot select a future date.')
    } else {
      setApodDateError('')
      setApodDate(value)
    }
  }

  async function fetchMars() {
    const check = isValidSol(rover, debouncedSol)
    if (!check.ok) { setMarsError(check.msg); return }

    setMarsError('')
    const key = `mars-${rover}-${debouncedSol}`
    const cached = getCache(key)

    if (cached) {
      setMarsPhotos(cached)
      return
    }

    setMarsLoading(true)
    try {
      const photos = await fetchMarsPhotos(rover, { sol: debouncedSol })
      const arr = Array.isArray(photos) ? photos : (photos?.photos || [])
      setMarsPhotos(arr)
      setCache(key, arr)
    } catch (err) {
      setMarsError('Failed to load Mars photos.')
      setMarsPhotos([])
    } finally {
      setMarsLoading(false)
    }
  }

  async function fetchNeo() {
    setNeoLoading(true)
    try {
      const today = todayISO()
      const cached = getCache(`neo-${today}`)
      if (cached) { setNeoData(cached); setNeoLoading(false); return }

      const data = await fetchNeoWs(today, today)
      setNeoData(data)
      setCache(`neo-${today}`, data)
    } catch (err) {
      setNeoError('Failed to fetch asteroid data.')
    } finally {
      setNeoLoading(false)
    }
  }

  function toggleFav(item) {
    if (!item) return
    const key = item.id || item.date || item.url || item.img_src
    if (favorites.some(f =>
      (f.id || f.date || f.url || f.img_src) === key
    )) {
      setFavorites(favorites.filter(f =>
        (f.id || f.date || f.url || f.img_src) !== key
      ))
    } else {
      setFavorites([item, ...favorites])
    }
  }

  function isItemFav(item) {
    if (!item) return false
    const key = item.id || item.date || item.url || item.img_src
    return favorites.some(f =>
      (f.id || f.date || f.url || f.img_src) === key
    )
  }

  function openModal(item) {
    setModalItem(item)
    setModalOpen(true)
  }

  return (
    <div className="app">
      {/* NAV */}
      <Navbar active={active} setActive={setActive} theme={theme} setTheme={setTheme} />

      <main className="container">

        {/* HOME / APOD */}
        {active === 'Home' && (
          <section>
            <div className="panel">
              <h2>Astronomy Picture</h2>

              <div className="row controls">
                <input
                  type="date"
                  value={apodDate}
                  max={todayISO()}
                  onChange={e => onChangeApodDate(e.target.value)}
                />

                <div className="spacer"></div>

                <button
                  className={`heart-btn ${isItemFav(apod) ? 'filled' : 'empty'}`}
                  onClick={() => toggleFav(apod)}
                  title="Save to Favorites"
                >
                  {isItemFav(apod)
                    ? <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#ff4d6d" d="M12 21s-7-4.6-9-7.2C1.4 11.6 3 7 6 6c1.8-.6 3.5.3 4.7 1.6C11.5 6.3 13.2 5.4 15 6c3 1 4.6 5.6 3 7.8C19 16.4 12 21 12 21z" /></svg>
                    : <svg width="24" height="24" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.2" fill="none" d="M12.1 21.35l-1.1-.95C5.14 16.24 2 12.7 2 9.5 2 6.42 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.1C13.1 4.8 14.8 4 16.5 4 19.6 4 22 6.4 22 9.5c0 3.2-3.1 6.7-9 10.9z"/></svg>
                  }
                </button>
              </div>

              {apodDateError && <p className="input-error">{apodDateError}</p>}
              {apodLoading && <p className="muted">Loading…</p>}
              {apodError && <p className="muted">Error loading APOD.</p>}

              {apod && (
                <div className="apod">
                  <div className="apod-media" onClick={() => openModal(apod)}>
                    {apod.media_type === 'video'
                      ? <iframe src={apod.url} title="APOD Video" allowFullScreen />
                      : <img src={apod.hdurl || apod.url} alt={apod.title} />
                    }
                  </div>

                  <div className="apod-meta">
                    <h3>{apod.title}</h3>
                    <p className="date">{apod.date}</p>
                    <p className="explain">{apod.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ROVERS */}
        {active === 'Rovers' && (
          <section>
            <div className="panel">
              <h2>Mars Rover Gallery</h2>

              <div className="row controls">
                <select value={rover} onChange={e => setRover(e.target.value)}>
                  <option value="curiosity">Curiosity</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="spirit">Spirit</option>
                </select>

                <input
                  type="number"
                  value={sol}
                  onChange={e => setSol(e.target.value)}
                />

                      <button
          className="icon-btn"
          onClick={fetchMars}
          disabled={marsLoading}
          title="Search"
        >
          🔍
        </button>

        <div className="spacer"></div>


              </div>

              {marsError && <p className="input-error">{marsError}</p>}
              {marsLoading && <SkeletonGrid count={8} />}

              <div className="grid">
                {(!marsLoading && marsPhotos.length === 0) &&
                  <p className="muted">No photos found</p>
                }

                {marsPhotos.map(photo => (
                  <ImageCard
                    key={photo.id}
                    item={photo}
                    isFav={isItemFav(photo)}
                    onFav={toggleFav}
                    onOpen={openModal}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ASTEROIDS */}
        {active === 'Asteroids' && (
          <section>
            <div className="panel">
              <h2>Near-Earth Objects</h2>


              {neoLoading && <p className="muted">Loading…</p>}
              {neoError && <p className="input-error">{neoError}</p>}

                {neoData && (
      <div className="asteroid-panel">
        <p className="muted">
          Asteroids for {Object.keys(neoData.near_earth_objects)[0]}
        </p>

        <table className="neo-table">

                    <thead>
                      <tr>
                        <th>Name</th><th>Diameter</th><th>Distance</th><th>Velocity</th><th>Hazard</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(neoData.near_earth_objects)[0].map(obj => (
                        <tr key={obj.id}>
                          <td>{obj.name}</td>
                          <td>{((obj.estimated_diameter.meters.estimated_diameter_min +
                            obj.estimated_diameter.meters.estimated_diameter_max) / 2).toFixed(1)} m</td>
                          <td>{Number(obj.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km</td>
                          <td>{Number(obj.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0)}</td>
                          <td>{obj.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                      </table>
                      </div>
                    )}
            </div>
          </section>
        )}

        {/* FAVORITES */}
        {active === 'Favorites' && (
          <section>
            <div className="panel">
              <h2>Favorites ❤️</h2>
              <div className="grid">
                {favorites.length === 0 && <p className="muted">No favorites saved.</p>}

                {favorites.map((fav, idx) => (
                  <ImageCard
                    key={idx}
                    item={fav}
                    isFav={true}
                    onFav={toggleFav}
                    onOpen={openModal}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ABOUT PAGE */}
        {active === 'About' && (
          <section>
            <div className="panel">


              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                alignItems: 'start'
              }}>

                {/* ABOUT THE APP */}
                <div>
                  <h3>About the App</h3>
                  <p>
                    <strong>🚀Astronomy Explorer</strong> is a lightweight React app that brings the
                    universe straight to your screen no telescope required. It fetches space images,
                    Mars rover photos, and asteroid data using NASA’s APIs.
                  </p>

                  <p>
                    It was built to demonstrate clean UI, smooth API integration, and fast performance…
                    but mostly because I was getting bored and wanted to create something.
                  </p>

                  <p><strong>✨ Key Features</strong></p>
                  <ul>
                    <li>🌌 <strong>APOD Viewer</strong> — daily NASA photo + explanation </li>
                    <li>🤖 <strong>Mars Rover Gallery</strong> — search by rover & sol</li>
                    <li>☄️ <strong>Asteroid Dashboard</strong> — see if anything is headed toward Earth today</li>
                    <li>❤️ <strong>Favorites</strong> — store your fave cosmic shots</li>
                    <li>🌓 <strong>Dark/Light Mode</strong> — for humans and aliens alike</li>
                  
                  </ul>
                </div>

                {/* TECH STACK */}
                <div>
                  <h3>Tech & APIs Used</h3>

                  <p><strong>🧩 Frontend Tech</strong></p>
                  <ul>
                    <li>⚛️ <strong>React</strong> (hooks + components)</li>
                    <li>⚡ <strong>Vite</strong> (superfast dev tool)</li>
                    <li>🎨 <strong>Custom CSS</strong> (handcrafted, lightweight UI)</li>
                  </ul>

                  <p><strong>🔧 Utilities</strong></p>
                  <ul>
                    <li>🔌 <strong>Axios</strong> for API calls</li>
                    <li>🪄 <strong>Custom hooks</strong> (useFetch, useDebounce)</li>
                    <li>💾 <strong>localStorage & sessionStorage</strong></li>
                    <li>🌌 <strong>APOD API</strong></li>
                    <li>🤖 <strong>Mars Rover Photos API</strong></li>
                    <li>☄️ <strong>NeoWs Asteroid API</strong></li>
                  </ul>
                </div>

              </div>

            </div>
          </section>
        )}

      </main>


      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {modalItem && (
          <div className="modal-inside">
            {modalItem.media_type === 'video'
              ? <iframe src={modalItem.url} allowFullScreen style={{ width: '100%', height: 420 }} />
              : <img src={modalItem.hdurl || modalItem.img_src || modalItem.url} alt="preview" />
            }

            <h3>{modalItem.title || modalItem.id}</h3>
            <p className="muted">{modalItem.date || modalItem.earth_date}</p>
            <p style={{ maxHeight: 150, overflow: 'auto' }}>
              {modalItem.explanation || modalItem.camera?.full_name}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
