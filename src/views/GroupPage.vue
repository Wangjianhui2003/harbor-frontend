<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24">
      <Card class="h-full flex flex-col">
        <CardHeader class="gap-0">
          <Input />
        </CardHeader>
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full"><GroupList :groups="groupStore.groups" /></ScrollArea>
        </CardContent>
      </Card>
    </div>
    <div class="basis-20/24 h-screen">
      <Card class="h-full flex flex-col"> </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import GroupList from '@/components/layouts/AsideList/GroupList/GroupList.vue'
import useGroupStore from '@/stores/groupStore'

const groupStore = useGroupStore()
</script>

<style scoped></style>
