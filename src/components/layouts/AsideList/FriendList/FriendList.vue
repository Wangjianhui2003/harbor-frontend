<template>
  <friend-list-item
    v-for="(friend, index) in props.friends"
    :key="index"
    :friend="friend"
    @click="chooseFriend(index)"
  />
</template>

<script setup lang="ts">
import type { Friend } from '@/types'
import FriendListItem from '../FriendList/FriendListItem.vue'
import useFriendStore from '@/stores/friendStore'

const props = defineProps<{
  friends: Friend[]
}>()

const chooseFriend = (index: number) => {
  const friend = props.friends[index]
  if (!friend) {
    return
  }
  useFriendStore().activateFriend(index)
}
</script>

<style scoped></style>
