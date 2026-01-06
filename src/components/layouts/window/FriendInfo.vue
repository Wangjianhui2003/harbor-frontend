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
      <div class="mt-14 m-11 grid gap-3">
        <div class="flex items-center text-3xl">{{ friendUserInfo?.nickname }}</div>
        <div class="flex items-center">@{{ friendUserInfo?.username }}</div>
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
import type { User } from '@/types'
import { storeToRefs } from 'pinia'
import { Mail, Phone, PencilLine, Mars, Venus, Clock, MapPin } from 'lucide-vue-next'

const { activeFriendIndex, friends } = storeToRefs(useFriendStore())

const friendUserInfo = ref<User | null>(null)

watch(
  activeFriendIndex,
  async (newIndex) => {
    if (newIndex === null) return
    const friend = friends.value[newIndex as number]
    if (!friend) return
    friendUserInfo.value = await getUserInfo(friend.id)
  },
  { immediate: true },
)
</script>

<style scoped></style>
