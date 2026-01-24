<template>
  <Sheet v-model:open="isOpen">
    <SheetTrigger><slot /></SheetTrigger>
    <SheetContent class="w-80 sm:w-96 flex flex-col p-0">
      <SheetHeader class="px-4 pt-4 pb-2 border-b">
        <SheetTitle class="flex items-center gap-2">
          群聊成员
          <span class="text-muted-foreground text-sm font-normal">
            {{ sortedMembers.length }}/{{ MAX_MEMBERS }}
          </span>
        </SheetTitle>
        <SheetDescription class="sr-only">群聊成员列表</SheetDescription>
      </SheetHeader>

      <!-- 加载状态 -->
      <div v-if="props.loading" class="flex-1 flex items-center justify-center">
        <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
      </div>

      <!-- 成员列表 -->
      <ScrollArea v-else class="flex-1">
        <div class="p-2 space-y-1">
          <GroupMemberItem
            v-for="member in sortedMembers"
            :key="member.userId"
            :member="member"
            :groupId="props.groupId"
            :currentUserId="currentUserId"
            :isCurrentUserOwner="isCurrentUserOwner"
            :isCurrentUserAdmin="isCurrentUserAdmin"
            @refresh="$emit('refresh')"
          />

          <!-- 空状态 -->
          <div
            v-if="sortedMembers.length === 0"
            class="text-center py-8 text-muted-foreground text-sm"
          >
            无成员
          </div>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-vue-next'
import type { GroupMember } from '@/types'
import useUserStore from '@/stores/userStore'
import GroupMemberItem from './GroupMemberItem.vue'
import { GROUP_ROLE } from '@/utils/enums'

const props = defineProps<{
  groupId: number
  members: GroupMember[]
  loading: boolean
}>()

defineEmits<{
  refresh: []
}>()

const userStore = useUserStore()

// 群成员上限
const MAX_MEMBERS = 500

const isOpen = ref(false)

// 当前用户信息
const currentUserId = computed(() => userStore.userInfo?.id)
const currentUserMember = computed(() =>
  props.members.find((m) => m.userId === currentUserId.value),
)
const isCurrentUserOwner = computed(() => currentUserMember.value?.role === GROUP_ROLE.OWNER)
const isCurrentUserAdmin = computed(() => currentUserMember.value?.role === GROUP_ROLE.ADMIN)

// 排序后的成员列表：群主 > 管理员 > 普通成员，同级别在线优先，普通成员按昵称排序
const sortedMembers = computed(() => {
  return [...props.members]
    .filter((m) => !m.quit)
    .sort((a, b) => {
      // 先按角色排序：群主 > 管理员 > 普通成员
      if (a.role !== b.role) {
        return a.role - b.role
      }

      // 同角色按在线状态排序：在线优先
      if (a.online !== b.online) {
        return a.online ? -1 : 1
      }

      // 同角色同在线状态按昵称排序
      return (a.userNickname || '').localeCompare(b.userNickname || '', 'zh-CN')
    })
})
</script>

<style scoped></style>
