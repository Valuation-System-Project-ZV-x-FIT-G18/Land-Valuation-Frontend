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
  const [imageFailed, setImageFailed] = useState(false)
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-emerald-950 shadow ring-2 ring-white/10 ${sizeClasses[size]} ${className}`

  useEffect(() => setImageFailed(false), [userId, photoPath])

  if (photoPath && !imageFailed) {
    return (
      <img
        src={avatarUrl(userId, photoPath)}
        alt={name}
        onError={() => setImageFailed(true)}
        className={`${base} bg-emerald-900 object-cover`}
      />
    )
  }

  return (
    <span className={`${base} bg-gradient-to-br from-emerald-400 to-gold-400`}>
      {getInitials(name) || '👤'}
    </span>
  )
}

export default Avatar
