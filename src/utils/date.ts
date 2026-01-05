const ONE_MINUTE = 60000
const ONE_HOUR = 3600000
const ONE_DAY = 86400000

const pad = (value: number): string => value.toString().padStart(2, '0')

export const toTimeText = (timeStamp: number, simple?: boolean): string => {
  const dateTime = new Date(timeStamp)
  const timeDiff = Date.now() - dateTime.getTime()

  const formatted = formatDateTime(dateTime)

  switch (true) {
    case timeDiff <= ONE_MINUTE:
      return '刚刚'
    case timeDiff < ONE_HOUR:
      return `${Math.floor(timeDiff / ONE_MINUTE)}分钟前`
    case timeDiff < ONE_DAY && !isYestday(dateTime):
      return formatted.slice(11, 16)
    case isYestday(dateTime):
      return `昨天${formatted.slice(11, 16)}`
    case isYear(dateTime):
      return simple ? formatted.slice(5, 10) : formatted.slice(5)
    default:
      return simple ? formatted.slice(2, 10) : formatted
  }
}

export const isYestday = (date: Date): boolean => {
  const yesterday = new Date(Date.now() - ONE_DAY)
  return (
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate()
  )
}

export const isYear = (date: Date): boolean => date.getFullYear() === new Date().getFullYear()

export const formatDateTime = (date: Date | string | number): string => {
  if (date === '' || !date) {
    return ''
  }

  const dateObject = new Date(date)
  const y = dateObject.getFullYear()
  const m = pad(dateObject.getMonth() + 1)
  const d = pad(dateObject.getDate())
  const h = pad(dateObject.getHours())
  const minute = pad(dateObject.getMinutes())
  const second = pad(dateObject.getSeconds())

  return `${y}/${m}/${d} ${h}:${minute}:${second}`
}
