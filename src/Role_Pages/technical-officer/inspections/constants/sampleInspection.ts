import type { InspectionData } from '@/Role_Pages/technical-officer/inspections/api/inspections'

// A complete, plausible inspection for testing the workflow without filling
// forty-odd fields by hand every time.
//
// Only reachable from a development build (see the caller), so it cannot put
// invented findings into a real valuation report.
//
// Every value that feeds a <select> is written EXACTLY as one of that field's
// options — a near-miss like "residential" leaves the control showing nothing,
// which looks like the fill silently failed.
export const sampleInspection: InspectionData = {
  // Access & Location
  accessRoute:
    'From Kaduwela town proceed along Biyagama Road for about 3.2 km, turn right at the Rukmale junction onto High Level Road and continue 400 m. The property lies on the left, immediately after the water tower.',
  roadWidth: '20 ft',
  roadType: 'Tarred road',
  roadFacing: 'Northern boundary',
  distanceFromNearestCity: '4.5 km',
  rightOfWay: 'Legally established right of way over a 20 ft motorable access road.',

  // Description of the Land
  landShape: 'Rectangular',
  landPosition: 'At road level',
  frontage: '65',
  floodProne: 'Not flood prone. No evidence of past inundation observed on site.',
  boundariesMarked: 'Boundaries marked with concrete survey posts at all four corners.',
  soilType: 'Laterite',
  drainage: 'Natural surface drainage towards the southern boundary; no waterlogging observed.',
  garbage: 'Collected weekly by the Kaduwela Municipal Council.',
  gateType: 'Steel swing gate, 12 ft wide',
  unauthorizedStructures: 'None observed',

  // Boundary Verification
  northBoundary: 'High Level Road',
  eastBoundary: 'Land claimed by W. A. Perera',
  southBoundary: 'Lot 12 in the same survey plan',
  westBoundary: 'Access road 20 ft wide',
  boundariesMatchPlan: 'Physical boundaries agree with the survey plan.',

  // Locality Description
  localityName: 'Rukmale',
  nearestTown: 'Kaduwela',
  distanceToNearestTown: '4.5 km',
  vicinityCharacter: 'Residential',
  surroundingPropertyTypes:
    'Predominantly single and two storey dwelling houses on lots of 10 to 20 perches, with a few small retail premises near the junction.',
  developmentLevel: 'Moderately Developed',
  marketDemand: 'Moderate',
  highDemandPropertyTypes:
    'Bare residential lots of 10 to 15 perches and completed single storey houses.',
  demandReason:
    'Proximity to Kaduwela town, direct access to the Colombo–Awissawella road and the expressway interchange, and the availability of mains water and electricity.',
  availableUtilities: 'Mains electricity, National Water Supply Board pipe-borne water, fixed telephone and fibre broadband.',
  nearbyFacilities:
    'Rukmale Maha Vidyalaya, a government dispensary, several grocery stores, a branch of the Bank of Ceylon and a filling station.',
  facilitiesRadius: 'Within a 2 km radius',
  transportFrequency: 'Regular',
  transportRoad: 'Biyagama Road',
  distanceToTransport: '350 m',
  dayToDayNeeds: 'Yes',
  dayToDayNeedsLocation: 'Nearest Junction',

  // Inspection Details
  inspectionDate: new Date().toISOString().slice(0, 10),
  presentedParty: 'R. Narampanawa (land owner)',
  technicalOfficer: 'Reshani Dilsara',
  signature: 'Reshani Dilsara',
}
