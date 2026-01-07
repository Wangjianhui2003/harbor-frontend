<template>
  <Card class="h-full rounded-sm p-0">
    <div class="h-full">
      <div class="w-full bg-red-200 h-30 relative">
        <div class="absolute top-10 left-10 p-1 bg-card rounded-full">
          <BaseAvatar
            :headImage="groupInfo?.headImage"
            :name="groupInfo?.showGroupName || groupInfo?.name"
            :size="8"
          />
        </div>
      </div>
      <div class="mt-15 m-11 grid gap-3">
        <div class="flex items-center text-3xl">
          {{ groupInfo?.showGroupName || groupInfo?.name }}
        </div>
        <div class="flex items-center text-muted-foreground">GID: {{ groupInfo?.id }}</div>
        <div class="flex gap-x-3">
          <Button class="w-8 h-8 rounded-full cursor-pointer" title="发送信息" @click="sendMessage">
            <MailPlus />
          </Button>
          <Button
            v-if="!isOwner"
            class="w-8 h-8 rounded-full cursor-pointer"
            title="退出群聊"
            @click="openQuitDialog"
          >
            <LogOut />
          </Button>
          <Button
            v-if="isOwner || isAdmin"
            class="w-8 h-8 rounded-full cursor-pointer"
            title="修改群信息"
            @click="openEditGroupDialog"
          >
            <PenLine />
          </Button>
          <Button
            v-if="isOwner"
            class="w-8 h-8 rounded-full cursor-pointer"
            title="解散群聊"
            @click="openDissolveDialog"
          >
            <Trash2 />
          </Button>
        </div>
        <div v-if="groupInfo?.notice" class="flex items-center">
          <PencilLine /> {{ groupInfo.notice }}
        </div>
        <div class="flex items-center"><Users /> 成员数: {{ groupMembers.length }}</div>
        <div class="flex items-center">
          <Crown v-if="ownerInfo" /> 群主: {{ ownerInfo?.nickname || '未知' }}
        </div>
        <div class="flex items-center">
          <Clock /> 创建时间: {{ groupInfo ? formatTime((groupInfo as any).createdTime) : '未知' }}
        </div>
        <div
          v-if="groupInfo && groupInfo.joinType !== null && groupInfo.joinType !== undefined"
          class="flex items-center"
        >
          <Shield />
          {{ groupInfo.joinType === 0 ? '直接加入' : '需要管理员同意' }}
        </div>
      </div>
      <QuitGroupDialog
        v-if="groupInfo"
        v-model:visible="quitGroupVisible"
        :group-id="groupInfo.id"
        :group-name="groupInfo.showGroupName || groupInfo.name"
        @quit="handleQuit"
      />
      <DissolveGroupDialog
        v-if="groupInfo && isOwner"
        v-model:visible="dissolveGroupVisible"
        :group-id="groupInfo.id"
        :group-name="groupInfo.showGroupName || groupInfo.name"
        @dissolved="handleDissolved"
      />
      <EditGroupDialog
        v-if="groupInfo && (isOwner || isAdmin)"
        v-model:visible="editGroupVisible"
        :group="groupInfo"
        @updated="handleGroupUpdated"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useGroupStore from '@/stores/groupStore.ts'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { findGroup, findGroupMembers } from '@/api/group.ts'
import type { Group, GroupMember } from '@/types'
import { storeToRefs } from 'pinia'
import {
  MailPlus,
  LogOut,
  Trash2,
  PenLine,
  PencilLine,
  Users,
  Crown,
  Clock,
  Shield,
} from 'lucide-vue-next'
import useChatStore from '@/stores/chatStore.ts'
import type { ChatInfo } from '@/types/chat.ts'
import { CHATINFO_TYPE } from '@/utils/enums.ts'
import { useRouter } from 'vue-router'
import { getUserInfo, getSelfInfo } from '@/api/user.ts'
import type { User } from '@/types'
import QuitGroupDialog from './QuitGroupDialog.vue'
import DissolveGroupDialog from './DissolveGroupDialog.vue'
import EditGroupDialog from './EditGroupDialog.vue'

const router = useRouter()
const { activeGroupIndex, groups } = storeToRefs(useGroupStore())
const groupStore = useGroupStore()
const chatStore = useChatStore()

const groupInfo = ref<Group | null>(null)
const groupMembers = ref<GroupMember[]>([])
const ownerInfo = ref<User | null>(null)
const currentUser = ref<User | null>(null)
const quitGroupVisible = ref(false)
const dissolveGroupVisible = ref(false)
const editGroupVisible = ref(false)

// 加载当前用户信息
const loadCurrentUser = async () => {
  try {
    currentUser.value = await getSelfInfo()
  } catch (err) {
    console.error('获取当前用户信息失败', err)
  }
}

// 初始化时加载当前用户信息
loadCurrentUser()

// 判断是否是群主
const isOwner = computed(() => {
  if (!groupInfo.value || !currentUser.value) return false
  return groupInfo.value.ownerId === currentUser.value.id
})

// 判断是否是管理员（需要根据实际的角色字段判断，这里暂时返回false）
const isAdmin = computed(() => {
  if (!groupInfo.value || !groupMembers.value.length || !currentUser.value) return false
  // 可以通过 groupMembers 中的 role 字段来判断
  // 这里需要根据实际的 GroupMember 结构来判断
  return false
})

watch(
  activeGroupIndex,
  async (newIndex) => {
    if (newIndex === null) return
    const group = groups.value[newIndex as number]
    if (!group) return
    groupInfo.value = await findGroup(group.id)
    groupStore.updateGroup(groupInfo.value)

    // 加载群成员
    try {
      const members = await findGroupMembers(group.id)
      groupMembers.value = members

      // 获取群主信息
      if (groupInfo.value.ownerId) {
        ownerInfo.value = await getUserInfo(groupInfo.value.ownerId)
      }
    } catch (err) {
      console.error('加载群成员失败', err)
    }
  },
  { immediate: true },
)

const sendMessage = () => {
  if (!groupInfo.value || !groups.value[activeGroupIndex.value as number]) {
    return
  }
  const group = groups.value[activeGroupIndex.value as number]
  if (!group) {
    return
  }
  const chatInfo: ChatInfo = {
    targetId: groupInfo.value.id,
    showName: groupInfo.value.showGroupName || groupInfo.value.name,
    type: CHATINFO_TYPE.GROUP,
    headImage: groupInfo.value.headImage,
  }
  chatStore.openChat(chatInfo)
  chatStore.activateChat(0)
  router.push({ name: 'Chat' })
}

const openQuitDialog = () => {
  if (!groupInfo.value) return
  quitGroupVisible.value = true
}

const handleQuit = (groupId: number) => {
  groupStore.removeGroup(groupId)
  quitGroupVisible.value = false
}

const openDissolveDialog = () => {
  if (!groupInfo.value) return
  dissolveGroupVisible.value = true
}

const handleDissolved = (groupId: number) => {
  groupStore.removeGroup(groupId)
  dissolveGroupVisible.value = false
}

const openEditGroupDialog = () => {
  if (!groupInfo.value) return
  editGroupVisible.value = true
}

const handleGroupUpdated = (updatedGroup: Group) => {
  groupInfo.value = updatedGroup
  groupStore.updateGroup(updatedGroup)
  editGroupVisible.value = false
}

const formatTime = (time?: string) => {
  if (!time) return '未知'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped></style>
