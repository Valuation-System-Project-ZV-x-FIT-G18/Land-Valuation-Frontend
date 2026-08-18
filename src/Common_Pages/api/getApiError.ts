type ApiErrorBody = {
  message?: unknown
  error?: unknown
}

// NestJS uses `message` for both DTO validation failures and explicit HTTP
// exceptions. Never show its generic `error` value (such as "Bad Request")
// when a useful message is available.
export function getApiError(body: ApiErrorBody, fallback: string): string {
  const message = Array.isArray(body.message)
    ? body.message.filter((item): item is string => typeof item === 'string').join(' ')
    : typeof body.message === 'string'
      ? body.message
      : ''

  if (message.trim()) return message.trim()

  const error = typeof body.error === 'string' ? body.error.trim() : ''
  if (error && !['Bad Request', 'Internal Server Error'].includes(error)) return error

  return fallback
}

