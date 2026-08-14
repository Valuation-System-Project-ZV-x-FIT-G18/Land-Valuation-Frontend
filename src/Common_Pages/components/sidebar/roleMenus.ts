export type SidebarItem = { label: string; to: string; icon: string }

export const roleMenus: Record<string, SidebarItem[]> = {
  Admin: [
    { label: 'Add User', to: '/admin/add-role', icon: 'userAdd' },
    { label: 'User Details', to: '/admin/user-details', icon: 'users' },
  ],
  Coordinator: [
    { label: 'New Requests', to: '/coordinator/new-requests', icon: 'mail' },
    { label: 'Contact Messages', to: '/coordinator/contact-messages', icon: 'mail' },
    { label: 'Register Applicant', to: '/coordinator/create-project', icon: 'userAdd' },
    { label: 'Create Project', to: '/coordinator/new-project', icon: 'document' },
    { label: 'New Valuation', to: '/coordinator/new-valuation', icon: 'calculator' },
    { label: 'Fleet Management', to: '/coordinator/fleet-management', icon: 'vehicle' },
    { label: 'Payment Slips', to: '/coordinator/payment-slips', icon: 'payment' },
    { label: 'Rejected', to: '/coordinator/rejected-officers', icon: 'close' },
  ],
  'Technical Officer': [
    { label: 'Assigned Projects', to: '/technical-officer/assignments', icon: 'document' },
    { label: 'Inspection Data', to: '/technical-officer/inspections', icon: 'edit' },
    { label: 'Site Photo', to: '/technical-officer/site-photos', icon: 'camera' },
    { label: 'GPS & Map Integration', to: '/technical-officer/gps-map', icon: 'location' },
    { label: 'Analyse Nearby Lands', to: '/technical-officer/nearby', icon: 'map' },
    { label: 'Generate Descriptions', to: '/technical-officer/descriptions', icon: 'document' },
    { label: 'Create Draft', to: '/technical-officer/draft', icon: 'edit' },
  ],
  'Manager L1': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document' },
    { label: 'Final Reports', to: '/manager/final-reports', icon: 'document' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: 'check' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: 'close' },
  ],
  'Manager L2': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document' },
    { label: 'Corrections', to: '/manager/corrections', icon: 'edit' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: 'check' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: 'close' },
  ],
  'Manager L3': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: 'document' },
    { label: 'Corrections', to: '/manager/corrections', icon: 'edit' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: 'check' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: 'close' },
  ],
  'Loan Applicant': [
    { label: 'Fill Form', to: '/applicant/fill-form', icon: 'edit' },
    { label: 'Make Payment', to: '/applicant/payment', icon: 'payment' },
  ],
  Bank: [{ label: 'View Report', to: '/bank/report', icon: 'document' }],
}
