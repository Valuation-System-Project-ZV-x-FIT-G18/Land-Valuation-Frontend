// Validation for a bank "Branch Code".
// Allowed characters: letters, numbers and hyphens only.
// Returns an error message string, or undefined when valid.

const branchCodePattern = /^[A-Za-z0-9-]+$/

export function validateBranchCode(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Branch code is required.'
  if (!branchCodePattern.test(v)) {
    return 'Branch code can contain letters, numbers and hyphens only.'
  }
  return undefined
}
