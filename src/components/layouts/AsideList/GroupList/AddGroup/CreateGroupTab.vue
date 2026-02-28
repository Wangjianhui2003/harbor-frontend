<template>
  <div class="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
    <div class="flex min-h-0 flex-col rounded-xl border bg-card p-4">
      <div class="mb-4">
        <h3 class="text-base font-semibold">信息</h3>
      </div>

      <Form
        :initial-values="initialValues"
        :validation-schema="formSchema"
        :validate-on-blur="false"
        :validate-on-change="false"
        :validate-on-input="false"
        :validate-on-model-update="false"
        class="flex min-h-0 flex-1 flex-col gap-4"
        @submit="onFormSubmit"
        @invalid-submit="onInvalidSubmit"
        v-slot="{ resetForm }"
      >
        <FormField name="name" v-slot="{ componentField }">
          <FormItem>
            <div class="flex items-center justify-between gap-3">
              <FormLabel>群名称</FormLabel>
              <FormMessage class="text-[10px] leading-tight" />
            </div>
            <FormControl>
              <Input maxlength="20" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="joinType" v-slot="{ componentField }">
          <FormItem>
            <div class="flex items-center justify-between gap-3">
              <FormLabel>加入方式</FormLabel>
              <FormMessage class="text-[10px] leading-tight" />
            </div>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择加入方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">允许直接加入</SelectItem>
                  <SelectItem value="1">需要管理员同意</SelectItem>
                  <SelectItem value="2">禁止主动加入</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField name="notice" v-slot="{ componentField }">
          <FormItem class="flex min-h-0 flex-1 flex-col">
            <div class="flex items-center justify-between gap-3">
              <FormLabel>群公告</FormLabel>
              <FormMessage class="text-[10px] leading-tight" />
            </div>
            <FormControl>
              <Textarea
                placeholder="创建后发布"
                class="min-h-28 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                maxlength="1024"
                v-bind="componentField"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <div class="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          <div class="flex items-center justify-between gap-3">
            <span>已选好友 {{ selectedFriendIds.length }} 人</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            :disabled="submitting"
            @click="handleReset(resetForm)"
          >
            重置
          </Button>
          <Button type="submit" :disabled="submitting">
            <LoaderCircle v-if="submitting" class="mr-2 size-4 animate-spin" />
            {{ submitting ? '创建中...' : '创建群聊' }}
          </Button>
        </div>
      </Form>
    </div>

    <div class="flex min-h-0 flex-col rounded-xl border bg-card p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold">邀请好友</h3>
          <p class="text-sm text-muted-foreground">可选。创建后会立即邀请这些好友进入群聊。</p>
        </div>
        <Badge variant="secondary">{{ selectedFriendIds.length }}</Badge>
      </div>

      <Input v-model="friendKeyword" class="mt-4" placeholder="搜索好友昵称、备注或 ID" />

      <div v-if="selectedFriends.length > 0" class="mt-4 flex flex-wrap gap-2">
        <Button
          v-for="friend in selectedFriends"
          :key="friend.id"
          type="button"
          size="sm"
          variant="secondary"
          class="h-auto rounded-full px-3 py-1"
          @click="toggleFriend(friend.id)"
        >
          {{ getFriendDisplayName(friend) }}
          <X class="ml-1 size-3.5" />
        </Button>
      </div>

      <ScrollArea class="mt-4 min-h-0 flex-1">
        <div
          v-if="filteredFriends.length === 0"
          class="rounded-lg border border-dashed p-6 text-center"
        >
          <p class="text-sm text-muted-foreground">
            {{ availableFriends.length === 0 ? '暂无可邀请好友' : '没有匹配的好友' }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{
              availableFriends.length === 0
                ? '你也可以先创建群聊，之后再邀请成员。'
                : '试试别的关键词。'
            }}
          </p>
        </div>

        <div v-else class="space-y-2 pr-3">
          <button
            v-for="friend in filteredFriends"
            :key="friend.id"
            type="button"
            :class="[
              'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
              isFriendSelected(friend.id) ? 'border-primary bg-primary/5' : 'hover:bg-accent/60',
            ]"
            @click="toggleFriend(friend.id)"
          >
            <BaseAvatar
              :headImage="friend.headImageThumb || friend.headImage"
              :name="getFriendDisplayName(friend)"
              :size="2.75"
            />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">
                {{ getFriendDisplayName(friend) }}
              </div>
              <div class="truncate text-xs text-muted-foreground">ID: {{ friend.id }}</div>
            </div>
            <Badge :variant="isFriendSelected(friend.id) ? 'default' : 'outline'">
              {{ isFriendSelected(friend.id) ? '已选择' : friend.online ? '在线' : '离线' }}
            </Badge>
          </button>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { createGroup } from '@/api/group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useFriendStore from '@/stores/friendStore'
import type { Friend } from '@/types'
import { showError, showSuccess } from '@/utils/message'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { LoaderCircle, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { z } from 'zod'
import useGroupStore from '@/stores/groupStore'

const emit = defineEmits<{
  (e: 'created'): void
}>()

const toast = useToast()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const { friends } = storeToRefs(friendStore)

const submitting = ref(false)
const friendKeyword = ref('')
const selectedFriendIds = ref<string[]>([])

const createGroupSchema = z.object({
  name: z.string().trim().min(1, '输入群名称').max(20, '群名称最多 20 个字符'),
  joinType: z.enum(['0', '1', '2']),
  notice: z.string().max(1024, '群公告最多 1024 个字符').optional(),
})

type CreateGroupFormValues = z.infer<typeof createGroupSchema>

const formSchema = toTypedSchema(createGroupSchema)

const initialValues: CreateGroupFormValues = {
  name: '',
  joinType: '1',
  notice: '',
}

const availableFriends = computed(() => friends.value.filter((friend) => !friend.deleted))

const filteredFriends = computed(() => {
  const keyword = friendKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return availableFriends.value
  }

  return availableFriends.value.filter((friend) =>
    [friend.id, friend.remark, friend.friendNickname].some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(keyword),
    ),
  )
})

const selectedFriends = computed(() =>
  selectedFriendIds.value
    .map((friendId) => availableFriends.value.find((friend) => friend.id === friendId))
    .filter((friend): friend is Friend => Boolean(friend)),
)

const getFriendDisplayName = (friend: Friend) => friend.remark || friend.friendNickname

const isFriendSelected = (friendId: string) => selectedFriendIds.value.includes(friendId)

const toggleFriend = (friendId: string) => {
  selectedFriendIds.value = isFriendSelected(friendId)
    ? selectedFriendIds.value.filter((id) => id !== friendId)
    : [...selectedFriendIds.value, friendId]
}

const resetSelection = () => {
  selectedFriendIds.value = []
  friendKeyword.value = ''
}

const onInvalidSubmit = () => {
  showError(toast, '错误', '请先完善群聊信息')
}

const handleReset = (resetForm: (state?: { values?: Partial<CreateGroupFormValues> }) => void) => {
  resetForm({ values: initialValues })
  resetSelection()
}

const onFormSubmit = async (
  values: GenericObject,
  { resetForm }: { resetForm: (state?: { values?: Partial<CreateGroupFormValues> }) => void },
) => {
  const formValues = values as CreateGroupFormValues

  if (submitting.value) {
    return
  }

  submitting.value = true
  try {
    const submittedName = formValues.name.trim()

    const group = await createGroup({
      name: submittedName,
      notice: formValues.notice?.trim() || undefined,
      joinType: Number(formValues.joinType),
      friendIds: selectedFriendIds.value,
    })

    const normalizedGroup = {
      ...group,
      name: group.name || submittedName,
      showGroupName: group.showGroupName || group.name || submittedName,
    }

    if (groupStore.findGroup(normalizedGroup.id)) {
      groupStore.updateGroup(normalizedGroup)
    } else {
      groupStore.addGroup(normalizedGroup)
    }

    showSuccess(
      toast,
      '成功',
      selectedFriendIds.value.length > 0 ? '群聊已创建并邀请所选好友' : '群聊已创建',
    )

    handleReset(resetForm)
    emit('created')
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '创建群聊失败')
  } finally {
    submitting.value = false
  }
}
</script>
