import { describe, expect, it } from 'vitest'
import checkMessageType, { getMessageCategory } from '@/utils/check-msgtype'
import { MESSAGE_TYPE } from '@/utils/enums'

describe('message type helpers', () => {
  it('maps numeric values into the expected message categories', () => {
    expect(getMessageCategory(MESSAGE_TYPE.TEXT)).toBe('normal')
    expect(getMessageCategory(MESSAGE_TYPE.READ)).toBe('status')
    expect(getMessageCategory(MESSAGE_TYPE.TIP_TIME)).toBe('tip')
    expect(getMessageCategory(MESSAGE_TYPE.ACT_RT_VOICE)).toBe('action')
    expect(getMessageCategory(MESSAGE_TYPE.RTC_CALL_VOICE)).toBe('rtcPrivate')
    expect(getMessageCategory(MESSAGE_TYPE.RTC_GROUP_SETUP)).toBe('rtcGroup')
  })

  it('treats out-of-range or non-integer values as unknown', () => {
    expect(getMessageCategory(MESSAGE_TYPE.LOADING)).toBe('unknown')
    expect(getMessageCategory(39)).toBe('unknown')
    expect(getMessageCategory(3.14)).toBe('unknown')
    expect(getMessageCategory(Number.NaN)).toBe('unknown')
  })

  it('exposes category predicates built on the same classification logic', () => {
    expect(checkMessageType.isNormal(MESSAGE_TYPE.TEXT)).toBe(true)
    expect(checkMessageType.isStatus(MESSAGE_TYPE.RECEIPT)).toBe(true)
    expect(checkMessageType.isTip(MESSAGE_TYPE.TIP_TEXT)).toBe(true)
    expect(checkMessageType.isAction(MESSAGE_TYPE.ACT_RT_VIDEO)).toBe(true)
    expect(checkMessageType.isRtcPrivate(MESSAGE_TYPE.RTC_ACCEPT)).toBe(true)
    expect(checkMessageType.isRtcGroup(MESSAGE_TYPE.RTC_GROUP_JOIN)).toBe(true)
    expect(checkMessageType.isUnknown(MESSAGE_TYPE.LOADING)).toBe(true)
  })
})
