import type { Descriptions } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

export const mapDescriptionsToReportValues = (descriptions: Descriptions | null): Record<string, string> => {
  if (!descriptions) return {}
  const values = {
    requestDescription: descriptions.requestDescription,
    limitations: descriptions.limitations,
    generalAssumptions: descriptions.generalAssumptions,
    localityDescription: descriptions.situation || descriptions.localityDescription,
    extentDescription: descriptions.extentDescription,
    accessLocationDescription: descriptions.accessDescription,
    landDescription: descriptions.landDescription,
    legalDescription: descriptions.legalParagraph || descriptions.ownershipDescription,
    localAuthorityTax: descriptions.localAuthorityTax,
    streetLineBuildingLimits: descriptions.streetLineBuildingLimits,
    mandatoryRequirements: descriptions.mandatoryRequirements,
    rentControlRegulation: descriptions.rentControlRegulation,
    localityFacilities: descriptions.localityFacilities || descriptions.localityDescription,
    conclusion: descriptions.conclusion,
    certification: descriptions.certification,
    savedValuation: descriptions.valuation,
    savedEvidence: descriptions.evidence,
  }
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value?.trim()))
}
