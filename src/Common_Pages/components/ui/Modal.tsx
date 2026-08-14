import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

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

  // Render at document.body instead of inside an animated page container.
  // CSS transforms on page transitions otherwise make `position: fixed`
  // relative to the full page, which can place the dialog below the viewport
  // when the user has scrolled down.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-lg text-slate-400 transition hover:text-blue-700"
        >
          ✕
        </button>

        {title && <h3 className="mb-4 text-xl font-bold text-slate-900">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
