// Validation utilities

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidSize(size: number): boolean {
  return size > 0 && size <= 200
}

export function isValidCount(count: number): boolean {
  return count > 0 && count <= 100
}
