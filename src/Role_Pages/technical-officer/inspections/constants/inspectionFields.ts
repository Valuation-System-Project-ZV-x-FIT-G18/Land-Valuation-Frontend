// The land site inspection & valuation form, grouped into sections.
export type InspField = { key: string; label: string; textarea?: boolean }
export type InspSection = { title: string; icon: string; fields: InspField[] }

export const inspectionSections: InspSection[] = [
  {
    title: 'Access & Location',
    icon: '🚗',
    fields: [
      { key: 'accessRoute', label: 'Access route description from nearest town', textarea: true },
      { key: 'roadWidth', label: 'Access road width' },
      { key: 'roadType', label: 'Road type (Tarred / Gravel / Other)' },
      { key: 'roadFacing', label: 'Road facing direction / Boundary facing road' },
      { key: 'distanceFromNearestCity', label: 'Distance from nearest city' },
      { key: 'rightOfWay', label: 'Right of way confirmation' },
    ],
  },
  {
    title: 'Description of the Land',
    icon: '🌱',
    fields: [
      { key: 'landShape', label: 'Shape of land' },
      { key: 'landPosition', label: 'Land position relative to road' },
      { key: 'frontage', label: 'Frontage measurement (ft)' },
      { key: 'floodProne', label: 'Flood prone status' },
      { key: 'boundariesMarked', label: 'Boundaries clearly marked on ground' },
      { key: 'soilType', label: 'Soil type' },
      { key: 'drainage', label: 'Rainwater drainage method' },
      { key: 'garbage', label: 'Garbage disposal method' },
      { key: 'gateType', label: 'Gate / Entry type' },
      { key: 'unauthorizedStructures', label: 'Unauthorized structures on land' },
    ],
  },
  {
    title: 'Boundary Verification',
    icon: '🧭',
    fields: [
      { key: 'northBoundary', label: 'North Boundary' },
      { key: 'eastBoundary', label: 'East Boundary' },
      { key: 'southBoundary', label: 'South Boundary' },
      { key: 'westBoundary', label: 'West Boundary' },
      { key: 'boundariesMatchPlan', label: 'Physical boundaries match survey plan' },
    ],
  },
  {
    title: 'Locality Description',
    icon: '🏘️',
    fields: [
      { key: 'vicinityCharacter', label: 'Character of immediate vicinity' },
      { key: 'nearbyFacilities', label: 'Nearby facilities' },
      { key: 'transportFrequency', label: 'Transport frequency' },
      { key: 'dayToDayNeeds', label: 'Availability of day-to-day needs' },
    ],
  },
  {
    title: 'Inspection Details',
    icon: '✍️',
    fields: [
      { key: 'inspectionDate', label: 'Date of inspection' },
      { key: 'presentedParty', label: 'Party present at the inspection' },
      { key: 'technicalOfficer', label: 'Technical Officer' },
      { key: 'signature', label: 'Signature' },
    ],
  },
]
