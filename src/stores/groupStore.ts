import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { findGroups } from '../api/group.js'
import type { Group } from '@/types'
import useChatStore from './chatStore'

const useGroupStore = defineStore('groupStore', () => {
  const groups = ref<Group[]>([])
  //选中的群组索引
  const activeGroupIndex = ref<number | null>(null)

  //加载groups
  const loadGroups = async (): Promise<void> => {
    try {
      const fetchedGroups: Group[] = await findGroups()
      setGroups(fetchedGroups)
    } catch (err) {
      console.error('加载群组失败', err)
      throw err
    }
  }

  //设置群聊
  const setGroups = (groupVOs: Group[]): void => {
    groups.value = groupVOs.map((group) => ({
      ...group,
      showGroupName: group.showGroupName || group.name,
    }))
  }

  //添加群聊
  const addGroup = (group: Group): void => {
    groups.value.unshift(group)
  }

  //逻辑移除
  const removeGroup = (id: string): void => {
    groups.value
      .filter((group) => group.id == id)
      .forEach((group) => {
        group.quit = true
      })
  }

  //更新group
  const updateGroup = (group: Group): void => {
    const chatStore = useChatStore()
    const normalizedGroup: Group = {
      ...group,
      showGroupName: group.showGroupName || group.name,
    }

    const g = groups.value.find((item) => item.id === group.id)
    if (g) {
      Object.assign(g, normalizedGroup)
      chatStore.updateChatFromGroup(g)
    }
  }

  const activateGroup = (index: number): void => {
    activeGroupIndex.value = index
  }

  //根据id查找group
  const findGroup = computed(
    () =>
      (id: string): Group | undefined =>
        groups.value.find((g) => g.id == id),
  )

  return {
    groups,
    activeGroupIndex,
    addGroup,
    removeGroup,
    updateGroup,
    loadGroups,
    activateGroup,
    findGroup,
  }
})

export default useGroupStore
