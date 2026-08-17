import EmailPasswordLoginForm from '@/Home_Pages/login/components/EmailPasswordLoginForm'

const ExternalLoginForm = () => (
  <EmailPasswordLoginForm portalName="external" allowedRoles={['Bank', 'Loan Applicant']} />
)

export default ExternalLoginForm
