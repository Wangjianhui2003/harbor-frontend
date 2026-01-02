export function setCookie(key: string, value: string) {
  document.cookie = key + '=' + decodeURIComponent(value)
}

export function getCookie(name: string) {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  const arr: RegExpMatchArray | null = document.cookie.match(reg)
  if (arr) {
    return decodeURIComponent(arr[2]!)
  }
  return ''
}
