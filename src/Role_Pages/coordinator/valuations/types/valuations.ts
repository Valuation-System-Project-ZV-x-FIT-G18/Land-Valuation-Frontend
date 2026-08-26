// One row of the coordinator's Valuations list.
export type ValuationListRow = {
  rowId: number
  valuationId: number
  projectId: string
  nic: string
  ownerName: string
  status: string
  createdAt: string
  technicalOfficerId: string
  technicalOfficerName: string
  inspectionDate: string
  inspectionTime: string
  bankName: string
  branchName: string
}
