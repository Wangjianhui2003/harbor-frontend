import { defineStore } from 'pinia'
import useUserStore from './userStore'
import useFriendStore from './friendStore'
import useChatStore from './chatStore'
import useGroupStore from './groupStore'
import useWebRTCStore from './webRTCStore'

// Main store to load all data
const useMainStore = defineStore('mainStore', {
  actions: {
    async loadAll() {
      const userStore = useUserStore()
      const friendStore = useFriendStore()
      const chatStore = useChatStore()
      const groupStore = useGroupStore()
      const webRTCStore = useWebRTCStore()

      return userStore.loadUser().then(() => {
        const promises = []
        promises.push(friendStore.loadFriend())
        promises.push(chatStore.loadChats())
        promises.push(groupStore.loadGroups())
        promises.push(webRTCStore.loadConfig())
        return Promise.all(promises)
      })
    },
    clearAll() {},
  },
})

export default useMainStore
