<template>
  <Card class="h-full rounded-sm p-0">
    <div class="flex h-full flex-col">
      <div
        class="relative h-36 overflow-hidden rounded-t-sm bg-[linear-gradient(135deg,rgba(14,116,144,0.16),rgba(250,204,21,0.16),rgba(249,115,22,0.12))]"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_42%)]" />
        <div class="absolute left-10 top-12 rounded-full bg-background/95 p-1 shadow-sm">
          <BaseAvatar
            :headImage="groupInfo?.headImage || groupInfo?.headImageThumb"
            :name="displayGroupName"
            :size="8"
          />
        </div>
      </div>

      <div class="mt-16 flex-1 overflow-y-auto px-11 pb-11">
        <div class="grid gap-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="text-3xl font-semibold tracking-tight">{{ displayGroupName }}</div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>GID: {{ groupInfo?.id || '未知' }}</span>
                <span v-if="groupInfo?.showNickname">我的群昵称: {{ groupInfo.showNickname }}</span>
                <span v-if="groupInfo?.remarkGroupName">
                  群备注: {{ groupInfo.remarkGroupName }}
                </span>
              </div>
            </div>

            <div class="flex gap-x-3">
              <Button class="h-8 w-8 rounded-full cursor-pointer" title="发送信息" @click="sendMessage">
                <MailPlus />
              </Button>
              <Button
                v-if="groupInfo && !isOwner"
                class="h-8 w-8 rounded-full cursor-pointer"
                title="退出群聊"
                @click="openQuitDialog"
              >
                <LogOut />
              </Button>
              <Button
                v-if="groupInfo"
                class="h-8 w-8 rounded-full cursor-pointer"
                :title="canManageGroup ? '修改群信息' : '修改显示信息'"
                @click="openEditGroupDialog"
              >
                <PenLine />
              </Button>
              <Button
                v-if="groupInfo && isOwner"
                class="h-8 w-8 rounded-full cursor-pointer"
                title="解散群聊"
                @click="openDissolveDialog"
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-2xl border bg-muted/20 p-4">
              <div class="mb-3 text-sm font-medium">群资料</div>
              <div class="grid gap-3 text-sm">
                <div class="flex items-start gap-2">
                  <PencilLine class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span class="leading-6 text-foreground/85">
                    {{ groupInfo?.notice || '暂无群公告' }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <Shield class="size-4 text-muted-foreground" />
                  <span>{{ joinTypeLabel }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Clock class="size-4 text-muted-foreground" />
                  <span>创建时间: {{ groupInfo ? formatTime(groupInfo.createdTime) : '未知' }}</span>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border bg-muted/20 p-4">
              <div class="mb-3 text-sm font-medium">成员信息</div>
              <div class="grid gap-3 text-sm">
                <div class="flex items-center gap-2">
                  <Users class="size-4 text-muted-foreground" />
                  <span>成员数: {{ memberCount }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Crown class="size-4 text-muted-foreground" />
                  <span>群主: {{ ownerInfo?.nickname || '未知' }}</span>
                </div>
                <div v-if="isOwner || isAdmin" class="flex items-center gap-2">
                  <Badge :variant="isOwner ? 'default' : 'secondary'">
                    {{ isOwner ? '你是群主' : '你是管理员' }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuitGroupDialog
        v-if="groupInfo"
        v-model:visible="quitGroupVisible"
        :group-id="groupInfo.id"
        :group-name="displayGroupName"
        @quit="handleQuit"
      />
      <DissolveGroupDialog
        v-if="groupInfo && isOwner"
        v-model:visible="dissolveGroupVisible"
        :group-id="groupInfo.id"
        :group-name="displayGroupName"
        @dissolved="handleDissolved"
      />
      <EditGroupDialog
        v-if="groupInfo"
        v-model:visible="editGroupVisible"
        :group="groupInfo"
        :can-manage-basic-info="canManageGroup"
        @updated="handleGroupUpdated"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { getManagedGroupIds, findGroup, findGroupMembers } from '@/api/group'
import { getSelfInfo, getUserInfo } from '@/api/user'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import useChatStore from '@/stores/chatStore'
import useGroupStore from '@/stores/groupStore'
import type { Group, GroupMember, User } from '@/types'
import type { ChatInfo } from '@/types/chat'
import { CHATINFO_TYPE } from '@/utils/enums'
import {
  Clock,
  Crown,
  LogOut,
  MailPlus,
  PenLine,
  PencilLine,
  Shield,
  Trash2,
  Users,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DissolveGroupDialog from './DissolveGroupDialog.vue'
import EditGroupDialog from './EditGroupDialog.vue'
import QuitGroupDialog from './QuitGroupDialog.vue'

const router = useRouter()
const groupStore = useGroupStore()
const chatStore = useChatStore()
const { activeGroupIndex, groups } = storeToRefs(groupStore)

const groupInfo = ref<Group | null>(null)
const groupMembers = ref<GroupMember[]>([])
const ownerInfo = ref<User | null>(null)
const currentUser = ref<User | null>(null)
const managedGroupIds = ref<Set<string>>(new Set())
const quitGroupVisible = ref(false)
const dissolveGroupVisible = ref(false)
const editGroupVisible = ref(false)
const loadToken = ref(0)

const displayGroupName = computed(() => {
  return groupInfo.value?.showGroupName || groupInfo.value?.name || '未知群聊'
})

const memberCount = computed(() => groupMembers.value.filter((member) => !member.quit).length)

const joinTypeLabel = computed(() => {
  switch (groupInfo.value?.joinType) {
    case 0:
      return '允许直接加入'
    case 1:
      return '需要管理员同意'
    case 2:
      return '禁止主动加入'
    default:
      return '加入方式未设置'
  }
})

const isOwner = computed(() => {
  if (!groupInfo.value || !currentUser.value?.id) return false
  return String(groupInfo.value.ownerId) === String(currentUser.value.id)
})

const canManageGroup = computed(() => {
  if (!groupInfo.value) return false
  const groupId = String(groupInfo.value.id)
  return isOwner.value || managedGroupIds.value.has(groupId)
})

const isAdmin = computed(() => canManageGroup.value && !isOwner.value)

const loadCurrentContext = async () => {
  try {
    const [selfInfo, managedIds] = await Promise.all([
      currentUser.value?.id ? Promise.resolve(currentUser.value) : getSelfInfo(),
      getManagedGroupIds(),
    ])
    currentUser.value = selfInfo
    managedGroupIds.value = new Set(managedIds)
  } catch (error) {
    console.error('加载群管理上下文失败', error)
  }
}

const loadGroupInfo = async (groupId: string) => {
  const token = ++loadToken.value
  ownerInfo.value = null
  groupMembers.value = []

  try {
    const [detail, members] = await Promise.all([findGroup(groupId), findGroupMembers(groupId)])
    if (token !== loadToken.value) {
      return
    }

    groupInfo.value = detail
    groupMembers.value = members
    groupStore.updateGroup(detail)

    if (detail.ownerId) {
      const owner = await getUserInfo(detail.ownerId)
      if (token !== loadToken.value) {
        return
      }
      ownerInfo.value = owner
    }
  } catch (error) {
    if (token !== loadToken.value) {
      return
    }
    console.error('加载群信息失败', error)
  }
}

void loadCurrentContext()

watch(
  activeGroupIndex,
  async (newIndex) => {
    if (newIndex === null) {
      groupInfo.value = null
      groupMembers.value = []
      ownerInfo.value = null
      return
    }

    const group = groups.value[newIndex]
    if (!group) {
      return
    }

    await loadGroupInfo(group.id)
  },
  { immediate: true },
)

const sendMessage = () => {
  if (!groupInfo.value || activeGroupIndex.value === null) {
    return
  }

  if (!groups.value[activeGroupIndex.value]) {
    return
  }

  const chatInfo: ChatInfo = {
    targetId: groupInfo.value.id,
    showName: displayGroupName.value,
    type: CHATINFO_TYPE.GROUP,
    headImage: groupInfo.value.headImage || groupInfo.value.headImageThumb,
  }

  chatStore.openChat(chatInfo)
  chatStore.activateChat(0)
  router.push({ name: 'Chat' })
}

const openQuitDialog = () => {
  if (!groupInfo.value) return
  quitGroupVisible.value = true
}

const handleQuit = (groupId: string) => {
  groupStore.removeGroup(groupId)
  quitGroupVisible.value = false
}

const openDissolveDialog = () => {
  if (!groupInfo.value) return
  dissolveGroupVisible.value = true
}

const handleDissolved = (groupId: string) => {
  groupStore.removeGroup(groupId)
  dissolveGroupVisible.value = false
}

const openEditGroupDialog = () => {
  if (!groupInfo.value) return
  editGroupVisible.value = true
}

const handleGroupUpdated = (updatedGroup: Group) => {
  const normalizedGroup: Group = {
    ...updatedGroup,
    showGroupName: updatedGroup.showGroupName || updatedGroup.remarkGroupName || updatedGroup.name,
  }

  groupInfo.value = normalizedGroup
  groupStore.updateGroup(normalizedGroup)
  editGroupVisible.value = false
}

const formatTime = (time?: string) => {
  if (!time) return '未知'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}
</script>
