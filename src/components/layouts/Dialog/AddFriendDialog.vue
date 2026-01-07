<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="h-180 flex flex-col">
      <DialogHeader>
        <DialogTitle>添加好友</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col flex-1 min-h-0">
        <!-- 标签切换 -->
        <div class="flex border-b mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 查找用户 -->
        <div v-if="activeTab === 'search'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex gap-2 mb-4">
            <Input
              v-model="searchKeyword"
              placeholder="输入用户名或昵称"
              class="flex-1"
              @keyup.enter="handleSearch"
            />
            <Button @click="handleSearch" :disabled="searching">
              <Search class="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div v-if="searching" class="text-center py-8 text-muted-foreground">搜索中...</div>
            <div
              v-else-if="searchResults.length === 0 && searchKeyword"
              class="text-center py-8 text-muted-foreground"
            >
              未找到用户
            </div>
            <div v-else-if="!searchKeyword" class="text-center py-8 text-muted-foreground">
              请输入用户名或昵称进行搜索
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="user in searchResults"
                :key="user.id"
                class="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div
                  class="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0"
                >
                  <img
                    v-if="user.headImageThumb || user.headImage"
                    :src="user.headImageThumb || user.headImage"
                    :alt="user.nickname"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-sm font-medium">{{ user.nickname?.[0] || 'U' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">{{ user.nickname }}</div>
                  <div class="text-sm text-muted-foreground truncate">@{{ user.username }}</div>
                </div>
                <Button
                  size="sm"
                  :disabled="isSendingRequest[user.id]"
                  @click="handleSendRequest(user)"
                >
                  {{ isSendingRequest[user.id] ? '发送中...' : '发送请求' }}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        <!-- 我发送的请求 -->
        <div v-if="activeTab === 'sent'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-muted-foreground">我发送的好友请求</span>
            <Button variant="outline" size="sm" @click="loadSentRequests" :disabled="loadingSent">
              <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingSent }" />
              刷新
            </Button>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div v-if="loadingSent" class="text-center py-8 text-muted-foreground">加载中...</div>
            <div
              v-else-if="sentRequests.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
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

        <!-- 我接收的请求 -->
        <div v-if="activeTab === 'received'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-muted-foreground">我接收的好友请求</span>
            <Button
              variant="outline"
              size="sm"
              @click="loadReceivedRequests"
              :disabled="loadingReceived"
            >
              <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingReceived }" />
              刷新
            </Button>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div v-if="loadingReceived" class="text-center py-8 text-muted-foreground">
              加载中...
            </div>
            <div
              v-else-if="receivedRequests.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              暂无接收的请求
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="request in receivedRequests"
                :key="request.id"
                class="p-3 rounded-lg border"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium">用户ID: {{ request.requestUserId }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ request.requestNote || '无留言' }}
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
                <div v-if="request.status === 0" class="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    :disabled="isProcessing[request.id]"
                    @click="handleDealRequest(request, 2)"
                  >
                    拒绝
                  </Button>
                  <Button
                    size="sm"
                    :disabled="isProcessing[request.id]"
                    @click="handleDealRequest(request, 1)"
                  >
                    同意
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw } from 'lucide-vue-next'
import { findUserByName } from '@/api/user'
import {
  addFriendRequest,
  getSentFriendRequests,
  getReceivedFriendRequests,
  dealAddFriendRequest,
  type AddUserRequestRecord,
  type DealAddFriendReq,
} from '@/api/add_api'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message'
import type { User } from '@/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const toast = useToast()
const tabs = [
  { label: '查找用户', value: 'search' },
  { label: '已发送', value: 'sent' },
  { label: '好友请求', value: 'received' },
]
const activeTab = ref('search')
const searchKeyword = ref('')
const searchResults = ref<User[]>([])
const searching = ref(false)
const isSendingRequest = ref<Record<number, boolean>>({})
const sentRequests = ref<AddUserRequestRecord[]>([])
const receivedRequests = ref<AddUserRequestRecord[]>([])
const loadingSent = ref(false)
const loadingReceived = ref(false)
const isProcessing = ref<Record<number, boolean>>({})

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

// 搜索用户
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    showError(toast, '提示', '请输入搜索关键词')
    return
  }

  searching.value = true
  try {
    const results = await findUserByName(searchKeyword.value.trim())
    searchResults.value = results
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '搜索用户失败')
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 发送好友请求
const handleSendRequest = async (user: User) => {
  if (isSendingRequest.value[user.id]) return

  isSendingRequest.value[user.id] = true
  try {
    await addFriendRequest({
      requestUserId: 0, // 后端会自动设置
      receiveUserId: user.id,
      requestNote: '',
    })
    showSuccess(toast, '成功', '好友请求已发送')
    // 切换到发送的请求标签页
    activeTab.value = 'sent'
    await loadSentRequests()
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '发送请求失败')
  } finally {
    isSendingRequest.value[user.id] = false
  }
}

// 加载我发送的请求
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

// 加载我接收的请求
const loadReceivedRequests = async () => {
  loadingReceived.value = true
  try {
    const requests = await getReceivedFriendRequests()
    receivedRequests.value = requests
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '加载请求列表失败')
  } finally {
    loadingReceived.value = false
  }
}

// 处理请求（同意/拒绝）
const handleDealRequest = async (request: AddUserRequestRecord, status: number) => {
  if (isProcessing.value[request.id]) return

  isProcessing.value[request.id] = true
  try {
    const dealReq: DealAddFriendReq = {
      id: request.id,
      requestUserId: request.requestUserId,
      receiveUserId: request.receiveUserId,
      status,
      comment: status === 1 ? '已同意' : '已拒绝',
    }
    await dealAddFriendRequest(dealReq)
    showSuccess(toast, '成功', status === 1 ? '已同意好友请求' : '已拒绝好友请求')
    await loadReceivedRequests()
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '处理请求失败')
  } finally {
    isProcessing.value[request.id] = false
  }
}

// 获取状态文本
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

// 获取状态样式
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

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

// 监听标签页切换，自动加载数据
watch(activeTab, (newTab) => {
  if (newTab === 'sent') {
    loadSentRequests()
  } else if (newTab === 'received') {
    loadReceivedRequests()
  }
})

// 监听对话框打开，加载接收的请求
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && activeTab.value === 'received') {
      loadReceivedRequests()
    }
  },
)
</script>

<style scoped></style>
