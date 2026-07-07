import { Routes, Route } from 'react-router-dom'
import { LoginModalProvider } from '@/Common_Pages/components/auth/useLoginModal'
import { AuthProvider } from '@/Common_Pages/components/auth/useAuth'
import Layout from '@/Common_Pages/components/layout/Layout'
import InternalLayout from '@/Common_Pages/components/layout/InternalLayout'
import PlaceholderPage from '@/Common_Pages/components/PlaceholderPage'
import HomePage from '@/Home_Pages/firstpage/pages/HomePage'
import AboutPage from '@/Home_Pages/about/pages/AboutPage'
import ServicesPage from '@/Home_Pages/services/pages/ServicesPage'
import ContactPage from '@/Home_Pages/contact/pages/ContactPage'
import RequestValuationPage from '@/Home_Pages/request-valuation/pages/RequestValuationPage'
import InternalLoginPage from '@/Home_Pages/internal-login/pages/InternalLoginPage'
import ExternalLoginPage from '@/Home_Pages/external-login/pages/ExternalLoginPage'
import DashboardPage from '@/Home_Pages/dashboard/pages/DashboardPage'
import ChangePasswordPage from '@/Home_Pages/change-password/pages/ChangePasswordPage'
import SettingsPage from '@/Home_Pages/settings/pages/SettingsPage'
import AddRolePage from '@/Role_Pages/admin/add-role/pages/AddRolePage'
import MessagesPage from '@/Home_Pages/messages/pages/MessagesPage'
import NewRequestsPage from '@/Role_Pages/coordinator/website-inbox/pages/NewRequestsPage'
import ContactMessagesPage from '@/Role_Pages/coordinator/website-inbox/pages/ContactMessagesPage'
import DocumentsPage from '@/Role_Pages/loan-applicant/documents/pages/DocumentsPage'
import AssignedProjectsPage from '@/Role_Pages/technical-officer/assignments/pages/AssignedProjectsPage'
import InspectionDataPage from '@/Role_Pages/technical-officer/inspections/pages/InspectionDataPage'
import SitePhotoPage from '@/Role_Pages/technical-officer/site-photos/pages/SitePhotoPage'
import GenerateDescriptionsPage from '@/Role_Pages/technical-officer/descriptions/pages/GenerateDescriptionsPage'
import NearbyAnalysisPage from '@/Role_Pages/technical-officer/nearby/pages/NearbyAnalysisPage'
import GpsMapPage from '@/Role_Pages/technical-officer/mapping/pages/GpsMapPage'
import CreateDraftPage from '@/Role_Pages/technical-officer/draft/pages/CreateDraftPage'
import TOCorrectionsPage from '@/Role_Pages/technical-officer/draft/pages/TOCorrectionsPage'
import ManagerDraftsPage from '@/Role_Pages/manager/drafts/pages/ManagerDraftsPage'
import MakePaymentPage from '@/Role_Pages/client/pages/MakePaymentPage'
import BankViewReportPage from '@/Role_Pages/client/pages/BankViewReportPage'
import ApplicantDocumentsPage from '@/Role_Pages/coordinator/applicant-documents/pages/ApplicantDocumentsPage'
import CreateProjectPage from '@/Role_Pages/coordinator/create-project/pages/CreateProjectPage'
import RegisterApplicantPage from '@/Role_Pages/coordinator/register-applicant/pages/RegisterApplicantPage'
import NewProjectPage from '@/Role_Pages/coordinator/new-project/pages/NewProjectPage'
import NewValuationPage from '@/Role_Pages/coordinator/new-valuation/pages/NewValuationPage'
import ProjectStatusPage from '@/Role_Pages/coordinator/project-status/pages/ProjectStatusPage'
import AssignTechnicalOfficerPage from '@/Role_Pages/coordinator/assign-technical-officer/pages/AssignTechnicalOfficerPage'
import FleetManagementPage from '@/Role_Pages/coordinator/fleet-management/pages/FleetManagementPage'
import PaymentSlipsPage from '@/Role_Pages/coordinator/payment-slips/pages/PaymentSlipsPage'
import RejectedOfficersPage from '@/Role_Pages/coordinator/fleet-management/pages/RejectedOfficersPage'
import TOAttendancePage from '@/Role_Pages/technical-officer/attendance/pages/TOAttendancePage'
import FleetSummaryPage from '@/Role_Pages/coordinator/fleet-management/pages/FleetSummaryPage'
import AssignOfficersPage from '@/Role_Pages/coordinator/fleet-management/pages/AssignOfficersPage'

// Defines every URL and which page component it shows.
// Layout (header, footer, background, login popup) wraps all pages.
const App = () => {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <Routes>
          {/* Public pages use the marketing layout (header + footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/request-valuation" element={<RequestValuationPage />} />
            <Route path="/login/internal" element={<InternalLoginPage />} />
            <Route path="/login/external" element={<ExternalLoginPage />} />
          </Route>

          {/* Internal pages use the app shell (fixed sidebar) */}
          <Route element={<InternalLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/admin/add-role" element={<AddRolePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/applicant/documents" element={<DocumentsPage />} />
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
              path="/technical-officer/draft"
              element={<CreateDraftPage />}
            />
            <Route
              path="/technical-officer/corrections"
              element={<TOCorrectionsPage />}
            />
            <Route
              path="/technical-officer/attendance"
              element={<TOAttendancePage />}
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
            <Route path="/applicant/payment" element={<MakePaymentPage />} />
            <Route path="/bank/report" element={<BankViewReportPage />} />
            <Route
              path="/coordinator/new-requests"
              element={<NewRequestsPage />}
            />
            <Route
              path="/coordinator/contact-messages"
              element={<ContactMessagesPage />}
            />
            <Route
              path="/coordinator/applicant-documents"
              element={<ApplicantDocumentsPage />}
            />
            <Route
              path="/coordinator/create-project"
              element={<CreateProjectPage />}
            />
            <Route
              path="/coordinator/register-applicant"
              element={<RegisterApplicantPage />}
            />
            <Route
              path="/coordinator/new-project"
              element={<NewProjectPage />}
            />
            <Route
              path="/coordinator/revaluation"
              element={<PlaceholderPage title="Revaluation Dashboard" />}
            />
            <Route
              path="/coordinator/new-valuation"
              element={<NewValuationPage />}
            />
            <Route
              path="/coordinator/assign-technical-officer"
              element={<AssignTechnicalOfficerPage />}
            />
            <Route
              path="/coordinator/project-states"
              element={<ProjectStatusPage />}
            />
            <Route
              path="/coordinator/fleet-management"
              element={<FleetManagementPage />}
            />
            <Route
              path="/coordinator/payment-slips"
              element={<PaymentSlipsPage />}
            />
            <Route
              path="/coordinator/fleet-management/summary"
              element={<FleetSummaryPage />}
            />
            <Route
              path="/coordinator/fleet-management/assign"
              element={<AssignOfficersPage />}
            />
            <Route path="/coordinator/rejected-officers" element={<RejectedOfficersPage />} />
          </Route>
        </Routes>
      </LoginModalProvider>
    </AuthProvider>
  )
}

export default App
