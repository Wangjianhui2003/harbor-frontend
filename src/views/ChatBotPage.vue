<template>
  <div class="flex flex-col h-full bg-background">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b p-4 shadow-sm bg-card/50 backdrop-blur">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <span class="text-xl">🤖</span>
      </div>
      <div>
        <h2 class="font-semibold text-lg leading-none">AI Assistant</h2>
        <p class="text-sm text-muted-foreground mt-1">Always here to help</p>
      </div>
    </div>

    <!-- Chat Area -->
    <ScrollArea class="flex-1 p-4" ref="scrollAreaRef">
      <div class="flex flex-col gap-6 max-w-3xl mx-auto">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-4"
          :class="{ 'flex-row-reverse': msg.role === 'user' }"
        >
          <!-- Avatar -->
          <BaseAvatar
            :name="msg.role === 'user' ? 'Me' : 'AI'"
            :head-image="msg.role === 'user' ? undefined : '/bot-avatar.png'"
            :size="2.5"
            class="shrink-0"
          />

          <!-- Message Bubble -->
          <div
            class="relative px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm"
            :class="
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-secondary text-secondary-foreground rounded-tl-sm'
            "
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
            <span
              class="text-[10px] absolute bottom-1 opacity-70"
              :class="
                msg.role === 'user'
                  ? 'right-2 text-primary-foreground'
                  : 'left-3 text-muted-foreground'
              "
              style="bottom: -1.2rem"
            >
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex gap-4">
          <BaseAvatar name="AI" :size="2.5" />
          <div class="flex items-center gap-1 bg-secondary px-4 py-3 rounded-2xl rounded-tl-sm">
            <span class="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75"></span>
            <span class="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></span>
          </div>
        </div>

        <!-- Bottom Spacer for better scrolling -->
        <div class="h-4"></div>
      </div>
    </ScrollArea>

    <!-- Input Area -->
    <div class="p-4 border-t bg-card/50 backdrop-blur">
      <div class="max-w-3xl mx-auto flex gap-2">
        <Input
          v-model="inputValue"
          placeholder="Type a message..."
          @keydown.enter="sendMessage"
          class="flex-1 bg-background"
          :disabled="isLoading"
        />
        <Button @click="sendMessage" :disabled="!inputValue.trim() || isLoading" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import BaseAvatar from '@/components/common/BaseAvatar.vue'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const inputValue = ref('')
const isLoading = ref(false)
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null)

const messages = ref<Message[]>([
  {
    id: 1,
    role: 'assistant',
    content: 'Hello! I am your AI assistant. How can I help you today?',
    timestamp: Date.now(),
  },
])

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = async () => {
  await nextTick()
  // ScrollArea component usually has a viewport element we need to scroll
  const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

const sendMessage = async () => {
  const content = inputValue.value.trim()
  if (!content || isLoading.value) return

  // 1. Add User Message
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content,
    timestamp: Date.now(),
  })

  inputValue.value = ''
  isLoading.value = true
  scrollToBottom()

  // 2. Simulate AI Response
  setTimeout(
    () => {
      messages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: generateMockResponse(content),
        timestamp: Date.now(),
      })
      isLoading.value = false
      scrollToBottom()
    },
    1000 + Math.random() * 1000,
  )
}

const generateMockResponse = (input: string): string => {
  const responses = [
    "That's an interesting point! Tell me more.",
    'I can certainly help with that. Could you provide more details?',
    "I'm just a simple demo bot, but I think that is fascinating.",
    'Let me think about that... Okay, I suggest checking the documentation.',
    'Sure thing! Is there anything else you need?',
  ]

  if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
    return "Hi there! Hope you're having a great day."
  }

  if (input.toLowerCase().includes('time')) {
    return `Current time is ${new Date().toLocaleTimeString()}.`
  }

  return responses[Math.floor(Math.random() * responses.length)] ?? "I'm listening."
}
</script>

<style scoped>
/* Add any specific overrides here if utility classes aren't enough */
</style>
