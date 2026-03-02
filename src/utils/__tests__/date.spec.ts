import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDateTime, isYear, isYestday, toTimeText } from '@/utils/date'

describe('date utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 1, 12, 0, 0))
  })

  it('formats date values into yyyy/mm/dd hh:mm:ss', () => {
    expect(formatDateTime(new Date(2026, 0, 5, 8, 9, 10))).toBe('2026/01/05 08:09:10')
    expect(formatDateTime('')).toBe('')
  })

  it('detects whether a date is yesterday or inside the current year', () => {
    expect(isYestday(new Date(2026, 1, 28, 9, 30, 0))).toBe(true)
    expect(isYestday(new Date(2026, 2, 1, 9, 30, 0))).toBe(false)
    expect(isYear(new Date(2026, 0, 1, 0, 0, 0))).toBe(true)
    expect(isYear(new Date(2025, 11, 31, 23, 59, 59))).toBe(false)
  })

  it('renders relative time labels for each display branch', () => {
    expect(toTimeText(Date.now() - 30_000)).toBe('刚刚')
    expect(toTimeText(Date.now() - 5 * 60_000)).toBe('5分钟前')
    expect(toTimeText(new Date(2026, 2, 1, 10, 15, 0).getTime())).toBe('10:15')
    expect(toTimeText(new Date(2026, 1, 28, 23, 15, 0).getTime())).toBe('昨天23:15')
    expect(toTimeText(new Date(2026, 0, 15, 8, 30, 45).getTime())).toBe('01/15 08:30:45')
    expect(toTimeText(new Date(2026, 0, 15, 8, 30, 45).getTime(), true)).toBe('01/15')
    expect(toTimeText(new Date(2025, 11, 31, 8, 30, 45).getTime())).toBe('2025/12/31 08:30:45')
    expect(toTimeText(new Date(2025, 11, 31, 8, 30, 45).getTime(), true)).toBe('25/12/31')
  })
})
