import type { InspectionData } from '@/Role_Pages/technical-officer/inspections/api/inspections'

// Explicit aliases between the inspection form and the report template. The
// live values override only their corresponding saved inspection values.
const aliases: Record<string, string[]> = {
  inspectionDate: ['inspectionDate'],
  presentedParty: ['presentedParty'],
  roadWidth: ['accessRoadWidth'],
  roadType: ['accessRoadSurface'],
  rightOfWay: ['legalRightOfWay'],
  northBoundary: ['siteBoundaryNorth', 'boundaryNorthOnSite'],
  eastBoundary: ['siteBoundaryEast', 'boundaryEastOnSite'],
  southBoundary: ['siteBoundarySouth', 'boundarySouthOnSite'],
  westBoundary: ['siteBoundaryWest', 'boundaryWestOnSite'],
  landShape: ['landShape'],
  landPosition: ['landPosition'],
  frontage: ['frontage'],
  floodProne: ['floodProne'],
  soilType: ['soilType'],
  drainage: ['drainage'],
  gateType: ['gateType'],
  unauthorizedStructures: ['unauthorizedStructures'],
}

export function mapInspectionToReportValues(data: InspectionData): Record<string, string> {
  return Object.entries(data).reduce<Record<string, string>>((mapped, [key, value]) => {
    for (const reportKey of aliases[key] ?? [key]) mapped[reportKey] = value
    return mapped
  }, {})
}
