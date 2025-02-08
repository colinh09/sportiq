// ChatRoom.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import type { ChatMessage, ChatRoomProps } from './types'

function ChatRoom({
  className,
  placeholder = 'Type a message...',
  onSendMessage,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response (replace with actual API call later)
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: 'This is a simulated response. Replace with actual bot response.',
      role: 'assistant',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])

    // Call external handler if provided
    onSendMessage?.(content)
  }

  return (
    <div className={cn('h-screen flex flex-col w-full', className)}>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4">
          <MessageList messages={messages} />
        </div>
      </ScrollArea>
      <div className="sticky bottom-0 bg-background border-t p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default ChatRoom