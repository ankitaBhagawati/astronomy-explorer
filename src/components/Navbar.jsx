import React from 'react'

export default function Navbar({ active, setActive, theme, setTheme }) {
  return (
    <nav className="nav nav-white">
      <div className="brand">Astronomy Explorer</div>
      <div className="navlinks">
        {['Home','Rovers','Asteroids','Favorites','About'].map(item => (
          <button
            key={item}
            className={item === active ? 'active' : ''}
            onClick={() => setActive(item)}
            aria-current={item === active ? 'page' : undefined}
          >
            {item}
          </button>
        ))}
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}
