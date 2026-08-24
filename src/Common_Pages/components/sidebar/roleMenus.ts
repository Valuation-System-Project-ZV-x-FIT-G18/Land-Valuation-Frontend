export type SidebarSection = string

export type SidebarItem = {
  label: string
  to: string
  icon: string
  section?: SidebarSection
}

export type SidebarGroup = {
  id: SidebarSection
  label: string
  icon: string
  includeProjectStatus?: boolean
}

export const roleMenus: Record<string, SidebarItem[]> = {
  Admin: [
    { label: 'Add User', to: '/admin/add-role', icon: 'userAdd', section: 'USER MANAGEMENT' },
    { label: 'User Details', to: '/admin/user-details', icon: 'users', section: 'USER MANAGEMENT' },
  ],
  Coordinator: [
    { label: 'Contact Messages', to: '/coordinator/contact-messages', icon: 'mail', section: 'APPLICANTS' },
    { label: 'Register Applicant', to: '/coordinator/create-project', icon: 'userAdd', section: 'APPLICANTS' },
    { label: 'Create Project', to: '/coordinator/new-project', icon: 'document', section: 'PROJECT WORKFLOW' },
    { label: 'New Valuation', to: '/coordinator/new-valuation', icon: 'calculator', section: 'PROJECT WORKFLOW' },
    { label: 'Fleet Management', to: '/coordinator/fleet-management', icon: 'vehicle', section: 'OPERATIONS' },
    { label: 'Payment Slips', to: '/coordinator/payment-slips', icon: 'payment', section: 'OPERATIONS' },
    { label: 'Rejected', to: '/coordinator/rejected-officers', icon: 'close', section: 'REVIEW & FOLLOW-UP' },
  ],
  'Technical Officer': [
    { label: 'Assigned Projects', to: '/technical-officer/assignments', icon: 'document', section: 'FIELD WORK' },
    { label: 'Inspection Data', to: '/technical-officer/inspections', icon: 'edit', section: 'FIELD WORK' },
    { label: 'Site Photos', to: '/technical-officer/site-photos', icon: 'camera', section: 'FIELD WORK' },
    { label: 'GPS & Map', to: '/technical-officer/gps-map', icon: 'location', section: 'FIELD WORK' },
    { label: 'Nearby Land Analysis', to: '/technical-officer/nearby', icon: 'map', section: 'VALUATION SUPPORT' },
    { label: 'Generate Descriptions', to: '/technical-officer/descriptions', icon: 'document', section: 'VALUATION SUPPORT' },
    { label: 'Create Draft', to: '/technical-officer/draft', icon: 'edit', section: 'VALUATION SUPPORT' },
    { label: 'Corrections', to: '/technical-officer/corrections', icon: 'close', section: 'REVIEW & FOLLOW-UP' },
    { label: 'Attendance', to: '/technical-officer/attendance', icon: 'calendar', section: 'WORK MANAGEMENT' },
  ],
  'Manager L1': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document', section: 'REPORT REVIEW' },
    { label: 'Final Reports', to: '/manager/final-reports', icon: 'document', section: 'REPORT REVIEW' },
    { label: 'Approved Reports', to: '/manager/approved-drafts', icon: 'check', section: 'REPORT ARCHIVE' },
    { label: 'Rejected Reports', to: '/manager/rejected-drafts', icon: 'close', section: 'REPORT ARCHIVE' },
  ],
  'Manager L2': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document', section: 'REPORT REVIEW' },
    { label: 'Corrections', to: '/manager/corrections', icon: 'edit', section: 'REPORT REVIEW' },
    { label: 'Approved Reports', to: '/manager/approved-drafts', icon: 'check', section: 'REPORT ARCHIVE' },
    { label: 'Rejected Reports', to: '/manager/rejected-drafts', icon: 'close', section: 'REPORT ARCHIVE' },
  ],
  'Manager L3': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document', section: 'REPORT REVIEW' },
    { label: 'Corrections', to: '/manager/corrections', icon: 'edit', section: 'REPORT REVIEW' },
    { label: 'Approved Reports', to: '/manager/approved-drafts', icon: 'check', section: 'REPORT ARCHIVE' },
    { label: 'Rejected Reports', to: '/manager/rejected-drafts', icon: 'close', section: 'REPORT ARCHIVE' },
  ],
  'Loan Applicant': [
    { label: 'Fill Form', to: '/applicant/fill-form', icon: 'edit', section: 'VALUATION REQUEST' },
    { label: 'Make Payment', to: '/applicant/payment', icon: 'payment', section: 'VALUATION REQUEST' },
  ],
  Bank: [{ label: 'View Report', to: '/bank/report', icon: 'document', section: 'VALUATION REPORTS' }],
}

const managerGroups: SidebarGroup[] = [
  { id: 'REPORT REVIEW', label: 'Report Review', icon: 'document' },
  { id: 'REPORT ARCHIVE', label: 'Report Archive', icon: 'check' },
  { id: 'PROJECT TRACKING', label: 'Project Tracking', icon: 'map', includeProjectStatus: true },
]

export const roleMenuGroups: Record<string, SidebarGroup[]> = {
  Admin: [
    { id: 'USER MANAGEMENT', label: 'User Management', icon: 'users' },
    { id: 'PROJECT TRACKING', label: 'Project Tracking', icon: 'map', includeProjectStatus: true },
  ],
  Coordinator: [
    { id: 'APPLICANTS', label: 'Applicants', icon: 'users' },
    { id: 'PROJECT WORKFLOW', label: 'Project Workflow', icon: 'document' },
    { id: 'OPERATIONS', label: 'Operations', icon: 'vehicle' },
    { id: 'REVIEW & FOLLOW-UP', label: 'Review & Follow-Up', icon: 'close', includeProjectStatus: true },
  ],
  'Technical Officer': [
    { id: 'FIELD WORK', label: 'Field Work', icon: 'location' },
    { id: 'VALUATION SUPPORT', label: 'Valuation Support', icon: 'calculator' },
    { id: 'REVIEW & FOLLOW-UP', label: 'Review & Follow-Up', icon: 'document', includeProjectStatus: true },
    { id: 'WORK MANAGEMENT', label: 'Work Management', icon: 'calendar' },
  ],
  'Manager L1': managerGroups,
  'Manager L2': managerGroups,
  'Manager L3': managerGroups,
  'Loan Applicant': [
    { id: 'VALUATION REQUEST', label: 'Valuation Request', icon: 'edit' },
    { id: 'PROJECT TRACKING', label: 'Project Tracking', icon: 'map', includeProjectStatus: true },
  ],
  Bank: [
    { id: 'VALUATION REPORTS', label: 'Valuation Reports', icon: 'document' },
    { id: 'PROJECT TRACKING', label: 'Project Tracking', icon: 'map', includeProjectStatus: true },
  ],
}
