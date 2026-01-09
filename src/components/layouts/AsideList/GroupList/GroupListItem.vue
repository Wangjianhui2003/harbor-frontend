<template>
  <div>
    <Item :class="['h-16 p-1 hover:bg-primary/10 rounded-none', { 'bg-primary/10': isChosen }]">
      <ItemContent>
        <div class="flex flex-row items-center h-13 gap-3">
          <BaseAvatar :headImage="props.group.headImage" :name="props.group.showGroupName" />
          <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
            <div>{{ props.group.showGroupName }}</div>
          </div>
        </div>
      </ItemContent>
    </Item>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import Item from '@/components/ui/item/Item.vue'
import useGroupStore from '@/stores/groupStore'
import type { Group } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  group: Group
}>()

const groupStore = useGroupStore()

const isChosen = computed(() => {
  const index = groupStore.activeGroupIndex
  if (index === null) {
    return false
  }
  return groupStore.groups[index]?.id === props.group.id
})
</script>

<style scoped></style>
