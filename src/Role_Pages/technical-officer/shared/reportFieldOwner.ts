import type { TOStepId } from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import { inspectionFieldForReportKey } from '@/Role_Pages/technical-officer/draft/utils/mapInspectionToReportValues'
import { inspectionSections } from '@/Role_Pages/technical-officer/inspections/constants/inspectionFields'

// Which screen fills each value in the report.
//
// Clicking "[ To be filled ]" should take the officer to wherever that value is
// actually entered. Without this, every marker outside the inspection form led
// nowhere, which reads as a broken link on the field the officer most wants to
// act on.

export type FieldOwner =
  // Filled on one of the officer's own steps.
  | { kind: 'step'; step: TOStepId; formField?: string }
  // Comes from the project or valuation record. The coordinator owns these; the
  // officer cannot type them here, and saying so beats a dead click.
  | { kind: 'coordinator'; what: string }

// Report keys produced by the Descriptions step (mirrors
// mapDescriptionsToReportValues — the narrative sections it writes).
const DESCRIPTION_KEYS = new Set([
  'requestDescription', 'limitations', 'generalAssumptions', 'localityDescription',
  'extentDescription', 'accessLocationDescription', 'landDescription', 'legalDescription',
  'localAuthorityTax', 'streetLineBuildingLimits', 'mandatoryRequirements',
  'rentControlRegulation', 'localityFacilities', 'conclusion', 'certification',
])

// Written by the GPS & Map step.
const MAP_KEYS = new Set([
  'gpsCoordinates', 'latitude', 'longitude', 'satelliteLocationImage',
  'locationMapImage', 'propertyLocationCity',
])

// Produced by the nearby-comparables analysis and its valuation summary.
const VALUATION_KEYS = new Set([
  'marketValue', 'marketValueWords', 'forcedSaleValue', 'forcedSaleValueWords',
  'valuationDate', 'nearbyPropertyDetails', 'valuationApproachStatement', 'previouslyValued',
])

// Details of the property record itself, entered when the project/valuation was
// created. Mapped to a plain description rather than a step.
const COORDINATOR_KEYS: Record<string, string> = {
  lotNo: 'the survey plan details on the project',
  surveyPlanNo: 'the survey plan details on the project',
  surveyDate: 'the survey plan details on the project',
  surveyorName: 'the survey plan details on the project',
  surveyPlanImage: 'the survey plan attached to the project',
  planOver10Years: 'the survey plan details on the project',
  surveyPlanRequiredAction: 'the survey plan details on the project',
  deedType: 'the deed details on the project',
  deedNo: 'the deed details on the project',
  deedDate: 'the deed details on the project',
  attorney: 'the deed details on the project',
  notary: 'the deed details on the project',
  deedAcres: 'the deed details on the project',
  deedRoods: 'the deed details on the project',
  deedPerches: 'the deed details on the project',
  deedHectares: 'the deed details on the project',
  bankName: 'the valuation request',
  branchName: 'the valuation request',
  valuationRequestDate: 'the valuation request',
  ownerName: 'the applicant record',
  nameWithInitials: 'the applicant record',
  contactNo: 'the applicant record',
  addressLine1: 'the applicant record',
  addressLine2: 'the applicant record',
  ownerCity: 'the applicant record',
  district: 'the applicant record',
  landName: 'the project record',
  propertyType: 'the project record',
  propertyAddress: 'the project record',
  projectId: 'the project record',
  // The extent and boundaries as recorded on the survey plan. Distinct from the
  // siteBoundary* values, which are what the officer observed on the ground.
  extentAcres: 'the extent recorded on the project',
  extentRoods: 'the extent recorded on the project',
  extentPerches: 'the extent recorded on the project',
  extentHectares: 'the extent recorded on the project',
  extentVerificationStatement: 'the extent recorded on the project',
  boundaryNorth: 'the survey plan boundaries on the project',
  boundaryEast: 'the survey plan boundaries on the project',
  boundarySouth: 'the survey plan boundaries on the project',
  boundaryWest: 'the survey plan boundaries on the project',
  accessFromBoundary: 'the right-of-way recorded on the project',
}

const inspectionKeys = new Set(
  inspectionSections.flatMap((section) => section.fields.map((field) => field.key)),
)

export const ownerOfReportField = (reportKey: string): FieldOwner | null => {
  // Inspection first: its alias table is the authority on which report values
  // the inspection form produces.
  const formField = inspectionFieldForReportKey(reportKey)
  if (inspectionKeys.has(formField)) return { kind: 'step', step: 'inspection', formField }

  if (reportKey.startsWith('photo')) return { kind: 'step', step: 'photos' }
  if (MAP_KEYS.has(reportKey)) return { kind: 'step', step: 'gps' }
  if (VALUATION_KEYS.has(reportKey)) return { kind: 'step', step: 'nearby' }
  if (DESCRIPTION_KEYS.has(reportKey)) return { kind: 'step', step: 'descriptions' }

  const what = COORDINATOR_KEYS[reportKey]
  if (what) return { kind: 'coordinator', what }

  return null
}
