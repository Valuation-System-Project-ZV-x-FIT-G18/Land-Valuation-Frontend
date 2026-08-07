// Auto-generates the "Name with Initials" value from a first + last name,
// e.g. firstName "Kasun", lastName "Perera" -> "K. Perera".
// Used to pre-fill the Initials field on account forms; the field stays
// editable so the user can correct it (e.g. add middle-name initials).

export function deriveInitials(firstName: string, lastName: string): string {
  const first = firstName.trim()
  const last = lastName.trim()
  if (!first) return last
  const initial = `${first[0].toUpperCase()}.`
  return last ? `${initial} ${last}` : initial
}
