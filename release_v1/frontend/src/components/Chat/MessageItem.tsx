import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'
import type { MessageItemProps } from './types'

export function MessageItem({ message, className }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <Avatar className="h-8 w-8">
        <div className="flex h-full w-full items-center justify-center bg-primary">
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-primary-foreground" />
          )}
        </div>
      </Avatar>
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {message.content}
      </div>
    </div>
  )
}