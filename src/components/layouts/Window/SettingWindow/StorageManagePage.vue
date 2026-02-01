<template>
  <div class="h-screen w-full">
    <ScrollArea class="h-full w-full overflow-auto px-6">
      <div class="h-5"></div>
      <div class="flex flex-col gap-4">
        <!-- 存储概览 -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <HardDrive class="w-5 h-5" />
              存储使用情况
              <Button variant="ghost" size="sm" class="ml-auto h-7" @click="calculateStorageSize">
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- 进度条 -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>已使用 {{ formatBytes(totalUsage) }}</span>
                <span class="text-muted-foreground">{{ storageItems.length }} 项缓存</span>
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary transition-all duration-300"
                  :style="{ width: `${Math.min(usagePercent, 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- 存储项列表 -->
            <div class="space-y-3 pt-2">
              <div
                v-for="item in storageItems"
                :key="item.key"
                class="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div class="flex items-center gap-3">
                  <component :is="item.icon" class="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div class="text-sm font-medium">{{ item.name }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ item.description }}
                      <span v-if="item.count" class="ml-1">({{ item.count }} 项)</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-muted-foreground">{{ formatBytes(item.size) }}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 px-2"
                    @click="clearStorage(item.key)"
                    :disabled="clearing === item.key || item.size === 0"
                  >
                    <Loader2 v-if="clearing === item.key" class="w-4 h-4 animate-spin" />
                    <Trash2 v-else class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div class="flex flex-row">
              <HoverTip content="清除所有媒体缓存">
                <Button variant="ghost" class="size-8" @click="clearAllMediaCache">
                  <Eraser class="size-4" />
                </Button>
              </HoverTip>
              <HoverTip content="清除所有数据（需重新登录）">
                <Button
                  variant="ghost"
                  class="text-destructive hover:text-destructive size-8"
                  @click="clearAllData"
                >
                  <Trash2 class="size-4" />
                </Button>
              </HoverTip>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import localForage from 'localforage'
import {
  HardDrive,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Music,
  UserCircle,
  Database,
  Trash2,
  Loader2,
  Eraser,
  RefreshCw,
} from 'lucide-vue-next'
import { showSuccess, showError } from '@/utils/message'
import { useToast } from 'primevue/usetoast'
import HoverTip from '@/components/common/HoverTip.vue'

const toast = useToast()
const clearing = ref<string | null>(null)
const loading = ref(false)

interface StorageItem {
  key: string
  name: string
  description: string
  icon: Component
  size: number
  count: number
}

// 存储项配置
const storageItems = ref<StorageItem[]>([
  {
    key: 'audio',
    name: '音频缓存',
    description: '聊天中的语音消息',
    icon: Music,
    size: 0,
    count: 0,
  },
  {
    key: 'image',
    name: '图片缓存',
    description: '聊天中的图片',
    icon: ImageIcon,
    size: 0,
    count: 0,
  },
  {
    key: 'video',
    name: '视频缓存',
    description: '聊天中的视频',
    icon: Video,
    size: 0,
    count: 0,
  },
  {
    key: 'avatar',
    name: '头像缓存',
    description: '用户和群组头像',
    icon: UserCircle,
    size: 0,
    count: 0,
  },
  {
    key: 'chats',
    name: '聊天记录',
    description: '本地缓存的聊天列表',
    icon: MessageSquare,
    size: 0,
    count: 0,
  },
  {
    key: 'localStorage',
    name: 'LocalStorage',
    description: '应用配置和用户偏好',
    icon: Database,
    size: 0,
    count: 0,
  },
])

// 计算总使用量
const totalUsage = computed(() => {
  return storageItems.value.reduce((sum, item) => sum + item.size, 0)
})

// 使用百分比（假设上限 100MB）
const usagePercent = computed(() => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  return (totalUsage.value / maxSize) * 100
})

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算存储大小
const calculateStorageSize = async () => {
  loading.value = true

  try {
    // 统计 IndexedDB (localForage) 中的媒体缓存
    const mediaCounts: Record<string, { size: number; count: number }> = {
      audio: { size: 0, count: 0 },
      image: { size: 0, count: 0 },
      video: { size: 0, count: 0 },
      avatar: { size: 0, count: 0 },
      chats: { size: 0, count: 0 },
    }

    // 遍历 localForage 中的所有键
    await localForage.iterate((value: unknown, key: string) => {
      let size = 0
      if (value instanceof Blob) {
        size = value.size
      } else if (typeof value === 'string') {
        size = value.length * 2 // UTF-16
      } else if (value) {
        size = JSON.stringify(value).length * 2
      }

      // 根据 key 前缀分类
      if (key.includes('audio:') || key.includes('audio/')) {
        mediaCounts.audio!.size += size
        mediaCounts.audio!.count++
      } else if (key.includes('avatar:') || key.includes('avatar/')) {
        mediaCounts.avatar!.size += size
        mediaCounts.avatar!.count++
      } else if (key.includes('video:') || key.includes('video/')) {
        mediaCounts.video!.size += size
        mediaCounts.video!.count++
      } else if (key.includes('image:') || key.includes('image/')) {
        mediaCounts.image!.size += size
        mediaCounts.image!.count++
      } else if (key.startsWith('chats')) {
        mediaCounts.chats!.size += size
        mediaCounts.chats!.count++
      } else {
        // 默认归类到图片（因为媒体缓存通常使用 media: 前缀）
        mediaCounts.image!.size += size
        mediaCounts.image!.count++
      }
    })

    // 更新存储项
    for (const item of storageItems.value) {
      if (mediaCounts[item.key]) {
        item.size = mediaCounts[item.key]!.size
        item.count = mediaCounts[item.key]!.count
      }
    }

    // LocalStorage 大小
    let localStorageSize = 0
    let localStorageCount = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        localStorageSize += (localStorage[key]?.length || 0) * 2 // UTF-16
        localStorageCount++
      }
    }
    const lsItem = storageItems.value.find((i) => i.key === 'localStorage')
    if (lsItem) {
      lsItem.size = localStorageSize
      lsItem.count = localStorageCount
    }
  } catch (error) {
    console.error('计算存储大小失败:', error)
  } finally {
    loading.value = false
  }
}

// 清除单个存储项
const clearStorage = async (key: string) => {
  clearing.value = key
  try {
    if (key === 'localStorage') {
      // 保留登录信息
      const token = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.clear()
      if (token) localStorage.setItem('accessToken', token)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    } else {
      // 清除 localForage 中对应类型的缓存
      const keysToRemove: string[] = []

      await localForage.iterate((_, itemKey: string) => {
        const shouldRemove =
          (key === 'audio' && (itemKey.includes('audio:') || itemKey.includes('audio/'))) ||
          (key === 'image' && (itemKey.includes('image:') || itemKey.includes('image/'))) ||
          (key === 'video' && (itemKey.includes('video:') || itemKey.includes('video/'))) ||
          (key === 'avatar' && (itemKey.includes('avatar:') || itemKey.includes('avatar/'))) ||
          (key === 'chats' && itemKey.startsWith('chats'))

        if (shouldRemove) {
          keysToRemove.push(itemKey)
        }
      })

      // 删除找到的键
      for (const k of keysToRemove) {
        await localForage.removeItem(k)
      }
    }

    await calculateStorageSize()
    showSuccess(toast, '成功', '已清除')
  } catch (error) {
    showError(toast, '错误', '清除失败')
    console.error(error)
  } finally {
    clearing.value = null
  }
}

// 清除所有媒体缓存
const clearAllMediaCache = async () => {
  clearing.value = 'all'
  try {
    // 清除 localForage 中的所有数据
    await localForage.clear()
    await calculateStorageSize()
    showSuccess(toast, '成功', '已清除所有媒体缓存')
  } catch (error) {
    showError(toast, '错误', '清除失败')
    console.error(error)
  } finally {
    clearing.value = null
  }
}

// 清除所有数据
const clearAllData = () => {
  if (confirm('确定要清除所有数据吗？这将需要重新登录。')) {
    localStorage.clear()
    sessionStorage.clear()
    localForage.clear()
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      })
    }
    // 清除 IndexedDB
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('localforage')
      indexedDB.deleteDatabase('harbor-media-cache')
    }
    window.location.href = '/login'
  }
}

onMounted(() => {
  calculateStorageSize()
})
</script>

<style scoped></style>
