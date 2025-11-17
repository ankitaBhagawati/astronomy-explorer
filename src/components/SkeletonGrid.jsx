import React from 'react'

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton" key={i}>
          <div className="media shimmer" style={{ height: 120 }} />
          <div className="card-body">
            <div className="sh-30 shimmer" />
            <div className="sh-16 shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}
