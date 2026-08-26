export type ReportReadiness = {
  score: number
  missingFields: number
  blockers: string[]
  warnings: string[]
  checks: Array<{ label: string; passed: boolean; detail?: string }>
}

const occurrences = (value: string, pattern: RegExp) => value.match(pattern)?.length ?? 0

export const analyseReportReadiness = (html: string): ReportReadiness => {
  const trimmed = html.trim()
  const text = trimmed.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ')
  const missingFields = occurrences(text, /\[\s*To be filled\s*\]/gi)
  const templateTokens = occurrences(trimmed, /{{\s*[^{}]+\s*}}|\$\{[^}]+}/g)
  const brokenValues = occurrences(text, /\[object Object\]|\bundefined\b|\bnull\b/gi)
  const hasImages = /<img\b/i.test(trimmed)
  const hasValuation = /market value|forced sale value|valuation/i.test(text)
  const hasProperty = /property|land|premises/i.test(text)

  const blockers: string[] = []
  if (text.replace(/\s+/g, ' ').trim().length < 200) blockers.push('The report is empty or incomplete.')
  if (templateTokens) blockers.push(`${templateTokens} unresolved template token${templateTokens === 1 ? '' : 's'} remain.`)
  if (brokenValues) blockers.push(`${brokenValues} invalid generated value${brokenValues === 1 ? '' : 's'} remain.`)

  const warnings: string[] = []
  if (missingFields) warnings.push(`${missingFields} field${missingFields === 1 ? '' : 's'} still show “To be filled”.`)
  if (!hasImages) warnings.push('No report image was detected. Confirm whether photographs are required.')
  if (!hasValuation) warnings.push('A valuation conclusion was not detected.')

  const checks = [
    { label: 'Report content generated', passed: text.replace(/\s+/g, ' ').trim().length >= 200 },
    { label: 'Property information present', passed: hasProperty },
    { label: 'Valuation conclusion present', passed: hasValuation },
    { label: 'Template tokens resolved', passed: templateTokens === 0, detail: templateTokens ? `${templateTokens} remaining` : undefined },
    { label: 'Required fields completed', passed: missingFields === 0, detail: missingFields ? `${missingFields} remaining` : undefined },
    { label: 'Report photographs included', passed: hasImages },
  ]
  const passed = checks.filter((check) => check.passed).length

  return { score: Math.round((passed / checks.length) * 100), missingFields, blockers, warnings, checks }
}
