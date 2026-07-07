// Splits a full name into first name, last name and "name with initials".
// e.g. "Chaminda Prasad Senarathne" -> first: Chaminda, last: Senarathne,
//      name with initials: "C.P. Senarathne".
export function deriveName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const firstName = parts[0] ?? ''
  const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
  const initialsOfRest = parts
    .slice(0, -1)
    .map((p) => p[0].toUpperCase() + '.')
    .join('')
  const nameWithInitials = parts.length > 1 ? `${initialsOfRest} ${lastName}` : ''
  return { firstName, lastName, nameWithInitials, valid: parts.length >= 2 }
}
