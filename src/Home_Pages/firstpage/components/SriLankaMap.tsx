// Sri Lanka map with valuation location markers.
// Uses the Sri Lanka map image in public/images/map.png and
// overlays animated gold pins at real city positions.

// Positions are % of the square map area (derived from the map's coordinates).
const locations = [
  { name: 'Jaffna', x: 31.8, y: 4.6 },
  { name: 'Anuradhapura', x: 41.6, y: 39.1 },
  { name: 'Trincomalee', x: 62.1, y: 32.4 },
  { name: 'Kandy', x: 47.1, y: 65.0 },
  { name: 'Colombo', x: 27.8, y: 74.2 },
  { name: 'Galle', x: 36.8, y: 95.0 },
]

const SriLankaMap = () => {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      {/* Accurate, gradient-filled Sri Lanka outline */}
      <img
        src="/images/map.png"
        alt="Map of Sri Lanka showing valuation coverage locations"
        className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(217,180,60,0.25)]"
      />

    
      {/* Valuation location pins */}
      {locations.map((loc) => (
        <span
          key={loc.name}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          title={loc.name}
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-gold-400/60" />
          {/* Solid pin */}
          <span className="relative block h-2.5 w-2.5 rounded-full bg-gold-400 ring-2 ring-white shadow-md" />
        </span>
      ))}
    </div>
  )
}

export default SriLankaMap
