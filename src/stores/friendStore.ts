import { computed, ref } from 'vue'
import { getFriendList } from '@/api/friend'
import { getUserOnlineStatus } from '@/api/user'
import { TERMINAL_TYPE } from '@/utils/enums'
import type { Friend, OnlineTerminal } from '@/types/index.js'
import { showError } from '@/utils/message'
import { defineStore } from 'pinia'

const useFriendStore = defineStore('friendStore', () => {
  const friends = ref<Friend[]>([])
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)

  const loadFriend = async (): Promise<void> => {
    try {
      const fetched = await getFriendList()
      setFriends(fetched)
      refreshOnlineStatus()
    } catch (error) {
      console.error('加载好友列表失败', error)
      showError('异常', '加载好友列表失败')
      throw error
    }
  }

  const setFriends = (friendList: Friend[]): void => {
    friendList.forEach((f) => {
      f.online = false
      f.onlineWeb = false
      f.onlineApp = false
    })
    friends.value = friendList
  }

  const updateFriend = (friend: Friend): void => {
    friends.value.forEach((f, index) => {
      if (f.id == friend.id) {
        const online = friends.value[index]?.online
        Object.assign(friends.value[index]!, friend)
        friends.value[index]!.online = online ?? false
      }
    })
  }

  const removeFriend = (id: number): void => {
    friends.value.filter((f) => f.id == id).forEach((f) => (f.deleted = true))
  }

  const addFriend = (friend: Friend): void => {
    if (friends.value.some((f) => f.id == friend.id)) {
      updateFriend(friend)
    } else {
      friends.value.unshift(friend)
    }
  }

  const refreshOnlineStatus = (): void => {
    const userIds = friends.value.filter((f) => !f.deleted).map((f) => f.id)
    if (userIds.length === 0) return

    getUserOnlineStatus(userIds).then((onlineTerminals) => {
      setOnlineStatus(onlineTerminals)
    })

    if (timer.value) clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      refreshOnlineStatus()
    }, 1000 * 30)
  }

  const setOnlineStatus = (onlineTerminals: OnlineTerminal[]): void => {
    friends.value.forEach((f) => {
      const userTerminal = onlineTerminals.find((o) => f.id == o.userId)
      if (userTerminal) {
        f.online = true
        f.onlineWeb = userTerminal.terminals.indexOf(TERMINAL_TYPE.WEB) >= 0
        f.onlineApp = userTerminal.terminals.indexOf(TERMINAL_TYPE.APP) >= 0
      } else {
        f.online = false
        f.onlineWeb = false
        f.onlineApp = false
      }
    })

    friends.value.sort((f1, f2) => {
      if (f1.online && !f2.online) return -1
      if (f2.online && !f1.online) return 1
      return 0
    })
  }

  const clear = (): void => {
    if (timer.value) clearTimeout(timer.value)
    friends.value = []
    timer.value = null
  }

  const isFriend = computed(
    () => (userId: number) => friends.value.filter((f) => !f.deleted).some((f) => f.id == userId),
  )

  const findFriend = computed(() => (userId: number) => friends.value.find((f) => f.id == userId))

  return {
    friends,
    timer,
    loadFriend,
    setFriends,
    updateFriend,
    removeFriend,
    addFriend,
    refreshOnlineStatus,
    setOnlineStatus,
    clear,
    isFriend,
    findFriend,
  }
})

export default useFriendStore
