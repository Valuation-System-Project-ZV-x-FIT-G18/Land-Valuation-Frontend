// Sri Lankan provinces and the districts in each (for the address dropdowns).
// Shared by every form that collects a Province / District — the District
// choices are always filtered down to the selected Province.

export const provinces = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
]

export const districtsByProvince: Record<string, string[]> = {
  Western: ['Colombo', 'Gampaha', 'Kalutara'],
  Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
  Southern: ['Galle', 'Matara', 'Hambantota'],
  Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  Eastern: ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  Uva: ['Badulla', 'Monaragala'],
  Sabaragamuwa: ['Ratnapura', 'Kegalle'],
}

// Every district in one sorted list. Use this where a form collects a
// single location and there is no Province field to filter against.
export const allDistricts = Object.values(districtsByProvince)
  .flat()
  .sort((a, b) => a.localeCompare(b))
