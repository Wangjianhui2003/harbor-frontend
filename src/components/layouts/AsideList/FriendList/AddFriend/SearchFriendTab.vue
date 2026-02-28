<template>
  <div class="flex-1 min-h-0 flex flex-col">
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
              v-if="user.headImage"
              :src="user.headImage"
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
            :disabled="
              isSendingRequest[user.id] ||
              user.addType === 2 ||
              user.id === useUserStore().userInfo.id
            "
            @click="handleSendRequest(user)"
          >
            {{
              user.addType === 2 ? '禁止添加' : isSendingRequest[user.id] ? '发送中...' : '发送请求'
            }}
          </Button>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-vue-next'
import { findUserByName } from '@/api/user.ts'
import { addFriendRequest } from '@/api/add_api.ts'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message.ts'
import type { User } from '@/types'
import useUserStore from '@/stores/userStore.ts'

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void
}>()

const toast = useToast()
const searchKeyword = ref('')
const searchResults = ref<User[]>([])
const searching = ref(false)
const isSendingRequest = ref<Record<number, boolean>>({})

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
      requestUserId: '',
      receiveUserId: user.id,
      requestNote: '',
    })
    showSuccess(toast, '成功', '好友请求已发送')
    emit('switch-tab', 'sent')
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '发送请求失败')
  } finally {
    isSendingRequest.value[user.id] = false
  }
}
</script>
