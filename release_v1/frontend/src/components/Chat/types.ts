export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatRoomProps {
  className?: string
  placeholder?: string
  maxHeight?: string
  onSendMessage?: (message: string) => void | Promise<void>
}

export interface MessageListProps {
  messages: ChatMessage[]
  className?: string
}

export interface MessageInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export interface MessageItemProps {
  message: ChatMessage
  className?: string
}