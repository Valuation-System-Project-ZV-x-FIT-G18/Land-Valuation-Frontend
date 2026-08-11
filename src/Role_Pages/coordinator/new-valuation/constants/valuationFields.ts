import type { SectionConfig } from '@/Role_Pages/coordinator/new-project/types/new-project'

// Sections 1-2 of the New Valuation form (project id is shown separately).
export const valuationSections: SectionConfig[] = [
  {
    title: 'Project / Reference Info',
    icon: '📋',
    fields: [
      { name: 'bankRequestDate', label: "Date of Bank's Request Letter", type: 'date' },
      { name: 'valuationPurpose', label: 'Purpose of Valuation', placeholder: 'e.g. Secured Lending / Mortgage', required: true },
      { name: 'valuationType', label: 'Valuation Type', type: 'select', options: ['New Valuation', 'Revaluation'], required: true },
      { name: 'linkPreviousProject', label: 'Link to Previous Project', placeholder: 'Previous project id', dependsOn: { field: 'valuationType', value: 'Revaluation' } },
      { name: 'priorityLevel', label: 'Priority Level', type: 'select', options: ['Normal', 'Urgent'] },
    ],
  },
]
