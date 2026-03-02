import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  document.body.innerHTML = ''
})
