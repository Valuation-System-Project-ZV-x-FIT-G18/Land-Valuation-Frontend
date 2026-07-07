import { useEffect } from 'react'
import type { ReactNode } from 'react'

// Reusable popup/modal dialog.
// Closes on the X button, on clicking the dark backdrop, or pressing Escape.

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

const Modal = ({ open, onClose, title, children }: ModalProps) => {
  // Close on Escape, and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gold-400/25 bg-emerald-950 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-lg text-emerald-200 transition hover:text-gold-300"
        >
          ✕
        </button>

        {title && <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

export default Modal
