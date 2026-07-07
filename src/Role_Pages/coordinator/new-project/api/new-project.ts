// Submits the Create Project form (multipart, with file uploads).
// POST /api/coordinator/projects
export async function createProject(
  formData: FormData,
): Promise<{ ok: boolean; projectId?: string; error?: string }> {
  try {
    // Note: do NOT set Content-Type — the browser adds the multipart boundary.
    const res = await fetch('/api/coordinator/projects', {
      method: 'POST',
      body: formData,
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, projectId: body.projectId as string }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.error as string)
    return { ok: false, error: message || 'Could not create the project.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
