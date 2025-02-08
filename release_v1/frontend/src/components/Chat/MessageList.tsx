import React from 'react'
import { cn } from '@/lib/utils'
import { MessageItem } from './MessageItem'
import type { MessageListProps } from './types'

export function MessageList({ messages, className }: MessageListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  )
}