<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <div
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <!-- 头像和在线状态 -->
        <div class="relative">
          <BaseAvatar :headImage="member.headImage" :name="displayName" :size="2.5" />
          <!-- 在线状态指示器 -->
          <span
            v-if="member.online"
            class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"
          />
        </div>

        <!-- 昵称和角色 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="truncate text-sm font-medium">{{ displayName }}</span>
            <!-- 角色标签 -->
            <Badge
              v-if="member.role === GroupRole.OWNER"
              variant="default"
              class="text-xs px-1.5 py-0"
            >
              群主
            </Badge>
            <Badge
              v-else-if="member.role === GroupRole.ADMIN"
              variant="secondary"
              class="text-xs px-1.5 py-0"
            >
              管理员
            </Badge>
          </div>
          <!-- 在线状态文字 -->
          <div class="flex items-center gap-1 mt-0.5">
            <Monitor v-if="member.online" class="w-3 h-3 text-green-500" />
            <span :class="['text-xs', member.online ? 'text-green-500' : 'text-muted-foreground']">
              {{ member.online ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>
    </ContextMenuTrigger>

    <!-- 右键菜单内容 -->
    <ContextMenuContent class="w-48">
      <!-- 设为管理员/移除管理员 - 只有群主可见，且不能对群主操作 -->
      <ContextMenuItem v-if="canSetAdmin" @click="handleSetAdmin" :disabled="actionLoading">
        <Shield class="w-4 h-4 mr-2" />
        {{ member.role === GroupRole.ADMIN ? '移除管理员' : '设为管理员' }}
      </ContextMenuItem>

      <!-- 禁言 - 暂不实现 -->
      <ContextMenuItem disabled>
        <VolumeX class="w-4 h-4 mr-2" />
        禁言
      </ContextMenuItem>

      <!-- 移出群聊 - 群主和管理员可见 -->
      <ContextMenuItem
        v-if="canKick"
        @click="handleKick"
        :disabled="actionLoading"
        class="text-destructive focus:text-destructive"
      >
        <UserMinus class="w-4 h-4 mr-2" />
        移出群聊
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Monitor, Shield, VolumeX, UserMinus } from 'lucide-vue-next'
import { setGroupAdmin, kickGroup } from '@/api/group'
import type { GroupMember } from '@/types'
import { showSuccess, showError } from '@/utils/message'
import { useToast } from 'primevue/usetoast'
import useFriendStore from '@/stores/friendStore'

const props = defineProps<{
  member: GroupMember
  groupId: number
  currentUserId: number | undefined
  isCurrentUserOwner: boolean
  isCurrentUserAdmin: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const toast = useToast()
const friendStore = useFriendStore()

// 显示名称优先级：群内备注 > 好友备注 > 好友昵称 > 用户原昵称
const displayName = computed(() => {
  // 1. 群内设置的备注昵称优先
  if (props.member.remarkNickname) {
    return props.member.remarkNickname
  }
  // 2. 好友备注 > 好友昵称
  const friend = friendStore.findFriend(props.member.userId)
  if (friend) {
    return friend.remark || friend.friendNickname
  }
  // 3. 用户原昵称
  return props.member.userNickname
})

// 群成员角色常量
const GroupRole = {
  OWNER: 0,
  ADMIN: 1,
  MEMBER: 2,
} as const

const actionLoading = ref(false)

// 检查是否可以设置/移除管理员（只有群主可以，且不能操作自己和群主）
const canSetAdmin = computed(() => {
  // 只有群主可以设置管理员
  if (!props.isCurrentUserOwner) return false
  // 不能对自己操作
  if (props.member.userId === props.currentUserId) return false
  // 不能对群主操作
  if (props.member.role === GroupRole.OWNER) return false
  return true
})

// 检查是否可以踢人（群主和管理员可以，但管理员不能踢管理员）
const canKick = computed(() => {
  // 不能操作自己
  if (props.member.userId === props.currentUserId) return false
  // 不能踢群主
  if (props.member.role === GroupRole.OWNER) return false
  // 群主可以踢任何人
  if (props.isCurrentUserOwner) return true
  // 管理员只能踢普通成员
  if (props.isCurrentUserAdmin && props.member.role === GroupRole.MEMBER) return true
  return false
})

// 设置/移除管理员
const handleSetAdmin = async () => {
  const isAdmin = props.member.role !== GroupRole.ADMIN
  actionLoading.value = true
  try {
    await setGroupAdmin(props.groupId, props.member.userId, isAdmin)
    showSuccess(toast, isAdmin ? '已设为管理员' : '已移除管理员', displayName.value)
    emit('refresh')
  } catch (error) {
    console.error('设置管理员失败:', error)
    showError(toast, '操作失败', '请稍后重试')
  } finally {
    actionLoading.value = false
  }
}

// 踢出群聊
const handleKick = async () => {
  actionLoading.value = true
  try {
    await kickGroup(props.groupId, props.member.userId)
    showSuccess(toast, '已移出群聊', displayName.value)
    emit('refresh')
  } catch (error) {
    console.error('踢出群聊失败:', error)
    showError(toast, '操作失败', '请稍后重试')
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped></style>
