import { onBeforeUnmount, ref, unref, watch } from 'vue'
import type { MaybeRef } from 'vue'
import localForage from 'localforage'

type UseCachedOptions = {
  prefix?: string
  fetchInit?: RequestInit
}

const DEFAULT_PREFIX = 'media:'

const createObjectUrl = (blob: Blob): string => URL.createObjectURL(blob)

export const useCached = (
  source: MaybeRef<string | undefined | null>,
  options: UseCachedOptions = {},
) => {
  const { prefix = DEFAULT_PREFIX, fetchInit } = options

  const cachedSrc = ref<string>('')
  let objectUrl: string | null = null

  const revokeObjectUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  const load = async (): Promise<void> => {
    const url = unref(source)?.trim()
    //clean up previous object URL
    revokeObjectUrl()

    if (!url) {
      cachedSrc.value = ''
      return
    }

    const cacheKey = `${prefix}:${url}`
    try {
      const cachedBlob = await localForage.getItem<Blob>(cacheKey)
      if (cachedBlob) {
        objectUrl = createObjectUrl(cachedBlob)
        cachedSrc.value = objectUrl
        return
      }

      const response = await fetch(url, {
        cache: 'force-cache',
        ...fetchInit,
      })
      if (!response.ok) {
        throw new Error(`Media fetch failed: ${response.status}`)
      }

      const blob = await response.blob()
      await localForage.setItem(cacheKey, blob)
      objectUrl = createObjectUrl(blob)
      cachedSrc.value = objectUrl
    } catch (error) {
      console.warn('Media cache fallback', error)
      cachedSrc.value = url
    }
  }

  watch(
    () => unref(source), //source 类型是 MaybeRef<string | undefined | null>，可能是一个 ref，也可能是普通字符串
    () => {
      void load()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => revokeObjectUrl())

  return { cachedSrc, reload: load }
}
