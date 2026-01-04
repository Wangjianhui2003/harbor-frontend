<template>
  <div>
    <GroupListItem
      v-for="(group, index) in props.groups"
      :key="index"
      :group="group"
      @click="chooseGroup(index)"
    />
  </div>
</template>

<script setup lang="ts">
import useGroupStore from '@/stores/groupStore'
import GroupListItem from '../GroupList/GroupListItem.vue'
import type { Group } from '@/types'

const props = defineProps<{
  groups: Array<Group>
}>()

const groupStore = useGroupStore()

const chooseGroup = (index: number) => {
  const group = props.groups[index]
  if (!group) {
    return
  }
  groupStore.activateGroup(index)
}
</script>

<style scoped></style>
