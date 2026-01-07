<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24">
      <Card class="h-full flex flex-col rounded-xs">
        <CardHeader class="gap-0">
          <div class="flex flex-row gap-2">
            <Input class="flex-1" />
            <Button variant="outline"><Search /></Button>
            <Button variant="outline" @click="showAddFriendDialog = true"><UserRoundPlus /></Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full">
            <FriendList :friends="friendStore.friends" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
    <div class="basis-20/24 h-screen flex flex-col">
      <FriendInfo v-if="friendStore.activeFriendIndex !== null" />
    </div>
    <AddFriendDialog v-model:visible="showAddFriendDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FriendList from '@/components/layouts/AsideList/FriendList/FriendList.vue'
import useFriendStore from '@/stores/friendStore'
import FriendInfo from '@/components/layouts/Window/ChatWindow/FriendInfo/FriendInfo.vue'
import AddFriendDialog from '@/components/layouts/Dialog/AddFriendDialog.vue'
import { UserRoundPlus, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const friendStore = useFriendStore()
const showAddFriendDialog = ref(false)
</script>

<style scoped></style>
