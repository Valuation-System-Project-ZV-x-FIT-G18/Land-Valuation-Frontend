import EmailPasswordLoginForm from '@/Home_Pages/login/components/EmailPasswordLoginForm'

const InternalLoginForm = () => (
  <EmailPasswordLoginForm
    portalName="internal"
    allowedRoles={['Admin', 'Coordinator', 'Technical Officer', 'Manager L1', 'Manager L2', 'Manager L3']}
  />
)

export default InternalLoginForm
