// The middle menu items for each internal role's sidebar.
// (Dashboard at the top and Settings + Logout at the bottom are added
//  separately in the Sidebar, because they are the same for every role.)

export type SidebarItem = { label: string; to: string; icon: string }

export const roleMenus: Record<string, SidebarItem[]> = {
  Admin: [
    { label: 'Add User', to: '/admin/add-role', icon: '➕' },
    { label: 'User Details', to: '/admin/user-details', icon: '👥' },
  ],
  Coordinator: [
    { label: 'New Requests', to: '/coordinator/new-requests', icon: '📨' },
    { label: 'Contact Messages', to: '/coordinator/contact-messages', icon: '✉️' },
    { label: 'Register Applicant', to: '/coordinator/create-project', icon: '🧾' },
    { label: 'Create Project', to: '/coordinator/new-project', icon: '🗂️' },
    { label: 'New Valuation', to: '/coordinator/new-valuation', icon: '🧮' },
    { label: 'Applicant Documents', to: '/coordinator/applicant-documents', icon: '📂' },
    { label: 'Fleet Management', to: '/coordinator/fleet-management', icon: '🚚' },
    { label: 'Payment Slips', to: '/coordinator/payment-slips', icon: '🧾' },
    { label: 'Rejected', to: '/coordinator/rejected-officers', icon: '⛔' },
  ],
  'Technical Officer': [
    { label: 'Assigned Projects', to: '/technical-officer/assignments', icon: '🗺️' },
    { label: 'My Attendance', to: '/technical-officer/attendance', icon: '🗓️' },
    { label: 'Inspection Data', to: '/technical-officer/inspections', icon: '📝' },
    { label: 'Site Photo', to: '/technical-officer/site-photos', icon: '📷' },
    { label: 'GPS & Map Integration', to: '/technical-officer/gps-map', icon: '📍' },
    { label: 'Analyse Nearby Lands', to: '/technical-officer/nearby', icon: '🗺️' },
    { label: 'Generate Descriptions', to: '/technical-officer/descriptions', icon: '✨' },
    { label: 'Create Draft', to: '/technical-officer/draft', icon: '📄' },
    { label: 'Rejected Draft Report', to: '/technical-officer/corrections', icon: '📝' },
  ],
  'Manager L1': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: '📑' },
    { label: 'Final Reports', to: '/manager/final-reports', icon: '🔒' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: '✅' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: '❌' },
  ],
  'Manager L2': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: '📑' },
    { label: 'Corrections', to: '/manager/corrections', icon: '📝' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: '✅' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: '❌' },
  ],
  'Manager L3': [
    { label: 'Check Drafts', to: '/manager/check-drafts', icon: '📑' },
    { label: 'Corrections', to: '/manager/corrections', icon: '📝' },
    { label: 'Approved Drafts', to: '/manager/approved-drafts', icon: '✅' },
    { label: 'Rejected Drafts', to: '/manager/rejected-drafts', icon: '❌' },
  ],
  'Loan Applicant': [
    { label: 'Fill Form', to: '/applicant/fill-form', icon: '🧾' },
    { label: 'My Documents', to: '/applicant/documents', icon: '📎' },
    { label: 'Make Payment', to: '/applicant/payment', icon: '💳' },
  ],
  Bank: [
    { label: 'View Report', to: '/bank/report', icon: '📄' },
  ],
}
