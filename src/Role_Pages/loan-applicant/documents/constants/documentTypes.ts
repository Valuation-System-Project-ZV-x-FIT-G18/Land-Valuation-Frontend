// The documents a loan applicant can upload, grouped by category.
// `mandatory` marks the required ones; the rest are only if applicable.

export type DocType = { key: string; label: string; mandatory?: boolean }
export type DocSection = { title: string; icon: string; docs: DocType[] }

export const documentSections: DocSection[] = [
  {
    title: 'Survey & Land',
    icon: '📐',
    docs: [
      { key: 'surveyPlan', label: 'Survey Plan', mandatory: true },
      { key: 'previousSurveyPlans', label: 'Previous Survey Plans (if boundaries changed)' },
    ],
  },
  {
    title: 'Ownership / Title',
    icon: '📜',
    docs: [
      { key: 'titleDeed', label: 'Title Deed (most recent)', mandatory: true },
      { key: 'deedChain', label: 'Deed Chain / Previous Deeds' },
      { key: 'landRegistrySearch', label: 'Land Registry Search Certificate' },
    ],
  },
  {
    title: 'Local Authority',
    icon: '🏛️',
    docs: [
      { key: 'taxCertificate', label: 'Local Authority Tax Assessment Certificate', mandatory: true },
      { key: 'streetLineCert', label: 'Street Line / Building Limit Certificate', mandatory: true },
    ],
  },
  {
    title: 'Planning & Approval',
    icon: '🏗️',
    docs: [
      { key: 'surveyPlanApproval', label: 'Survey Plan Approval Letter', mandatory: true },
      { key: 'udaApproval', label: 'UDA Approval Letter (if under UDA)' },
      { key: 'coc', label: 'Certificate of Conformity (COC)' },
      { key: 'buildingPlanApproval', label: 'Building Plan Approval (if any structure)' },
    ],
  },
  {
    title: 'Identity',
    icon: '🪪',
    docs: [
      { key: 'nicApplicant', label: 'NIC (Loan Applicant)', mandatory: true },
      { key: 'nicOwner', label: 'NIC (Property Owner, if different)' },
      { key: 'passport', label: 'Passport (if no NIC)' },
    ],
  },
  {
    title: 'Other Supporting (if applicable)',
    icon: '🗂️',
    docs: [
      { key: 'powerOfAttorney', label: 'Power of Attorney' },
      { key: 'deathCertificate', label: 'Death Certificate' },
      { key: 'partitionDecree', label: 'Partition Decree' },
      { key: 'courtOrder', label: 'Court Order' },
    ],
  },
]
