export const toTimeText = (timeStamp: number, simple?: boolean): string => {
  const dateTime = new Date(timeStamp)
  const currentTime = Date.parse(new Date().toString()) //当前时间
  const timeDiff = currentTime - dateTime.getTime() //与当前时间误差
  let timeText = ''
  if (timeDiff <= 60000) {
    //一分钟内
    timeText = '刚刚'
  } else if (timeDiff > 60000 && timeDiff < 3600000) {
    //1小时内
    timeText = Math.floor(timeDiff / 60000) + '分钟前'
  } else if (timeDiff >= 3600000 && timeDiff < 86400000 && !isYestday(dateTime)) {
    //今日
    timeText = formatDateTime(dateTime).substr(11, 5)
  } else if (isYestday(dateTime)) {
    //昨天
    timeText = '昨天' + formatDateTime(dateTime).substr(11, 5)
  } else if (isYear(dateTime)) {
    //今年
    timeText = formatDateTime(dateTime).substr(5, simple ? 5 : 14)
  } else {
    //不属于今年
    timeText = formatDateTime(dateTime)
    if (simple) {
      timeText = timeText.substr(2, 8)
    }
  }
  return timeText
}

export const isYestday = (date: Date): boolean => {
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
  return (
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate()
  )
}

export const isYear = (date: Date): boolean => {
  return date.getFullYear() === new Date().getFullYear()
}

export const formatDateTime = (date: Date | string | number): string => {
  if (date === '' || !date) {
    return ''
  }
  const dateObject = new Date(date)
  const y = dateObject.getFullYear()
  let m: string | number = dateObject.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d: string | number = dateObject.getDate()
  d = d < 10 ? '0' + d : d
  let h: string | number = dateObject.getHours()
  h = h < 10 ? '0' + h : h
  let minute: string | number = dateObject.getMinutes()
  minute = minute < 10 ? '0' + minute : minute
  let second: string | number = dateObject.getSeconds()
  second = second < 10 ? '0' + second : second
  return y + '/' + m + '/' + d + ' ' + h + ':' + minute + ':' + second
}
