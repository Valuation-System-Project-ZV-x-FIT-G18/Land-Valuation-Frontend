// The site photographs a technical officer uploads, grouped by category.
export type PhotoType = { key: string; label: string }
// `describe: false` disables the AI caption (used for "Additional" photos).
export type PhotoSection = { title: string; icon: string; describe?: boolean; photos: PhotoType[] }

export const photoSections: PhotoSection[] = [
  {
    title: 'Access & Approach',
    icon: '🛣️',
    photos: [
      { key: 'accessRoad', label: 'Access Road Photo' },
      { key: 'routeFromMainRoad', label: 'Route from Main Road Photo' },
    ],
  },
  {
    title: 'Land Photographs',
    icon: '🏞️',
    photos: [
      { key: 'frontView', label: 'Front View of Land' },
      { key: 'rearView', label: 'Rear View of Land' },
      { key: 'leftSideView', label: 'Left Side View of Land' },
      { key: 'rightSideView', label: 'Right Side View of Land' },
    ],
  },
  {
    title: 'Boundary Photographs',
    icon: '🧭',
    photos: [
      { key: 'northBoundary', label: 'North Boundary Photo' },
      { key: 'eastBoundary', label: 'East Boundary Photo' },
      { key: 'southBoundary', label: 'South Boundary Photo' },
      { key: 'westBoundary', label: 'West Boundary Photo' },
    ],
  },
  {
    title: 'Additional Site Photographs',
    icon: '📸',
    describe: false, // no AI caption for additional photos
    photos: [
      { key: 'gateEntrance', label: 'Gate / Entrance Photo' },
      { key: 'drainage', label: 'Drainage System Photo' },
      { key: 'roadFrontage', label: 'Road Frontage Photo' },
      { key: 'soilCondition', label: 'Soil Condition Photo' },
      { key: 'unauthorizedStructures', label: 'Unauthorized Structures Photo (if any)' },
      { key: 'floodEvidence', label: 'Flood Evidence Photo (if any)' },
      { key: 'notableFeatures', label: 'Notable Features Photo' },
      { key: 'surroundingArea', label: 'Surrounding Area Photo' },
      { key: 'nearbyFacilities', label: 'Nearby Facilities Photo (if applicable)' },
    ],
  },
]
