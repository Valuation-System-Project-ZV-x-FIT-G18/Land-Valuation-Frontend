// Shimmering placeholder shown while content loads. Compose a few of these to
// mimic the shape of the incoming content (lines, cards, rows).
//   className: control size/shape (e.g. 'h-4 w-32', 'h-24 w-full rounded-2xl')

type SkeletonProps = {
  className?: string
}

const Skeleton = ({ className = 'h-4 w-full' }: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={`block animate-shimmer rounded-lg bg-[length:200%_100%] ${className}`}
    style={{
      backgroundImage:
        'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.04) 63%)',
    }}
  />
)

export default Skeleton
