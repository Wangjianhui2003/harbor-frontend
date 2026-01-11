import { onBeforeUnmount, ref, unref, watch } from 'vue'
import type { Ref } from 'vue'
import localForage from 'localforage'

type UseCachedOptions = {
  prefix?: string
  fetchInit?: RequestInit
}

const DEFAULT_PREFIX = 'media:'

// 全局 Promise 缓存，避免同一 URL 的并发请求
const pendingRequests = new Map<string, Promise<Blob>>()

const createObjectUrl = (blob: Blob): string => URL.createObjectURL(blob)

/**
 * 获取或创建 Blob 的共享请求
 * 确保同一 URL 只发起一次网络请求
 */
const getOrFetchBlob = async (
  url: string,
  cacheKey: string,
  fetchInit?: RequestInit,
): Promise<Blob> => {
  // 先检查本地缓存
  const cachedBlob = await localForage.getItem<Blob>(cacheKey)
  if (cachedBlob) {
    return cachedBlob
  }

  // 检查是否有正在进行的请求
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)!
  }

  // 创建新的请求 Promise
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        ...fetchInit,
      })
      if (!response.ok) {
        throw new Error(`Media fetch failed: ${response.status}`)
      }

      const blob = await response.blob()
      // 存入本地缓存
      await localForage.setItem(cacheKey, blob)
      return blob
    } finally {
      // 请求完成后从 pending 中移除
      pendingRequests.delete(url)
    }
  })()

  pendingRequests.set(url, fetchPromise)
  return fetchPromise
}

export const useCached = (
  source: Ref<string | undefined | null>,
  options: UseCachedOptions = {},
) => {
  const { prefix = DEFAULT_PREFIX, fetchInit } = options

  const cachedSrc = ref<string>('')
  let objectUrl: string | null = null
  let currentUrl: string | null = null

  const revokeObjectUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  const load = async (): Promise<void> => {
    const url = unref(source)?.trim()

    // 如果 URL 没变，不重复加载
    if (url === currentUrl && cachedSrc.value) {
      return
    }

    // clean up previous object URL
    revokeObjectUrl()
    currentUrl = url || null

    if (!url) {
      cachedSrc.value = ''
      return
    }

    const cacheKey = `${prefix}:${url}`
    try {
      const blob = await getOrFetchBlob(url, cacheKey, fetchInit)
      // 确保在异步操作后 URL 仍然是当前的
      if (url !== currentUrl) {
        return
      }
      objectUrl = createObjectUrl(blob)
      cachedSrc.value = objectUrl
    } catch (error) {
      console.warn('Media cache fallback', error)
      // 确保在异步操作后 URL 仍然是当前的
      if (url === currentUrl) {
        cachedSrc.value = url
      }
    }
  }

  watch(source, load, { immediate: true })

  onBeforeUnmount(() => revokeObjectUrl())

  return { cachedSrc, reload: load }
}
