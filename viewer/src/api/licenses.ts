import { apiFetch } from './client'
import type { LicenseVerifyResult } from '../types'

export async function verifyLicense(contentId: string, action = 'view') {
  return apiFetch<LicenseVerifyResult>('/licenses/verify', {
    method: 'POST',
    body: JSON.stringify({ contentId, action }),
  })
}
