<template>
  <div>
    <Item
      :class="['h-16 p-1 hover:bg-primary/10', { 'bg-primary/10 border-primary': isChosen }]"
      variant="outline"
    >
      <ItemContent>
        <div class="rounded-xl flex flex-row items-center h-13 gap-3">
          <div class="relative">
            <img
              v-if="props.group.headImage != ''"
              :src="props.group.headImage"
              class="w-9 h-9 rounded-full object-cover"
            />
            <div v-else class="w-9 h-9 rounded-full bg-gray-200"></div>
          </div>
          <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
            <div>{{ props.group.showGroupName }}</div>
          </div>
        </div>
      </ItemContent>
    </Item>
  </div>
</template>

<script setup lang="ts">
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
