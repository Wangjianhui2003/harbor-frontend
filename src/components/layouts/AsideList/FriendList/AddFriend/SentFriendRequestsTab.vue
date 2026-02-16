<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <span class="text-sm text-muted-foreground">我发送的好友请求</span>
      <Button variant="outline" size="sm" @click="loadSentRequests" :disabled="loadingSent">
        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingSent }" />
        刷新
      </Button>
    </div>

    <ScrollArea class="flex-1 min-h-0">
      <div v-if="loadingSent" class="text-center py-8 text-muted-foreground">加载中...</div>
      <div v-else-if="sentRequests.length === 0" class="text-center py-8 text-muted-foreground">
        暂无发送的请求
      </div>
      <div v-else class="space-y-2">
        <div v-for="request in sentRequests" :key="request.id" class="p-3 rounded-lg border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="flex-1 min-w-0">
                <div class="font-medium">用户ID: {{ request.receiveUserId }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ request.requestNote || '' }}
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  {{ formatTime(request.createdTime) }}
                </div>
              </div>
            </div>
            <Badge :variant="getStatusVariant(request.status)">
              {{ getStatusText(request.status) }}
            </Badge>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-vue-next'
import { getSentFriendRequests, type AddUserRequestRecord } from '@/api/add_api.ts'
import { useToast } from 'primevue/usetoast'
import { showError } from '@/utils/message.ts'

const toast = useToast()
const sentRequests = ref<AddUserRequestRecord[]>([])
const loadingSent = ref(false)

const loadSentRequests = async () => {
  loadingSent.value = true
  try {
    const requests = await getSentFriendRequests()
    sentRequests.value = requests
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '加载请求列表失败')
  } finally {
    loadingSent.value = false
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待处理'
    case 1:
      return '已同意'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

const getStatusVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 0:
      return 'secondary'
    case 1:
      return 'default'
    case 2:
      return 'destructive'
    default:
      return 'outline'
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

defineExpose({ loadSentRequests })
</script>
