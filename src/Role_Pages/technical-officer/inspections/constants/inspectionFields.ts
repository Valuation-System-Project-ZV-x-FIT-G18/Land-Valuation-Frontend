// The land site inspection & valuation form, grouped into sections.
export type InspField = { key: string; label: string; textarea?: boolean; type?: 'text' | 'select'; options?: string[]; group?: string }
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
      { key: 'localityName', label: 'Village, town or locality', group: 'Character of the locality' },
      { key: 'nearestTown', label: 'Nearest main town / town centre', group: 'Character of the locality' },
      { key: 'distanceToNearestTown', label: 'Distance from the nearest main town', group: 'Character of the locality' },
      { key: 'vicinityCharacter', label: 'Main character of the surrounding locality', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Development', 'Rural'], group: 'Character of the locality' },
      { key: 'surroundingPropertyTypes', label: 'Properties mostly found in the immediate vicinity', textarea: true, group: 'Character of the locality' },
      { key: 'developmentLevel', label: 'Development level of the immediate vicinity', type: 'select', options: ['Fully Developed', 'Moderately Developed', 'Developing', 'Undeveloped'], group: 'Character of the locality' },
      { key: 'marketDemand', label: 'Current property market demand', type: 'select', options: ['High', 'Moderate', 'Low'], group: 'Character of the locality' },
      { key: 'highDemandPropertyTypes', label: 'Property types with the highest demand', textarea: true, group: 'Character of the locality' },
      { key: 'demandReason', label: 'Main reasons for the demand', textarea: true, group: 'Character of the locality' },
      { key: 'availableUtilities', label: 'Available utility services', textarea: true, group: 'Utilities and nearby facilities' },
      { key: 'nearbyFacilities', label: 'Important facilities available near the property', textarea: true, group: 'Utilities and nearby facilities' },
      { key: 'facilitiesRadius', label: 'Approximate radius in which facilities are available', group: 'Utilities and nearby facilities' },
      { key: 'transportFrequency', label: 'Public transport availability and frequency', type: 'select', options: ['Frequent', 'Regular', 'Limited', 'Not Available'], group: 'Public transport' },
      { key: 'transportRoad', label: 'Road along which public transport operates', group: 'Public transport' },
      { key: 'distanceToTransport', label: 'Distance to nearest bus route / transport point', group: 'Public transport' },
      { key: 'dayToDayNeeds', label: 'Can daily necessities be obtained nearby?', type: 'select', options: ['Yes', 'Partially', 'No'], group: 'Day-to-day needs' },
      { key: 'dayToDayNeedsLocation', label: 'Where can residents obtain daily necessities?', type: 'select', options: ['Within the Same Village', 'Nearest Junction', 'Nearest Town', 'Weekly Market / Travelling Vendors'], group: 'Day-to-day needs' },
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
