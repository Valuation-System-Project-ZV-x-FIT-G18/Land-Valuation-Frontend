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
    { label: 'Bank Management', to: '/admin/banks', icon: 'document', section: 'USER MANAGEMENT' },
    { label: 'Audit Log', to: '/admin/audit-log', icon: 'document', section: 'ADMINISTRATION' },
  ],
  Coordinator: [
    { label: 'Applicants', to: '/coordinator/applicants', icon: 'users', section: 'APPLICANTS' },
    { label: 'Projects', to: '/coordinator/projects', icon: 'document', section: 'PROJECTS' },
    { label: 'Valuations', to: '/coordinator/valuations', icon: 'calculator', section: 'VALUATIONS' },
    { label: 'Fleet Management', to: '/coordinator/fleet-management', icon: 'vehicle', section: 'OPERATIONS' },
    { label: 'Payment Slips', to: '/coordinator/payment-slips', icon: 'payment', section: 'PAYMENTS' },
    { label: 'Messages', to: '/coordinator/contact-messages', icon: 'mail', section: 'MESSAGES' },
  ],
  'Technical Officer': [
    { label: 'Assigned Projects', to: '/technical-officer/assignments', icon: 'document', section: 'FIELD WORK' },
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
    { id: 'ADMINISTRATION', label: 'Administration', icon: 'document' },
    { id: 'PROJECT TRACKING', label: 'Project Tracking', icon: 'map', includeProjectStatus: true },
  ],
  Coordinator: [
    { id: 'APPLICANTS', label: 'Applicants', icon: 'users' },
    { id: 'PROJECTS', label: 'Projects', icon: 'document' },
    { id: 'VALUATIONS', label: 'Valuations', icon: 'calculator' },
    { id: 'OPERATIONS', label: 'Operations', icon: 'vehicle' },
    { id: 'PAYMENTS', label: 'Payments', icon: 'payment' },
    { id: 'MESSAGES', label: 'Messages', icon: 'mail' },
  ],
  'Technical Officer': [
    { id: 'FIELD WORK', label: 'Field Work', icon: 'location' },
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
