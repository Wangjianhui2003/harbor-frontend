import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import useUserStore from './userStore.js'
import localForage from 'localforage'
import { CHATINFO_TYPE, MESSAGE_STATUS, MESSAGE_TYPE } from '@/utils/enums'
import { TIME_TIP_INTERVAL } from '@/utils/constant'
import type { Chat, ChatInfo, MessageInfo, TimeTipMessage } from '@/types/chat.js'
import type { ChatsData } from '@/types/chat'
import { showError } from '@/utils/message.js'
import type { Group, User } from '@/types/index.js'
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

const useChatStore = defineStore('chatStore', () => {
  const activeChat = ref<Chat | null>(null)
  const privateMsgMaxId = ref(0)
  const groupMsgMaxId = ref(0)
  const loadingPrivateMsg = ref(false)
  const loadingGroupMsg = ref(false)
  const chats = ref<Chat[]>([])

  const isLoading = computed(() => loadingGroupMsg.value || loadingPrivateMsg.value)

  //cacheChats或已加载完成的chats
  const getChatList = computed<Chat[]>(() => {
    if (cacheChats && isLoading.value) {
      return cacheChats
    }
    return chats.value
  })

  //找到对应信息
  const findMessage = (chat: Chat, msgInfo: MessageInfo) => {
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

  //找到chat在chats下标
  const findChatIdx = (chatInfo: ChatInfo): number | undefined => {
    const chatList = getChatList.value
    for (let idx = 0; idx < chatList.length; idx++) {
      const chat: Chat = chatList[idx]!
      if (chat && chat.type == chatInfo.type && chat.targetId == chatInfo.targetId) {
        return idx
      }
    }
  }

  const findChat = (chatInfo: ChatInfo): Chat | undefined => {
    const chatList = getChatList.value
    const idx = findChatIdx(chatInfo)
    if (idx !== undefined) return chatList[idx]
  }

  //根据friendId找chat
  const findChatByFriendId = (friendId: number) => {
    const chatList = getChatList.value
    return chatList.find((chat) => chat.type == CHATINFO_TYPE.PRIVATE && chat.targetId == friendId)
  }

  //根据groupId找chat
  const findChatByGroupId = (groupId: number) => {
    const chatList = getChatList.value
    return chatList.find((chat) => chat.type == CHATINFO_TYPE.GROUP && chat.targetId == groupId)
  }

  //加载chat数据
  const loadChats = async (): Promise<void> => {
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
        const storedChats = (await Promise.all(
          chatsData.chatKeys.map((chatKey) => {
            console.log(chatKey)
            return localForage.getItem(chatKey)
          }),
        )) as Chat[]
        //过滤掉undefined和null
        chatsData.chats = storedChats.filter((o) => o)
        initChat(chatsData)
      }
    } catch (err) {
      showError('错误', '消息加载失败')
      console.log('消息加载失败', err)
      throw err
    }
  }

  //初始化
  const initChat = (chatsData: ChatsData): void => {
    chats.value = []
    privateMsgMaxId.value = chatsData.privateMsgMaxId || 0
    groupMsgMaxId.value = chatsData.groupMsgMaxId || 0
    cacheChats = chatsData.chats || []
    // 防止图片一直处在加载中状态
    cacheChats.forEach((chat) => {
      chat.messages.forEach((msg) => {
        if ((msg as MessageInfo).loadStatus == 'loading') {
          ;(msg as MessageInfo).loadStatus = 'fail'
        }
      })
    })
  }

  //开始一个chat会话
  const openChat = (chatInfo: ChatInfo): void => {
    const chatList: Chat[] = getChatList.value
    let chat: Chat | null = null
    //从store里取chat更新(移动到头部)
    for (let idx = 0; idx < chatList.length; idx++) {
      //目标id和聊天类型相同
      if (chatList[idx]!.type == chatInfo.type && chatList[idx]!.targetId == chatInfo.targetId) {
        chat = chatList[idx]!
        moveTop(idx)
        break
      }
    }
    //没有，新建一个会话
    if (chat == null) {
      chat = {
        targetId: chatInfo.targetId,
        type: chatInfo.type,
        showName: chatInfo.showName,
        headImage: chatInfo.headImage,
        lastContent: '',
        lastSendTime: new Date().getTime(),
        unreadCount: 0,
        messages: [],
        atMe: false,
        atAll: false,
        stored: false,
        delete: false,
      }
      chatList.unshift(chat)
    }
  }

  //会话移动到顶部
  const moveTop = (idx: number): void => {
    // 加载中不移动，很耗性能
    if (isLoading.value) {
      return
    }
    if (idx > 0) {
      const chatList = getChatList.value
      const chat = chatList[idx]
      if (!chat) {
        return
      }
      chatList.splice(idx, 1)
      chatList.unshift(chat)
      chat.stored = false
      chat.lastSendTime = new Date().getTime()
      saveToStorage()
    }
  }

  //选择一个chat
  const activateChat = (idx: number): void => {
    const chatList = getChatList.value
    if (!chatList[idx]) {
      return
    }
    activeChat.value = chatList[idx]
  }

  const saveToStorage = () => {
    //将内存里数据(而且stored状态为false)保存到数据库
    // 加载中不保存，防止卡顿
    if (isLoading.value) return
    const userStore = useUserStore()
    const userId = userStore.userInfo.id
    const key = 'chats-' + userId
    const newChatKeys: string[] = []
    chats.value.forEach((chat) => {
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
      privateMsgMaxId: privateMsgMaxId.value,
      groupMsgMaxId: groupMsgMaxId.value,
      chatKeys: newChatKeys,
    }
    localForage.setItem(key, chatsData)
    // 清理已删除的会话
    chats.value = chats.value.filter((chat) => !chat.delete)
  }

  const insertMessage = (msgInfo: MessageInfo, chatInfo: ChatInfo) => {
    const type = chatInfo.type
    //记录消息的最大id
    if (msgInfo.id && type === CHATINFO_TYPE.PRIVATE && msgInfo.id > privateMsgMaxId.value) {
      privateMsgMaxId.value = msgInfo.id
    }
    if (msgInfo.id && type === CHATINFO_TYPE.GROUP && msgInfo.id > groupMsgMaxId.value) {
      groupMsgMaxId.value = msgInfo.id
    }
    // 如果是已存在消息，则覆盖旧的消息数据
    const chat: Chat | undefined = findChat(chatInfo)
    if (!chat) {
      return
    }
    const message = findMessage(chat, msgInfo)
    if (message) {
      Object.assign(message, msgInfo)
      chat.stored = false
      saveToStorage()
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
    saveToStorage()
  }

  //将cacheChats刷新到chats
  const refreshChat = () => {
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
    chats.value = cacheChats
    // 清空缓存
    cacheChats = []
    saveToStorage()
  }

  //isLoading=true,现在在拉取离线消息，isLoading=false，现在没有在拉取离线消息，可以刷新到chats
  const setLoadingPrivateMsgState = (loading: boolean) => {
    loadingPrivateMsg.value = loading
    if (!isLoading.value) {
      refreshChat()
    }
  }

  const setLoadingGroupMsgState = (loading: boolean) => {
    loadingGroupMsg.value = loading
    if (!isLoading.value) {
      refreshChat()
    }
  }

  //移除chat
  const removeChat = (idx: number) => {
    const chatList = getChatList.value
    if (!chatList[idx]) {
      return
    }
    if (chatList[idx] === activeChat.value) {
      activeChat.value = null
    }
    chatList[idx].delete = true
    chatList[idx].stored = false
    saveToStorage()
  }

  //移除私聊消息
  const removePrivateChat = (friendId: number) => {
    const chatList = getChatList.value
    for (let idx = 0; idx < chatList.length; idx++) {
      const chat = chatList[idx]
      if (!chat) {
        continue
      }
      if (chat.type == CHATINFO_TYPE.PRIVATE && chat.targetId == friendId) {
        removeChat(idx)
        break
      }
    }
  }

  //移除群组消息
  const removeGroupChat = (groupId: number) => {
    const chatList = getChatList.value
    for (let idx = 0; idx < chatList.length; idx++) {
      const chat = chatList[idx]
      if (!chat) {
        continue
      }
      if (chat.type == CHATINFO_TYPE.GROUP && chat.targetId == groupId) {
        removeChat(idx)
        break
      }
    }
  }

  const updateChatFromFriend = (friend: FriendInfoUpdate) => {
    const chat = findChatByFriendId(friend.id)
    // 更新会话中的群名和头像
    if (chat && (chat.headImage != friend.headImage || chat.showName != friend.friendNickname)) {
      chat.headImage = friend.headImage
      chat.showName = friend.friendNickname
      chat.stored = false
      saveToStorage()
    }
  }

  //用userInfo更新chat(不是好友但出现在会话里)
  const updateChatFromUser = (userInfo: User) => {
    const chat = findChatByFriendId(userInfo.id)
    // 更新会话中的昵称和头像
    if (chat && (chat.headImage != userInfo.headImageThumb || chat.showName != userInfo.nickname)) {
      chat.headImage = userInfo.headImageThumb
      chat.showName = userInfo.nickname
      chat.stored = false
      saveToStorage()
    }
  }

  const clear = () => {
    cacheChats = []
    chats.value = []
    activeChat.value = null
  }

  //清除未读状态(未读消息数，at等)
  const resetUnread = (chatInfo: ChatInfo) => {
    const chatList = getChatList.value
    for (let idx = 0; idx < chatList.length; idx++) {
      const chat = chatList[idx]
      if (chat && chat.type == chatInfo.type && chat.targetId == chatInfo.targetId) {
        chat.unreadCount = 0
        chat.atMe = false
        chat.atAll = false
        chat.stored = false
        saveToStorage()
        break
      }
    }
  }

  //将私聊会话maxId以下的全部设为已读(多时其他客户端已读客户端)
  const markReadMessage = (friendId: number, maxId: number) => {
    const chat = findChatByFriendId(friendId)
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
    saveToStorage()
  }

  //处理撤回消息
  const recallMsg = (msgInfo: MessageInfo, chatInfo: ChatInfo) => {
    const chat = findChat(chatInfo)
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
    saveToStorage()
  }

  //加载群信息后，如果头像和showGroupName变了要重新加载
  const updateChatFromGroup = (group: Group) => {
    const chat: Chat | undefined = findChatByGroupId(group.id)
    if (chat && (chat.headImage != group.headImageThumb || chat.showName != group.showGroupName)) {
      // 更新会话中的群名称和头像
      chat.headImage = group.headImageThumb
      chat.showName = group.showGroupName as string
      chat.stored = false
      saveToStorage()
    }
  }

  //更新消息
  const updateMessage = (msgInfo: MessageInfo, chatInfo: ChatInfo) => {
    const chat = findChat(chatInfo)
    if (!chat) return
    const message = findMessage(chat, msgInfo)
    if (message) {
      Object.assign(message, msgInfo)
      chat.stored = false
      saveToStorage()
    }
  }

  return {
    activeChat,
    privateMsgMaxId,
    groupMsgMaxId,
    loadingPrivateMsg,
    loadingGroupMsg,
    chats,
    isLoading,
    getChatList,
    findMessage,
    findChat,
    findChatIdx,
    findChatByFriendId,
    findChatByGroupId,
    loadChats,
    initChat,
    openChat,
    moveTop,
    activateChat,
    saveToStorage,
    insertMessage,
    refreshChat,
    setLoadingPrivateMsgState,
    setLoadingGroupMsgState,
    removeChat,
    removePrivateChat,
    removeGroupChat,
    updateChatFromFriend,
    updateChatFromUser,
    clear,
    resetUnread,
    markReadMessage,
    recallMsg,
    updateChatFromGroup,
    updateMessage,
  }
})

export default useChatStore
