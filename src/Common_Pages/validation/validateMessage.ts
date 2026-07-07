// Validation for a "Message" field. Reused by every form with a message.
// `minLength` lets each form set its own minimum (default 10).
// Returns an error message string, or undefined when the value is valid.

export function validateMessage(
  value: string,
  minLength = 10,
): string | undefined {
  const v = value.trim()
  if (!v) return 'Message is required.'
  if (v.length < minLength) return 'Please add a little more detail.'
  return undefined
}
