// Site-visit date and time come from Postgres DATE and TIME columns as plain
// yyyy-mm-dd and HH:MM:SS strings. They are calendar/wall values with no
// timezone, so they must not be passed through `new Date(value)` — that reads
// them as UTC instants and shifts the day for anyone east of Greenwich.

// "2026-08-27" -> "Aug 27, 2026"
export const formatVisitDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// "10:10:00" -> "10:10". Seconds are never meaningful for a site visit.
export const formatVisitTime = (value: string) => value.slice(0, 5)
