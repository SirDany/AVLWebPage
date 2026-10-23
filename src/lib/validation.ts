export function isHTTPS(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export function validateURL(value: unknown): true | string {
  return !value || isHTTPS(value) ? true : 'Enter a complete HTTPS URL.'
}

export function validateSlug(value: unknown): true | string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? true
    : 'Use lowercase letters, numbers, and single hyphens.'
}

export function isVideoID(value: unknown): value is string {
  return typeof value === 'string' && /^[\w-]{11}$/.test(value)
}
