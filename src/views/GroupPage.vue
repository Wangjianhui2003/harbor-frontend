<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24">
      <Card class="h-full flex flex-col rounded-xs">
        <CardHeader class="gap-0">
          <div class="flex flex-row gap-2">
            <Input class="flex-1 bg-background" />
            <Button class="w-9" variant="ghost"><Search /></Button>
            <Button class="w-9" variant="ghost" @click="showAddGroupDialog = true"
              ><UserRoundPlus
            /></Button>
          </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full"><GroupList :groups="groupStore.groups" /></ScrollArea>
        </CardContent>
      </Card>
    </div>
    <div class="basis-20/24"><GroupInfo v-if="groupStore.activeGroupIndex !== null" /></div>
    <AddGroupDialog v-model:visible="showAddGroupDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroupList from '@/components/layouts/AsideList/GroupList/GroupList.vue'
import GroupInfo from '@/components/layouts/Window/GroupInfo/GroupInfo.vue'
import AddGroupDialog from '@/components/layouts/Dialog/AddGroupDialog.vue'
import useGroupStore from '@/stores/groupStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserRoundPlus, Search } from 'lucide-vue-next'

const groupStore = useGroupStore()
const showAddGroupDialog = ref(false)
</script>

<style scoped></style>
