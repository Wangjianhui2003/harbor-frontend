import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import ChatPage from '@/views/ChatPage.vue'
import ChatList from '@/components/layouts/AsideList/ChatList/ChatList.vue'
import useChatStore from '@/stores/chatStore'
import { CHATINFO_TYPE } from '@/utils/enums'
import type { ChatsData } from '@/types'

describe('ChatPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders cached chats while offline messages are still loading', () => {
    const chatStore = useChatStore()
    const chatsData: ChatsData = {
      privateMsgMaxId: '12',
      groupMsgMaxId: '0',
      chatKeys: [],
      chats: [
        {
          atMe: false,
          delete: false,
          headImage: '',
          lastContent: 'cached hello',
          lastSendTime: Date.now(),
          messages: [],
          pinned: false,
          showName: 'Alice',
          stored: true,
          targetId: 'friend-1',
          type: CHATINFO_TYPE.PRIVATE,
          unreadCount: 0,
        },
      ],
    }

    chatStore.setLoadingPrivateMsgState(true)
    chatStore.initChat(chatsData)

    const wrapper = shallowMount(ChatPage, {
      global: {
        stubs: {
          ChatWindow: true,
          Card: {
            template: '<div><slot /></div>',
          },
          CardHeader: {
            template: '<div><slot /></div>',
          },
          CardContent: {
            template: '<div><slot /></div>',
          },
          ScrollArea: {
            template: '<div><slot /></div>',
          },
          Input: {
            template: '<input />',
          },
        },
      },
    })

    const chatList = wrapper.findComponent(ChatList)

    expect(chatStore.chats).toHaveLength(0)
    expect(chatStore.getChatList).toHaveLength(1)
    expect(chatList.props('chats')).toEqual(chatStore.getChatList)
  })
})
