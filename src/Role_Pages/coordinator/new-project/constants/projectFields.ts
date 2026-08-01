import type { SectionConfig, UploadConfig } from '@/Role_Pages/coordinator/new-project/types/new-project'
import { provinces, districtsByProvince } from '@/Role_Pages/coordinator/register-applicant/constants/sriLanka'

const YN = ['Yes', 'No']
const DOC = '.pdf,.jpg,.jpeg,.png'

// Sections 5–12 of the valuation form (Section 5 also shows the map picker).
export const projectSections: SectionConfig[] = [
  {
    title: 'Property Address',
    icon: '📍',
    hasMap: true,
    fields: [
      { name: 'propertyNumber', label: 'Property Number', required: true },
      { name: 'streetName', label: 'Street / Road Name', required: true },
      { name: 'villageTown', label: 'Village / Town', required: true },
      { name: 'gnDivision', label: 'GN Division (Grama Niladhari)' },
      { name: 'dsDivision', label: 'DS Division (Divisional Secretariat)' },
      { name: 'province', label: 'Province', type: 'select', options: provinces, required: true, placeholder: 'Select province' },
      { name: 'district', label: 'District', type: 'select', optionsBy: { field: 'province', map: districtsByProvince }, required: true },
      { name: 'postalCode', label: 'Postal Code', type: 'number' },
    ],
  },
  {
    title: 'Property Situation / Administrative',
    icon: '🏛️',
    fields: [
      { name: 'landTraditionalName', label: 'Land Traditional Name', placeholder: 'e.g. Alubogahawatta' },
      { name: 'localAuthorityType', label: 'Local Authority Type', type: 'select', options: ['Urban Council', 'Municipal Council', 'Pradeshiya Sabha'] },
      { name: 'localAuthorityName', label: 'Local Authority Name' },
      { name: 'pattu', label: 'Pattu' },
      { name: 'korale', label: 'Korale' },
      { name: 'propertyType', label: 'Type of Property', type: 'select', options: ['Residential', 'Commercial', 'Bare Land'], required: true },
    ],
  },
  {
    title: 'Survey Plan Details',
    icon: '📐',
    fields: [
      { name: 'surveyPlanNumber', label: 'Survey Plan Number', required: true },
      { name: 'surveyPlanDate', label: 'Survey Plan Date', type: 'date' },
      { name: 'surveyorName', label: 'Licensed Surveyor Name', required: true },
      { name: 'surveyorLicenseNo', label: 'Surveyor License Number' },
      { name: 'lotNumber', label: 'Lot Number' },
      { name: 'planOlderThan10', label: 'Is Plan Older than 10 Years?', type: 'select', options: YN },
      { name: 'planActionIfOld', label: 'If older: Endorsement or New Plan?', type: 'select', options: ['Surveyor Endorsement', 'New Plan Required'], dependsOn: { field: 'planOlderThan10', value: 'Yes' } },
    ],
  },
  {
    title: 'Land Extent',
    icon: '📏',
    fields: [
      { name: 'extentAcres', label: 'Acres (Survey Plan)', type: 'number' },
      { name: 'extentRoods', label: 'Roods (Survey Plan)', type: 'number' },
      { name: 'extentPerches', label: 'Perches (Survey Plan)', type: 'number' },
      { name: 'extentHectares', label: 'Hectares (Survey Plan)', type: 'number' },
      { name: 'deedExtentAcres', label: 'Acres (Deed)', type: 'number' },
      { name: 'deedExtentRoods', label: 'Roods (Deed)', type: 'number' },
      { name: 'deedExtentPerches', label: 'Perches (Deed)', type: 'number' },
      { name: 'deedExtentHectares', label: 'Hectares (Deed)', type: 'number' },
      { name: 'extentAsPerPlan', label: 'Extent as per Survey Plan' },
      { name: 'extentAsPerDeed', label: 'Extent as per Deed' },
      { name: 'extentsTally', label: 'Do they tally?', type: 'select', options: YN },
    ],
  },
  {
    title: 'Deed / Ownership Details',
    icon: '📜',
    fields: [
      { name: 'deedType', label: 'Deed Type', placeholder: 'e.g. Deed of Transfer', required: true },
      { name: 'deedNumber', label: 'Deed Number', required: true },
      { name: 'deedDate', label: 'Deed Date', type: 'date' },
      { name: 'bankRequestDate', label: "Bank's Request Letter Date", type: 'date' },
      { name: 'attorneyName', label: 'Attorney at Law Name' },
      { name: 'notaryNoLocation', label: 'Notary Public Number / Location', placeholder: 'e.g. N.P. Colombo' },
      { name: 'ownerNameAsPerDeed', label: 'Owner Name as per Deed', required: true },
      { name: 'landRegistrySearchDone', label: 'Land Registry Search Done?', type: 'select', options: YN },
      { name: 'previousOwnerName', label: 'Previous Owner Name (if available)' },
    ],
  },
  {
    title: 'Boundaries (from survey plan)',
    icon: '🧭',
    fields: [
      { name: 'boundaryNorth', label: 'North', required: true },
      { name: 'boundaryEast', label: 'East', required: true },
      { name: 'boundarySouth', label: 'South', required: true },
      { name: 'boundaryWest', label: 'West', required: true },
      { name: 'rightOfWayAvailable', label: 'Right of Way Available?', type: 'select', options: YN },
      { name: 'rightOfWayFrom', label: 'From which side of the property do we access the road?', dependsOn: { field: 'rightOfWayAvailable', value: 'Yes' } },
    ],
  },
  {
    title: 'Legal & Local Authority',
    icon: '⚖️',
    fields: [
      { name: 'assessmentNumber', label: 'Assessment Number', required: true },
      { name: 'assessmentLetterDate', label: 'Assessment Letter Date', type: 'date' },
      { name: 'assessmentAuthority', label: 'Authority Issuing Assessment' },
      { name: 'streetLineCertDate', label: 'Street Line / Building Limit Certificate Date', type: 'date' },
      { name: 'affectedByStreetLines', label: 'Affected by Street Lines?', type: 'select', options: YN },
      { name: 'affectedByBuildingLimits', label: 'Affected by Building Limits?', type: 'select', options: YN },
      { name: 'distFromMainRoad', label: 'Distance from Main Road Centerline (ft)', type: 'number' },
      { name: 'distFromByRoad', label: 'Distance from By-Road Centerline (ft)', type: 'number' },
    ],
  },
  {
    title: 'Planning Regulations',
    icon: '🏗️',
    fields: [
      { name: 'planApprovedByLA', label: 'Survey Plan Approved by Local Authority?', type: 'select', options: YN },
      { name: 'planApprovalRef', label: 'Survey Plan Approval Reference Number' },
      { name: 'planApprovalDate', label: 'Survey Plan Approval Date', type: 'date' },
      { name: 'planApprovalPurpose', label: 'Approval Purpose', type: 'select', options: ['Residential', 'Commercial'] },
      { name: 'buildingPlanApprovalNo', label: 'Building Plan Approval Number' },
      { name: 'buildingPlanApprovalDate', label: 'Building Plan Approval Date', type: 'date' },
      { name: 'cocProvided', label: 'Certificate of Conformity (COC) Provided?', type: 'select', options: YN },
      { name: 'planningAuthority', label: 'Planning Authority', placeholder: 'e.g. UDA' },
      { name: 'rentControlAffected', label: 'Rent Control Affected?', type: 'select', options: YN },
      { name: 'maxPlotCoverage', label: 'Max Plot Coverage % Allowed', type: 'number' },
      { name: 'plotCoverageProperty', label: 'Plot Coverage % of Subject Property', type: 'number' },
    ],
  },
]

// Section 13 — document uploads (Survey Plan & Title Deed required).
export const projectUploads: UploadConfig[] = [
  { name: 'surveyPlan', label: 'Survey Plan (image)', accept: DOC, required: true },
  { name: 'titleDeed', label: 'Title Deed (scanned)', accept: DOC, required: true },
  { name: 'taxCertificate', label: 'Local Authority Tax Certificate', accept: DOC },
  { name: 'streetLineCert', label: 'Street Line / Building Limit Certificate', accept: DOC },
  { name: 'planApprovalLetter', label: 'Survey Plan Approval Letter', accept: DOC },
  { name: 'udaApproval', label: 'UDA Approval Letter (if applicable)', accept: DOC },
  { name: 'coc', label: 'Certificate of Conformity (if available)', accept: DOC },
  { name: 'previousValuation', label: 'Previous Valuation Report (if revaluation)', accept: DOC },
]
