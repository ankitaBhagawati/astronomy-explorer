import React from 'react'

export default function ImageCard({ item, onFav, isFav, onOpen }) {
  const thumb = item.img_src || item.url || item.hdurl || item.thumbnail_url

  return (
    <div className="card" tabIndex={0}>
      <div className="media" onClick={() => onOpen && onOpen(item)} role="button">
        <img src={thumb} alt={item.title || item.id} loading="lazy" />
      </div>
      <div className="card-body">
        <h4 title={item.title || item.id}>{item.title ? item.title.slice(0, 48) : (item.camera?.full_name || item.id)}</h4>
        <div className="meta">{item.date || item.earth_date || ''}</div>
        <div className="card-actions">
          <button
            className={`heart-btn ${isFav ? 'filled' : 'empty'}`}
            onClick={() => onFav(item)}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isFav ? (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="#ff4d6d" d="M12 21s-7-4.6-9-7.2C1.4 11.6 3 7 6 6c1.8-.6 3.5.3 4.7 1.6C11.5 6.3 13.2 5.4 15 6c3 1 4.6 5.6 3 7.8C19 16.4 12 21 12 21z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M12.1 8.64l-.1.1-.11-.1C10.14 6.9 7.4 7.1 6.1 9.5c-1.5 2.9 1 6.3 6 10.1 5-3.8 7.5-7.2 6-10.1-1.3-2.4-4.1-2.6-6-1.86z" fillOpacity="0.15"/>
                <path d="M12.1 21.35l-1.1-.95C5.14 16.24 2 12.7 2 9.5 2 6.42 4.42 4 7.5 4c1.74 0 3.41.81 4.5 2.09C13.09 4.81 14.76 4 16.5 4 19.58 4 22 6.42 22 9.5c0 3.2-3.14 6.74-9 10.9l-1.1.95z" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
