export type ValuerProfile = {
  userId: string
  valuerName: string
  conflictOfInterest: 'No Conflict' | 'Conflict Disclosed'
  conflictDetails: string
  professionalQualifications: string
  ivslRegistrationNumber: string
  ricsRegistrationNumber: string
  ricsMembership: string
  relevantExperience: 'Confirmed' | 'Not Confirmed'
  indemnityStatus: 'Active' | 'Expired' | 'Not Available'
  indemnityPolicyNumber: string
  indemnityExpiryDate: string
}
