<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="h-180 flex flex-col">
      <DialogHeader>
        <DialogTitle>加入群聊</DialogTitle>
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
        <!-- 查找群组 -->
        <div v-if="activeTab === 'search'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex gap-2 mb-4">
            <Input v-model="searchGroupId" placeholder="输入群组ID" @keyup.enter="handleSearch" />
            <Button @click="handleSearch" :disabled="searching">
              <Search class="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div v-if="searching" class="text-center py-8 text-muted-foreground">搜索中...</div>
            <div v-else-if="searchedGroup && !searching" class="space-y-2">
              <div class="p-3 rounded-lg border">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0"
                  >
                    <img
                      v-if="searchedGroup.headImageThumb || searchedGroup.headImage"
                      :src="searchedGroup.headImageThumb || searchedGroup.headImage"
                      :alt="searchedGroup.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-sm font-medium">{{
                      searchedGroup.name?.[0] || 'G'
                    }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">{{ searchedGroup.name }}</div>
                    <div class="text-sm text-muted-foreground">群ID: {{ searchedGroup.id }}</div>
                    <div v-if="searchedGroup.notice" class="text-sm text-muted-foreground mt-1">
                      {{ searchedGroup.notice }}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    :disabled="isSendingRequest"
                    @click="handleSendRequest(searchedGroup)"
                  >
                    {{ isSendingRequest ? '发送中...' : '发送请求' }}
                  </Button>
                </div>
              </div>
            </div>
            <div
              v-else-if="searchGroupId && !searchedGroup && !searching"
              class="text-center py-8 text-muted-foreground"
            >
              未找到群组
            </div>
            <div v-else-if="!searchGroupId" class="text-center py-8 text-muted-foreground">
              请输入群组ID进行搜索
            </div>
          </ScrollArea>
        </div>

        <!-- 我发送的请求 -->
        <div v-if="activeTab === 'sent'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-muted-foreground">我发送的群组请求</span>
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
                  <div class="flex-1 min-w-0">
                    <div class="font-medium">群组ID: {{ request.groupId }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ request.requestNote || '' }}
                    </div>
                    <div class="text-xs text-muted-foreground mt-1">
                      {{ formatTime(request.createdTime) }}
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

        <!-- 群组请求列表（自动加载管理的群组） -->
        <div v-if="activeTab === 'group'" class="flex-1 min-h-0 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-muted-foreground">加群申请</span>
            <Button variant="outline" size="sm" @click="loadGroupRequests" :disabled="loadingGroup">
              <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingGroup }" />
              刷新
            </Button>
          </div>

          <ScrollArea class="flex-1 min-h-0">
            <div v-if="loadingGroup" class="text-center py-8 text-muted-foreground">加载中...</div>
            <div
              v-else-if="managedGroupIds.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              您不是任何群组的群主或管理员
            </div>
            <div
              v-else-if="groupRequests.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              暂无加群请求
            </div>
            <div v-else class="space-y-2">
              <div v-for="request in groupRequests" :key="request.id" class="p-3 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="font-medium">用户ID: {{ request.requestUserId }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ request.requestNote || '无留言' }}
                    </div>
                    <div class="text-xs text-muted-foreground mt-1">
                      {{ formatTime(request.createdTime) }}
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
import { searchGroup, getManagedGroupIds, type GroupResult } from '@/api/group'
import {
  addGroupRequest,
  getSentGroupRequests,
  findRequestsByGroupIds,
  dealAddGroupRequest,
  type AddGroupRequestRecord,
  type DealAddGroupReq,
} from '@/api/add_api'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const toast = useToast()
const tabs = [
  { label: '查找群组', value: 'search' },
  { label: '我发送的', value: 'sent' },
  { label: '群组请求', value: 'group' },
]
const activeTab = ref('search')
const searchGroupId = ref<number>()
const searchedGroup = ref<GroupResult | null>(null)
const searching = ref(false)
const isSendingRequest = ref(false)
const sentRequests = ref<AddGroupRequestRecord[]>([])
const groupRequests = ref<AddGroupRequestRecord[]>([])
const loadingSent = ref(false)
const loadingGroup = ref(false)
const managedGroupIds = ref<number[]>([])
const isProcessing = ref<Record<number, boolean>>({})

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

// 搜索群组
const handleSearch = async () => {
  if (!searchGroupId.value) {
    showError(toast, '提示', '请输入群组ID')
    return
  }

  const groupId = Number(searchGroupId.value)
  if (isNaN(groupId) || groupId <= 0) {
    showError(toast, '提示', '请输入有效的群组ID')
    return
  }

  searching.value = true
  searchedGroup.value = null
  try {
    const group = await searchGroup(groupId)
    searchedGroup.value = group
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '搜索群组失败')
    searchedGroup.value = null
  } finally {
    searching.value = false
  }
}

// 发送群组请求
const handleSendRequest = async (group: GroupResult) => {
  if (isSendingRequest.value) return

  isSendingRequest.value = true
  try {
    await addGroupRequest({
      groupId: group.id,
      requestUserId: 0, // 后端会自动设置
      requestNote: '',
    })
    showSuccess(toast, '成功', '群组请求已发送')
    // 切换到发送的请求标签页
    activeTab.value = 'sent'
    await loadSentRequests()
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '发送请求失败')
  } finally {
    isSendingRequest.value = false
  }
}

// 加载我发送的请求
const loadSentRequests = async () => {
  loadingSent.value = true
  try {
    const requests = await getSentGroupRequests()
    sentRequests.value = requests
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '加载请求列表失败')
  } finally {
    loadingSent.value = false
  }
}

// 加载群组请求（自动加载管理的群组）
const loadGroupRequests = async () => {
  loadingGroup.value = true
  try {
    // 先获取当前用户管理的群组ID列表
    const groupIds = await getManagedGroupIds()
    managedGroupIds.value = groupIds

    if (groupIds.length === 0) {
      groupRequests.value = []
      return
    }

    // 根据群组ID列表获取加群申请
    const requests = await findRequestsByGroupIds(groupIds)
    groupRequests.value = requests
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '加载请求列表失败')
    groupRequests.value = []
    managedGroupIds.value = []
  } finally {
    loadingGroup.value = false
  }
}

// 处理请求（同意/拒绝）
const handleDealRequest = async (request: AddGroupRequestRecord, status: number) => {
  if (isProcessing.value[request.id]) return

  isProcessing.value[request.id] = true
  try {
    const dealReq: DealAddGroupReq = {
      id: request.id,
      groupId: request.groupId,
      requestUserId: request.requestUserId,
      dealUserId: 0, // 后端会自动设置
      status,
      comment: status === 1 ? '已同意' : '已拒绝',
    }
    await dealAddGroupRequest(dealReq)
    showSuccess(toast, '成功', status === 1 ? '已同意群组请求' : '已拒绝群组请求')
    await loadGroupRequests()
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
  } else if (newTab === 'group') {
    loadGroupRequests()
  }
})

// 监听对话框打开
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && activeTab.value === 'sent') {
      loadSentRequests()
    }
  },
)
</script>

<style scoped></style>
