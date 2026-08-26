//02
import { Routes, Route, Navigate } from 'react-router-dom'
import GuestOnly from '@/Common_Pages/components/auth/GuestOnly'
import { AuthProvider } from '@/Common_Pages/components/auth/useAuth'
import Layout from '@/Common_Pages/components/layout/Layout'
import InternalLayout from '@/Common_Pages/components/layout/InternalLayout'
import HomePage from '@/Home_Pages/firstpage/pages/HomePage'
import AboutPage from '@/Home_Pages/about/pages/AboutPage'
import ServicesPage from '@/Home_Pages/services/pages/ServicesPage'
import ContactPage from '@/Home_Pages/contact/pages/ContactPage'
import ValuationRequestPage from '@/Home_Pages/valuation-request/pages/ValuationRequestPage'
import LoginPage from '@/Home_Pages/login/pages/LoginPage'
import DashboardPage from '@/Home_Pages/dashboard/pages/DashboardPage'
import ChangePasswordPage from '@/Home_Pages/change-password/pages/ChangePasswordPage'
import SettingsPage from '@/Home_Pages/settings/pages/SettingsPage'
import AddRolePage from '@/Role_Pages/admin/add-role/pages/AddRolePage'
import UserDetailsPage from '@/Role_Pages/admin/user-details/pages/UserDetailsPage'
import AdminAuditPage from '@/Role_Pages/admin/audit/pages/AdminAuditPage'
import BankManagementPage from '@/Role_Pages/admin/banks/pages/BankManagementPage'
import MessagesPage from '@/Home_Pages/messages/pages/MessagesPage'
import ContactMessagesPage from '@/Role_Pages/coordinator/website-inbox/pages/ContactMessagesPage'
import FillFormPage from '@/Role_Pages/loan-applicant/fill-form/pages/FillFormPage'
import AssignedProjectsPage from '@/Role_Pages/technical-officer/assignments/pages/AssignedProjectsPage'
import InspectionDataPage from '@/Role_Pages/technical-officer/inspections/pages/InspectionDataPage'
import SitePhotoPage from '@/Role_Pages/technical-officer/site-photos/pages/SitePhotoPage'
import GenerateDescriptionsPage from '@/Role_Pages/technical-officer/descriptions/pages/GenerateDescriptionsPage'
import NearbyAnalysisPage from '@/Role_Pages/technical-officer/nearby/pages/NearbyAnalysisPage'
import GpsMapPage from '@/Role_Pages/technical-officer/mapping/pages/GpsMapPage'
import ManagerDraftsPage from '@/Role_Pages/manager/drafts/pages/ManagerDraftsPage'
import ApprovedDraftsPage from '@/Role_Pages/manager/drafts/pages/ApprovedDraftsPage'
import MakePaymentPage from '@/Role_Pages/client/pages/MakePaymentPage'
import BankViewReportPage from '@/Role_Pages/client/pages/BankViewReportPage'
import ApplicantsPage from '@/Role_Pages/coordinator/applicants/pages/ApplicantsPage'
import RegisterApplicantPage from '@/Role_Pages/coordinator/register-applicant/pages/RegisterApplicantPage'
import EditApplicantPage from '@/Role_Pages/coordinator/register-applicant/pages/EditApplicantPage'
import NewProjectPage from '@/Role_Pages/coordinator/new-project/pages/NewProjectPage'
import NewValuationPage from '@/Role_Pages/coordinator/new-valuation/pages/NewValuationPage'
import ValuationsPage from '@/Role_Pages/coordinator/valuations/pages/ValuationsPage'
import ProjectStatusPage from '@/Role_Pages/coordinator/project-status/pages/ProjectStatusPage'
import FleetWorkspace from '@/Role_Pages/coordinator/fleet-management/components/FleetWorkspace'
import PaymentSlipsPage from '@/Role_Pages/coordinator/payment-slips/pages/PaymentSlipsPage'
import RejectedOfficersPage from '@/Role_Pages/coordinator/fleet-management/pages/RejectedOfficersPage'
import TOAttendancePage from '@/Role_Pages/technical-officer/attendance/pages/TOAttendancePage'
import FleetSummaryPage from '@/Role_Pages/coordinator/fleet-management/pages/FleetSummaryPage'
import AssignOfficersPage from '@/Role_Pages/coordinator/fleet-management/pages/AssignOfficersPage'
import TOAttendanceReviewPage from '@/Role_Pages/coordinator/fleet-management/pages/TOAttendanceReviewPage'
import CreateDraftPage from '@/Role_Pages/technical-officer/draft/pages/CreateDraftPage'
import TOCorrectionsPage from '@/Role_Pages/technical-officer/draft/pages/TOCorrectionsPage'

// Defines every URL and which page component it shows.
// Layout (header, footer, background, login popup) wraps all pages.
const App = () => {
  return (
    <AuthProvider>
        <Routes>
          {/* Public pages use the marketing layout (header + footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/request-valuation" element={<ValuationRequestPage />} />
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            {/* One sign-in page for everyone; the old split paths still resolve. */}
            <Route path="/login/internal" element={<Navigate to="/login" replace />} />
            <Route path="/login/external" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Internal pages use the app shell (fixed sidebar) */}
          <Route element={<InternalLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/admin/add-role" element={<AddRolePage />} />
            <Route path="/admin/user-details" element={<UserDetailsPage />} />
            <Route path="/admin/audit-log" element={<AdminAuditPage />} />
            <Route path="/admin/banks" element={<BankManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/applicant/fill-form" element={<FillFormPage />} />
            <Route
              path="/technical-officer/assignments"
              element={<AssignedProjectsPage />}
            />
            <Route
              path="/technical-officer/inspections"
              element={<InspectionDataPage />}
            />
            <Route
              path="/technical-officer/site-photos"
              element={<SitePhotoPage />}
            />
            <Route
              path="/technical-officer/descriptions"
              element={<GenerateDescriptionsPage />}
            />
            <Route
              path="/technical-officer/nearby"
              element={<NearbyAnalysisPage />}
            />
            <Route
              path="/technical-officer/gps-map"
              element={<GpsMapPage />}
            />
            <Route
              path="/technical-officer/attendance"
              element={<TOAttendancePage />}
            />
            <Route
              path="/technical-officer/draft"
              element={<CreateDraftPage />}
            />
            <Route
              path="/technical-officer/corrections"
              element={<TOCorrectionsPage />}
            />
            <Route
              path="/manager/check-drafts"
              element={<ManagerDraftsPage />}
            />
            <Route
              path="/manager/corrections"
              element={<ManagerDraftsPage view="corrections" />}
            />
            <Route
              path="/manager/final-reports"
              element={<ManagerDraftsPage view="final" />}
            />
            <Route
              path="/manager/approved-drafts"
              element={<ApprovedDraftsPage />}
            />
            <Route
              path="/manager/rejected-drafts"
              element={<ApprovedDraftsPage view="rejected" />}
            />
            <Route path="/applicant/payment" element={<MakePaymentPage />} />
            <Route path="/bank/report" element={<BankViewReportPage />} />
            <Route
              path="/coordinator/contact-messages"
              element={<ContactMessagesPage />}
            />
            {/* Applicants: the roster plus the NIC search that starts the flow. */}
            <Route path="/coordinator/applicants" element={<ApplicantsPage />} />
            {/* Create Project was the old name for the applicant step. */}
            <Route
              path="/coordinator/create-project"
              element={<Navigate to="/coordinator/applicants" replace />}
            />
            <Route
              path="/coordinator/register-applicant"
              element={<RegisterApplicantPage />}
            />
            <Route
              path="/coordinator/edit-applicant"
              element={<EditApplicantPage />}
            />
            <Route
              path="/coordinator/new-project"
              element={<Navigate to="/coordinator/projects/new" replace />}
            />
            {/* Valuations: the list of valuation requests and the form that raises one. */}
            <Route path="/coordinator/valuations" element={<ValuationsPage />} />
            <Route path="/coordinator/valuations/new" element={<NewValuationPage />} />
            {/* New Valuation was the old path; it is still linked from older
                screens, and rendering the same page keeps their router state. */}
            <Route
              path="/coordinator/new-valuation"
              element={<NewValuationPage />}
            />
            {/* Superseded by Fleet Management > Assign Officers; kept as a
                redirect so any bookmarked link still lands somewhere useful. */}
            <Route
              path="/coordinator/assign-technical-officer"
              element={<Navigate to="/coordinator/fleet-management/assign" replace />}
            />
            {/* Projects: the list of projects and the form that creates one. */}
            <Route path="/coordinator/projects" element={<ProjectStatusPage />} />
            <Route path="/coordinator/projects/new" element={<NewProjectPage />} />
            {/* Project Status was the old name for the same list. */}
            <Route
              path="/coordinator/project-states"
              element={<Navigate to="/coordinator/projects" replace />}
            />
            <Route
              path="/coordinator/payment-slips"
              element={<PaymentSlipsPage />}
            />
            {/* Fleet Management is one tabbed workspace behind a single sidebar entry. */}
            <Route path="/coordinator/fleet-management" element={<FleetWorkspace />}>
              <Route index element={<Navigate to="summary" replace />} />
              <Route path="summary" element={<FleetSummaryPage />} />
              <Route path="assign" element={<AssignOfficersPage />} />
              <Route path="rejected" element={<RejectedOfficersPage />} />
              <Route path="attendance" element={<TOAttendanceReviewPage />} />
            </Route>
            {/* Rejected used to be its own sidebar page — keep old links working. */}
            <Route
              path="/coordinator/rejected-officers"
              element={<Navigate to="/coordinator/fleet-management/rejected" replace />}
            />
          </Route>
        </Routes>
    </AuthProvider>
  )
}

export default App
