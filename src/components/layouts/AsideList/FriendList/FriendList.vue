<template>
  <friend-list-item
    v-for="(friend, index) in friendStore.friends"
    :key="index"
    :friend="friend"
    @click="chooseFriend(index)"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import FriendListItem from '../FriendList/FriendListItem.vue'
import useFriendStore from '@/stores/friendStore'

const friendStore = useFriendStore()

const chooseFriend = (index: number) => {
  const friend = friendStore.friends[index]
  if (!friend) {
    return
  }
  friendStore.activateFriend(index)
}

onMounted(() => {
  friendStore.loadFriend()
})
</script>

<style scoped></style>
