export function getErrorDetails(error: unknown): string {
  if (error instanceof Error) return error.stack ?? error.message

  // TODO: use JSON.stringify() for non-Error errors instead of String()?
  return String(error)
}

export function logError(summary: string, error?: unknown): void {
  if (!error) console.error(`🚨 ${summary}`)

  console.error(`🚨 ${summary}:\n\n${getErrorDetails(error)}\n`)
}
