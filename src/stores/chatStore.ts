import { defineStore } from 'pinia'
import useUserStore from './userStore.js'
import localForage from 'localforage'
import { CHATINFO_TYPE, MESSAGE_STATUS, MESSAGE_TYPE } from '@/utils/enums'
import { TIME_TIP_INTERVAL } from '@/utils/constant'
import type { Chat, ChatInfo, MessageInfo, TimeTipMessage } from '@/types/chat.js'
import type { ChatsData } from '@/types/chat'
import type { Friend, Group, User } from '@/types/index.js'
import type { FriendInfoUpdate } from '@/types/friend.js'

/* 为了加速拉取离线消息效率，拉取时消息暂时存储到cacheChats,等
待所有离线消息拉取完成后，再统一渲染*/
let cacheChats: Chat[] = []

/**
 * key,chatKey,chatsData结构
 *
 * key:chats-userId(当前用户id) -> chatsData
 * chatKey: key-chat.type-targetId  例如:chats-23-PrivateMsg-12 -> chat
 *
 * chatsData = {
 * privateMsgMaxId: state.privateMsgMaxId,
 * groupMsgMaxId: state.groupMsgMaxId,
 * chatKeys: chatKeys
 * }
 *
 *  key -> chatsData (chatKeys)
 *  chatKey -> chat
 *
 */

const useChatStore = defineStore('chatStore', {
  state: () => ({
    activeChat: null as Chat | null,
    privateMsgMaxId: 0,
    groupMsgMaxId: 0,
    loadingPrivateMsg: false,
    loadingGroupMsg: false,
    chats: [] as Chat[],
  }),
  actions: {
    //加载chat数据
    async loadChats(): Promise<void> {
      try {
        const userStore = useUserStore()
        const userId = userStore.userInfo.id
        const key = 'chats-' + userId

        const chatsData: ChatsData | null = await localForage.getItem(key)
        if (!chatsData) {
          console.log('没有历史chats数据')
          return
        }

        if (chatsData.chatKeys) {
          console.log('加载chats')
          const chats = (await Promise.all(
            chatsData.chatKeys.map((chatKey) => {
              console.log(chatKey)
              return localForage.getItem(chatKey)
            }),
          )) as Chat[]
          //过滤掉undefined和null
          chatsData.chats = chats.filter((o) => o)
          this.initChat(chatsData)
        }
      } catch (err) {
        console.log('消息加载失败', err)
        throw err
      }
    },
    //初始化
    initChat(chatsData: ChatsData): void {
      this.chats = []
      this.privateMsgMaxId = chatsData.privateMsgMaxId || 0
      this.groupMsgMaxId = chatsData.groupMsgMaxId || 0
      cacheChats = chatsData.chats || []
      // 防止图片一直处在加载中状态
      cacheChats.forEach((chat) => {
        chat.messages.forEach((msg) => {
          if ((msg as MessageInfo).loadStatus == 'loading') {
            ;(msg as MessageInfo).loadStatus = 'fail'
          }
        })
      })
    },
    //开始一个chat会话
    openChat(chatInfo: ChatInfo): void {
      const chats: Chat[] = this.getChatList
      let chat: Chat | null = null
      //从store里取chat更新(移动到头部)
      for (let idx = 0; idx < chats.length; idx++) {
        //目标id和聊天类型相同
        if (chats[idx]!.type == chatInfo.type && chats[idx]!.targetId == chatInfo.targetId) {
          chat = chats[idx]!
          this.moveTop(idx)
          break
        }
      }
      //没有，新建一个会话
      if (chat == null) {
        chat = {
          targetId: chatInfo.targetId,
          type: chatInfo.type,
          showName: chatInfo.showName || '',
          headImage: chatInfo.headImage || '',
          lastContent: '',
          lastSendTime: new Date().getTime(),
          unreadCount: 0,
          messages: [],
          atMe: false,
          atAll: false,
          stored: false,
          delete: false,
        }
        chats.unshift(chat)
      }
    },
    //会话移动到顶部
    moveTop(idx: number): void {
      // 加载中不移动，很耗性能
      if (this.isLoading) {
        return
      }
      if (idx > 0) {
        const chats = this.getChatList
        const chat = chats[idx]
        if (!chat) {
          return
        }
        chats.splice(idx, 1)
        chats.unshift(chat)
        chat.stored = false
        chat.lastSendTime = new Date().getTime()
        this.saveToStorage()
      }
    },
    //选择一个chat
    activateChat(idx: number): void {
      const chats = this.getChatList
      if (!chats[idx]) {
        return
      }
      this.activeChat = chats[idx]
    },
    saveToStorage() {
      //将内存里数据(而且stored状态为false)保存到数据库
      // 加载中不保存，防止卡顿
      if (this.isLoading) return
      const userStore = useUserStore()
      const userId = userStore.userInfo.id
      const key = 'chats-' + userId
      const newChatKeys: string[] = []
      this.chats.forEach((chat) => {
        const chatKey = `${key}-${chat.type}-${chat.targetId}`
        if (!chat.stored) {
          if (chat.delete) {
            localForage.removeItem(chatKey)
          } else {
            localForage.setItem(chatKey, JSON.parse(JSON.stringify(chat)))
          }
          chat.stored = true
        }
        //update chatKeys
        if (!chat.delete) {
          newChatKeys.push(chatKey)
        }
      })
      // 会话核心信息
      const chatsData = {
        privateMsgMaxId: this.privateMsgMaxId,
        groupMsgMaxId: this.groupMsgMaxId,
        chatKeys: newChatKeys,
      }
      localForage.setItem(key, chatsData)
      // 清理已删除的会话
      this.chats = this.chats.filter((chat) => !chat.delete)
    },

    insertMessage(msgInfo: MessageInfo, chatInfo: ChatInfo) {
      const type = chatInfo.type
      //记录消息的最大id
      if (msgInfo.id && type === CHATINFO_TYPE.PRIVATE && msgInfo.id > this.privateMsgMaxId) {
        this.privateMsgMaxId = msgInfo.id
      }
      if (msgInfo.id && type === CHATINFO_TYPE.GROUP && msgInfo.id > this.groupMsgMaxId) {
        this.groupMsgMaxId = msgInfo.id
      }
      // 如果是已存在消息，则覆盖旧的消息数据
      const chat: Chat | undefined = this.findChat(chatInfo)
      if (!chat) {
        return
      }
      const message = this.findMessage(chat, msgInfo)
      if (message) {
        Object.assign(message, msgInfo)
        chat.stored = false
        this.saveToStorage()
        return
      }
      if (
        msgInfo.type == MESSAGE_TYPE.TEXT ||
        msgInfo.type == MESSAGE_TYPE.RECALL ||
        msgInfo.type == MESSAGE_TYPE.TIP_TEXT
      ) {
        chat.lastContent = msgInfo.content
      }
      chat.lastSendTime = msgInfo.sendTime
      chat.sendNickname = msgInfo.sendNickname
      //未读+1
      if (
        !msgInfo.selfSend &&
        msgInfo.status != MESSAGE_STATUS.READ &&
        msgInfo.status != MESSAGE_STATUS.RECALL &&
        msgInfo.type != MESSAGE_TYPE.TIP_TEXT
      ) {
        chat.unreadCount++
      }

      //@我或@所有人
      if (
        msgInfo.selfSend &&
        chat.type === CHATINFO_TYPE.GROUP &&
        msgInfo.atUserIds &&
        msgInfo.status != MESSAGE_STATUS.READ
      ) {
        const userStore = useUserStore()
        const id = userStore.userInfo.id
        if (msgInfo.atUserIds.indexOf(id) >= 0) {
          chat.atMe = true
        }
        if (msgInfo.atUserIds.indexOf(-1) >= 0) {
          chat.atAll = true
        }
      }

      //间隔大于十分钟插入一个时间提示
      if (!chat.lastTimeTip || chat.lastTimeTip < msgInfo.sendTime - TIME_TIP_INTERVAL) {
        const timeTipMsg: TimeTipMessage = {
          sendTime: msgInfo.sendTime,
          type: MESSAGE_TYPE.TIP_TIME,
        }
        chat.messages.push(timeTipMsg)
        chat.lastTimeTip = msgInfo.sendTime
      }

      // 根据id顺序插入，防止消息乱序
      let insertPos = chat.messages.length
      if (msgInfo.id && msgInfo.id > 0) {
        for (let idx = 0; idx < chat.messages.length; idx++) {
          const currentMsg = chat.messages[idx] as MessageInfo
          if (currentMsg.id && msgInfo.id < currentMsg.id) {
            insertPos = idx
            console.log(`消息出现乱序,位置:${chat.messages.length},修正至:${insertPos}`)
            break
          }
        }
      }
      chat.messages.splice(insertPos, 0, msgInfo)
      chat.stored = false
      this.saveToStorage()
    },

    //将cacheChats刷新到chats
    refreshChat() {
      //没有缓存，不刷新
      if (!cacheChats) {
        return
      }
      console.log('refresh chat')
      //按最新时间排序（在前）
      cacheChats.sort((chat1, chat2) => {
        return chat2.lastSendTime - chat1.lastSendTime
      })
      // 将消息一次性装载回来
      this.chats = cacheChats
      // 清空缓存
      cacheChats = []
      this.saveToStorage()
    },

    //isLoading=true,现在在拉取离线消息，isLoading=false，现在没有在拉取离线消息，可以刷新到chats
    setLoadingPrivateMsgState(loading: boolean) {
      this.loadingPrivateMsg = loading
      if (!this.isLoading) {
        this.refreshChat()
      }
    },

    setLoadingGroupMsgState(loading: boolean) {
      this.loadingGroupMsg = loading
      if (!this.isLoading) {
        this.refreshChat()
      }
    },

    //移除chat
    removeChat(idx: number) {
      const chats = this.getChatList
      if (!chats[idx]) {
        return
      }
      if (chats[idx] === this.activeChat) {
        this.activeChat = null
      }
      chats[idx].delete = true
      chats[idx].stored = false
      this.saveToStorage()
    },

    //移除私聊消息
    removePrivateChat(friendId: number) {
      const chats = this.getChatList
      for (let idx = 0; idx < chats.length; idx++) {
        const chat = chats[idx]
        if (!chat) {
          continue
        }
        if (chat.type == CHATINFO_TYPE.PRIVATE && chat.targetId == friendId) {
          this.removeChat(idx)
          break
        }
      }
    },

    //移除群组消息
    removeGroupChat(groupId: number) {
      const chats = this.getChatList
      for (let idx = 0; idx < chats.length; idx++) {
        const chat = chats[idx]
        if (!chat) {
          continue
        }
        if (chat.type == CHATINFO_TYPE.GROUP && chat.targetId == groupId) {
          this.removeChat(idx)
          break
        }
      }
    },

    updateChatFromFriend(friend: FriendInfoUpdate) {
      const chat = this.findChatByFriendId(friend.id)
      // 更新会话中的群名和头像
      if (chat && (chat.headImage != friend.headImage || chat.showName != friend.friendNickname)) {
        chat.headImage = friend.headImage
        chat.showName = friend.friendNickname
        chat.stored = false
        this.saveToStorage()
      }
    },

    //用userInfo更新chat(不是好友但出现在会话里)
    updateChatFromUser(userInfo: User) {
      const chat = this.findChatByFriendId(userInfo.id)
      // 更新会话中的昵称和头像
      if (
        chat &&
        (chat.headImage != userInfo.headImageThumb || chat.showName != userInfo.nickname)
      ) {
        chat.headImage = userInfo.headImageThumb
        chat.showName = userInfo.nickname
        chat.stored = false
        this.saveToStorage()
      }
    },

    clear() {
      cacheChats = []
      this.chats = []
      this.activeChat = null
    },

    //清除未读状态(未读消息数，at等)
    resetUnread(chatInfo: ChatInfo) {
      const chats = this.getChatList
      for (let idx = 0; idx < chats.length; idx++) {
        const chat = chats[idx]
        if (chat && chat.type == chatInfo.type && chat.targetId == chatInfo.targetId) {
          chat.unreadCount = 0
          chat.atMe = false
          chat.atAll = false
          chat.stored = false
          this.saveToStorage()
          break
        }
      }
    },

    //将私聊会话maxId以下的全部设为已读(多时其他客户端已读客户端)
    markReadMessage(friendId: number, maxId: number | null) {
      const chat = this.findChatByFriendId(friendId)
      if (!chat) return
      for (let idx = 0; idx < chat.messages.length; idx++) {
        const msg = chat.messages[idx] as MessageInfo
        if (msg.id && msg.selfSend && msg.status < MESSAGE_STATUS.RECALL) {
          // pos.maxId为空表示整个会话已读
          if (!maxId || msg.id <= maxId) {
            msg.status = MESSAGE_STATUS.READ
            chat.stored = false
          }
        }
      }
      this.saveToStorage()
    },

    //处理撤回消息
    recallMsg(msgInfo: MessageInfo, chatInfo: ChatInfo) {
      const chat = this.findChat(chatInfo)
      if (!chat) return
      //要撤回的消息id
      const id: number = Number(msgInfo.content)
      //群聊和私聊撤回标识
      const name = msgInfo.selfSend ? '你' : chat.type == 'PRIVATE' ? '对方' : msgInfo.sendNickname
      for (let idx = 0; idx < chat.messages.length; idx++) {
        const m = chat.messages[idx] as MessageInfo
        if (m.id && m.id == id) {
          // 改造成一条提示消息
          m.status = MESSAGE_STATUS.RECALL
          m.content = name + '撤回了一条消息'
          m.type = MESSAGE_TYPE.TIP_TEXT
          // 会话列表变化
          chat.lastContent = m.content
          chat.lastSendTime = msgInfo.sendTime
          chat.sendNickname = ''
          if (!msgInfo.selfSend && msgInfo.status != MESSAGE_STATUS.READ) {
            chat.unreadCount++
          }
        }
        // 被引用的消息也要撤回
        if (m.quoteMessage && m.quoteMessage.id == msgInfo.id) {
          m.quoteMessage.content = '引用内容已撤回'
          m.quoteMessage.status = MESSAGE_STATUS.RECALL
          m.quoteMessage.type = MESSAGE_TYPE.TIP_TEXT
        }
      }
      chat.stored = false
      this.saveToStorage()
    },
    //加载群信息后，如果头像和showGroupName变了要重新加载
    updateChatFromGroup(group: Group) {
      const chat: Chat | undefined = this.findChatByGroupId(group.id)
      if (
        chat &&
        (chat.headImage != group.headImageThumb || chat.showName != group.showGroupName)
      ) {
        // 更新会话中的群名称和头像
        chat.headImage = group.headImageThumb
        chat.showName = group.showGroupName as string
        chat.stored = false
        this.saveToStorage()
      }
    },
    //更新消息
    updateMessage(msgInfo: MessageInfo, chatInfo: ChatInfo) {
      const chat = this.findChat(chatInfo)
      if (!chat) return
      const message = this.findMessage(chat, msgInfo)
      if (message) {
        Object.assign(message, msgInfo)
        chat.stored = false
        this.saveToStorage()
      }
    },
  },
  getters: {
    isLoading(state) {
      return state.loadingGroupMsg || state.loadingPrivateMsg
    },
    //cacheChats或已加载完成的chats
    getChatList(state): Chat[] {
      if (cacheChats && this.isLoading) {
        return cacheChats
      }
      return state.chats
    },
    //找到对应信息
    findMessage() {
      return (chat: Chat, msgInfo: MessageInfo) => {
        for (let idx = 0; idx < chat.messages.length; idx++) {
          const message = chat.messages[idx] as MessageInfo
          if (!message) continue
          // 通过id判断
          if (msgInfo.id && message.id == msgInfo.id) {
            return message
          }
          // 正在发送中的消息可能没有id,只有tmpId
          if (msgInfo.tmpId && message.tmpId && message.tmpId == msgInfo.tmpId) {
            return message
          }
        }
      }
    },
    findChat() {
      return (chatInfo: ChatInfo): Chat | undefined => {
        const chats = this.getChatList
        const idx = this.findChatIdx(chatInfo)
        if (idx !== undefined) return chats[idx]
      }
    },
    //找到chat在chats下标
    findChatIdx() {
      return (chatInfo: ChatInfo): number | undefined => {
        const chats = this.getChatList
        for (let idx = 0; idx < chats.length; idx++) {
          const chat: Chat = chats[idx]!
          if (chat && chat.type == chatInfo.type && chat.targetId == chatInfo.targetId) {
            return idx
          }
        }
      }
    },
    //根据friendId找chat
    findChatByFriendId() {
      return (friendId: number) => {
        const chats = this.getChatList
        return chats.find((chat) => chat.type == CHATINFO_TYPE.PRIVATE && chat.targetId == friendId)
      }
    },
    //根据groupId找chat
    findChatByGroupId() {
      return (groupId: number) => {
        const chats = this.getChatList
        return chats.find((chat) => chat.type == CHATINFO_TYPE.GROUP && chat.targetId == groupId)
      }
    },
  },
})

export default useChatStore
