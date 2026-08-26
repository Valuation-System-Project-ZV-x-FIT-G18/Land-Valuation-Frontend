import { useEffect, useState } from 'react'

// Shows the user's uploaded profile picture, or their initials if none is set.
// Used anywhere a user is represented: topbar, dashboard, settings.

type AvatarProps = {
  userId: string
  name: string
  photoPath?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
}

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

// Cache-busted so a freshly-uploaded picture replaces the old one immediately.
export const avatarUrl = (userId: string, photoPath: string) =>
  `/api/auth/avatar?userId=${encodeURIComponent(userId)}&v=${encodeURIComponent(photoPath)}`

const Avatar = ({ userId, name, photoPath, size = 'md', className = '' }: AvatarProps) => {
  // The avatar endpoint requires a token, and a plain <img src> cannot send
  // one. So fetch the image through the authenticated fetch and render the
  // bytes from a local object URL instead.
  const [source, setSource] = useState('')
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-emerald-950 shadow ring-2 ring-white/10 ${sizeClasses[size]} ${className}`

  useEffect(() => {
    setSource('')
    if (!photoPath || !userId) return

    let objectUrl = ''
    let cancelled = false
    fetch(avatarUrl(userId, photoPath))
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!blob || cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSource(objectUrl)
      })
      .catch(() => {
        /* fall back to initials */
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoPath, userId])

  if (source) {
    return <img src={source} alt={name} className={`${base} bg-surface object-cover`} />
  }

  return (
    <span className={`${base} bg-gradient-to-br from-emerald-400 to-accent-400`}>
      {getInitials(name)}
    </span>
  )
}

export default Avatar
