<template>
  <Card class="h-full rounded-sm p-0">
    <div class="h-full">
      <div class="w-full bg-red-200 h-30 relative">
        <div class="absolute top-10 left-10 p-1 bg-card rounded-full">
          <BaseAvatar
            :headImage="friendUserInfo?.headImage"
            :name="friendUserInfo?.nickname"
            :size="8"
          />
        </div>
      </div>
      <div class="mt-15 m-11 grid gap-3">
        <div class="flex items-center text-3xl">{{ friendUserInfo?.nickname }}</div>
        <div class="flex items-center">@{{ friendUserInfo?.username }}</div>
        <div class="flex gap-x-3">
          <Button class="w-8 h-8 rounded-full cursor-pointer" title="发送信息" @click="sendMessage"
            ><MailPlus
          /></Button>
          <Button
            class="w-8 h-8 rounded-full cursor-pointer"
            title="移除好友 "
            @click="removeFriend"
            ><UserMinus
          /></Button>
          <Button class="w-8 h-8 rounded-full cursor-pointer" title="更改备注"><PenLine /></Button>
        </div>
        <div class="flex items-center"><PencilLine />{{ friendUserInfo?.signature }}</div>
        <div class="flex items-center"><Mail /> {{ friendUserInfo?.email }}</div>
        <div class="flex items-center"><Phone />{{ friendUserInfo?.phoneNumber }}</div>
        <div class="flex items-center">
          <Mars v-if="friendUserInfo?.sex === 0" />
          <Venus v-else />
        </div>
        <!-- <div class="flex items-center">是否被封禁: {{ friendUserInfo?.isBanned }}</div>
        <div class="flex items-center">类型: {{ friendUserInfo?.type }}</div> -->
        <div class="flex items-center"><Clock /> {{ friendUserInfo?.lastLoginTime }}</div>
        <div class="flex items-center"><MapPin />{{ friendUserInfo?.region }}</div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { Card } from '@/components/ui/card'
import useFriendStore from '@/stores/friendStore'

import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { getUserInfo } from '@/api/user'
import type { Friend, User } from '@/types'
import { storeToRefs } from 'pinia'
import {
  Mail,
  Phone,
  PencilLine,
  Mars,
  Venus,
  Clock,
  MapPin,
  MailPlus,
  UserMinus,
  PenLine,
} from 'lucide-vue-next'
import useChatStore from '@/stores/chatStore'
import type { ChatInfo } from '@/types/chat'
import { CHATINFO_TYPE } from '@/utils/enums'
import { useRouter } from 'vue-router'
import { findFriend, updateFriendNickName } from '@/api/friend'
import { useToast } from 'primevue/usetoast'
import { showError } from '@/utils/message'

const router = useRouter()
const { activeFriendIndex, friends } = storeToRefs(useFriendStore())
const friendStore = useFriendStore()
const chatStore = useChatStore()
const toast = useToast()

const friendUserInfo = ref<User | null>(null)
const friendInfo = ref<Friend | null>(null)

watch(
  activeFriendIndex,
  async (newIndex) => {
    if (newIndex === null) return
    const friend = friends.value[newIndex as number]
    if (!friend) return
    friendUserInfo.value = await getUserInfo(friend.id)
    friendInfo.value = await findFriend(friend.id)
    friendStore.updateFriend(friendInfo.value)
  },
  { immediate: true },
)

const sendMessage = () => {
  if (!friendUserInfo.value || !friends.value[activeFriendIndex.value as number]) {
    return
  }
  const friend = friends.value[activeFriendIndex.value as number]
  if (!friend) {
    return
  }
  const chatInfo: ChatInfo = {
    targetId: friendUserInfo.value.id,
    showName: friend.friendNickname || friendUserInfo.value.nickname,
    type: CHATINFO_TYPE.PRIVATE,
    headImage: friendUserInfo.value.headImage,
  }
  chatStore.openChat(chatInfo)
  chatStore.activateChat(0)
  router.push({ name: 'Chat' })
}

const removeFriend = () => {
  // Implement remove friend functionality
}

//修改好友备注名
const editFriendNickName = async (friendId: number, newFriendNickName: string) => {
  try {
    const friendData = {
      id: friendId,
      friendNickname: newFriendNickName,
    } as Friend
    await updateFriendNickName(friendData)
    friendStore.updateFriendNickName(friendData.id, friendData.friendNickname)
  } catch (err) {
    console.log(err)
    showError(toast, '错误', '更新用户名备注失败')
  }
}
</script>

<style scoped></style>
