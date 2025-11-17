import React, { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, children }) {
  const ref = useRef()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    // focus first focusable element inside modal
    const focusFirst = () => {
      const focusable = ref.current?.querySelectorAll('button,a,input,textarea,[tabindex]')
      focusable?.[0]?.focus?.()
    }
    focusFirst()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    function trap(e) {
      if (!ref.current) return
      const focusable = Array.from(ref.current.querySelectorAll('button,a,input,textarea,[tabindex]')).filter(Boolean)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', trap)
      prev?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal" onClick={e => e.stopPropagation()} ref={ref}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
