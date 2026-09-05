// In-memory admin flag store (mock only)
// TODO: Persist in real database when backend ready

export interface TitleAdminFlags {
  visibleWithoutSignup: boolean
  isDemoContent: boolean
}

// Pre-populate with a few IDs (will be lazily extended)
const adminFlags: Record<string, TitleAdminFlags> = {
  '1': { visibleWithoutSignup: true, isDemoContent: true },
  '3': { visibleWithoutSignup: true, isDemoContent: false },
  '4': { visibleWithoutSignup: true, isDemoContent: true },
  '5': { visibleWithoutSignup: false, isDemoContent: false },
}

export function getAdminFlags(id: string): TitleAdminFlags {
  if (!adminFlags[id]) {
    adminFlags[id] = { visibleWithoutSignup: false, isDemoContent: false }
  }
  return adminFlags[id]
}

export function setAdminFlag(id: string, key: keyof TitleAdminFlags, value: boolean) {
  const flags = getAdminFlags(id)
  flags[key] = value
}

export function bulkSetAdminFlags(ids: string[], key: keyof TitleAdminFlags, value: boolean) {
  ids.forEach((id) => setAdminFlag(id, key, value))
}

export function resetAdminFlags() {
  Object.keys(adminFlags).forEach((id) => {
    adminFlags[id] = { visibleWithoutSignup: false, isDemoContent: false }
  })
}

export function getAllFlags() {
  return adminFlags
}
