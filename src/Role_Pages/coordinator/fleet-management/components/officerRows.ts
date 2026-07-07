import type { Officer } from '@/Role_Pages/coordinator/fleet-management/types/fleet'

// The officer columns shared by every fleet table, and a helper that turns an
// officer into that row of cells. Kept in one place so the Assign and Summary
// pages stay in sync.
export const baseCols = ['TO ID', 'NIC', 'Name', 'District', 'Phone', 'Email']

export const officerCells = (o: Officer) => [
  o.userId,
  o.nic,
  o.name,
  o.district,
  o.phone,
  o.email,
]
