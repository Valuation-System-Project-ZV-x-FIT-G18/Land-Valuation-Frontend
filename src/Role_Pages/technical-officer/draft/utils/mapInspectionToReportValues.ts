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

// The report key a given inspection input fills, used to scroll the report to
// the value the officer is currently typing.
export const reportKeyForInspectionField = (fieldKey: string) => aliases[fieldKey]?.[0] ?? fieldKey

// The reverse: the inspection input behind a value clicked in the report.
// Derived from the same alias table rather than written out a second time —
// the two directions drifting apart is exactly how clicking a field ends up
// navigating nowhere.
const reverseAliases: Record<string, string> = Object.entries(aliases).reduce<Record<string, string>>(
  (map, [fieldKey, reportKeys]) => {
    for (const reportKey of reportKeys) map[reportKey] = fieldKey
    return map
  },
  {},
)

export const inspectionFieldForReportKey = (reportKey: string) => reverseAliases[reportKey] ?? reportKey

export function mapInspectionToReportValues(data: InspectionData): Record<string, string> {
  return Object.entries(data).reduce<Record<string, string>>((mapped, [key, value]) => {
    for (const reportKey of aliases[key] ?? [key]) mapped[reportKey] = value
    return mapped
  }, {})
}
