type MessageCategory =
  | 'normal'
  | 'status'
  | 'tip'
  | 'action'
  | 'rtcPrivate'
  | 'rtcGroup'
  | 'unknown'

const MESSAGE_TYPE_RANGES: Record<Exclude<MessageCategory, 'unknown'>, [number, number]> = {
  normal: [0, 10],
  status: [10, 20],
  tip: [20, 30],
  action: [40, 50],
  rtcPrivate: [100, 200],
  rtcGroup: [200, 300],
}

const isInRange = (type: number, [min, max]: [number, number]): boolean => {
  return type >= min && type < max
}

// 返回消息类型，未匹配时为 unknown
export const getMessageCategory = (type: number): MessageCategory => {
  if (!Number.isInteger(type)) return 'unknown'

  for (const [category, range] of Object.entries(MESSAGE_TYPE_RANGES)) {
    if (isInRange(type, range as [number, number])) {
      return category as Exclude<MessageCategory, 'unknown'>
    }
  }

  return 'unknown'
}
const isNormal = (type: number): boolean => getMessageCategory(type) === 'normal'
const isStatus = (type: number): boolean => getMessageCategory(type) === 'status'
const isTip = (type: number): boolean => getMessageCategory(type) === 'tip'
const isAction = (type: number): boolean => getMessageCategory(type) === 'action'
const isRtcPrivate = (type: number): boolean => getMessageCategory(type) === 'rtcPrivate'
const isRtcGroup = (type: number): boolean => getMessageCategory(type) === 'rtcGroup'
const isUnknown = (type: number): boolean => getMessageCategory(type) === 'unknown'

const checkMessageType = {
  isNormal,
  isStatus,
  isTip,
  isAction,
  isRtcPrivate,
  isRtcGroup,
  isUnknown,
}

export default checkMessageType
