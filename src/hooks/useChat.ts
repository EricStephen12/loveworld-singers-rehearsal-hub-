import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChatService } from '@/lib/chat-service'
import type { Conversation, Message, ChatContact, TypingIndicator } from '@/types/supabase'

export function useChat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const subscriptionsRef = useRef<{ [key: string]: any }>({})

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadInitialData()
      updateOnlineStatus(true)
    }

    return () => {
      if (user?.id) {
        updateOnlineStatus(false)
        cleanupSubscriptions()
      }
    }
  }, [user?.id])

  const loadInitialData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const [conversationsData, contactsData] = await Promise.all([
        ChatService.getUserConversations(user.id),
        ChatService.getContacts(user.id)
      ])

      setConversations(conversationsData)
      setContacts(contactsData)
    } catch (err) {
      console.error('Error loading chat data:', err)
      setError('Failed to load chat data')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user?.id) return
    await ChatService.updateOnlineStatus(user.id, isOnline)
  }

  const cleanupSubscriptions = () => {
    Object.values(subscriptionsRef.current).forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    })
    subscriptionsRef.current = {}
  }

  // Subscribe to conversation messages
  const subscribeToMessages = useCallback((conversationId: string) => {
    if (!user?.id || subscriptionsRef.current[`messages:${conversationId}`]) return

    const subscription = ChatService.subscribeToMessages(conversationId, (newMessage: Message) => {
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })

      // Mark as read if it's not from current user
      if (newMessage.sender_id !== user.id) {
        ChatService.markMessagesAsRead(conversationId, user.id)
      }
    })

    subscriptionsRef.current[`messages:${conversationId}`] = subscription
  }, [user?.id])

  // Subscribe to typing indicators
  const subscribeToTyping = useCallback((conversationId: string) => {
    if (!user?.id || subscriptionsRef.current[`typing:${conversationId}`]) return

    const subscription = ChatService.subscribeToTypingIndicators(conversationId, (indicators: TypingIndicator[]) => {
      setTypingIndicators(indicators.filter(indicator => indicator.user_id !== user.id))
    })

    subscriptionsRef.current[`typing:${conversationId}`] = subscription
  }, [user?.id])

  // Subscribe to online status changes
  const subscribeToOnlineStatus = useCallback((userIds: string[]) => {
    if (!user?.id || subscriptionsRef.current['online_status']) return

    const subscription = ChatService.subscribeToOnlineStatus(userIds, (statuses) => {
      // Update contacts with new online status
      setContacts(prev => prev.map(contact => {
        const status = statuses.find(s => s.user_id === contact.user.id)
        if (status) {
          return {
            ...contact,
            is_online: status.is_online,
            last_seen: status.last_seen
          }
        }
        return contact
      }))
    })

    subscriptionsRef.current['online_status'] = subscription
  }, [user?.id])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messagesData = await ChatService.getConversationMessages(conversationId)
      setMessages(messagesData)
      
      // Subscribe to real-time updates
      subscribeToMessages(conversationId)
      subscribeToTyping(conversationId)
      
      // Mark messages as read
      if (user?.id) {
        await ChatService.markMessagesAsRead(conversationId, user.id)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    }
  }, [user?.id, subscribeToMessages, subscribeToTyping])

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'voice' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    isDisappearing = false,
    expiresInMinutes = 10
  ) => {
    if (!user?.id) return null

    try {
      const message = await ChatService.sendMessage(
        conversationId,
        user.id,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        isDisappearing,
        expiresInMinutes
      )

      if (message) {
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, message])
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, last_message: message, updated_at: new Date().toISOString() }
            : conv
        ))
      }

      return message
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
      return null
    }
  }, [user?.id])

  // Set typing indicator
  const setTypingIndicator = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user?.id) return

    try {
      await ChatService.setTypingIndicator(conversationId, user.id, isTyping)
    } catch (err) {
      console.error('Error setting typing indicator:', err)
    }
  }, [user?.id])

  // Add message reaction
  const addReaction = useCallback(async (messageId: string, reactionType: string) => {
    if (!user?.id) return

    try {
      await ChatService.addMessageReaction(messageId, user.id, reactionType)
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []).filter(r => r.user_id !== user.id),
                {
                  id: `${messageId}-${user.id}`,
                  message_id: messageId,
                  user_id: user.id,
                  reaction_type: reactionType as any,
                  created_at: new Date().toISOString(),
                  user: {
                    id: user.id,
                    first_name: user.user_metadata?.first_name || '',
                    last_name: user.user_metadata?.last_name || '',
                    email: user.email || ''
                  } as any
                }
              ]
            }
          : msg
      ))
    } catch (err) {
      console.error('Error adding reaction:', err)
    }
  }, [user?.id])

  // Remove message reaction
  const removeReaction = useCallback(async (messageId: string) => {
    if (!user?.id) return

    try {
      await ChatService.removeMessageReaction(messageId, user.id)
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              reactions: (msg.reactions || []).filter(r => r.user_id !== user.id)
            }
          : msg
      ))
    } catch (err) {
      console.error('Error removing reaction:', err)
    }
  }, [user?.id])

  // Get or create conversation
  const getOrCreateConversation = useCallback(async (otherUserId: string) => {
    if (!user?.id) return null

    try {
      const conversation = await ChatService.getOrCreateConversation(user.id, otherUserId)
      
      if (conversation) {
        // Update conversations list
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === conversation.id)
          if (exists) {
            return prev
          }
          return [conversation, ...prev]
        })
      }

      return conversation
    } catch (err) {
      console.error('Error getting/creating conversation:', err)
      setError('Failed to start conversation')
      return null
    }
  }, [user?.id])

  // Start chat with a contact
  const startChat = useCallback(async (contact: ChatContact) => {
    const conversation = await getOrCreateConversation(contact.user.id)
    if (conversation) {
      await loadMessages(conversation.id)
    }
    return conversation
  }, [getOrCreateConversation, loadMessages])

  // Refresh data
  const refresh = useCallback(() => {
    if (user?.id) {
      loadInitialData()
    }
  }, [user?.id])

  return {
    // State
    conversations,
    contacts,
    messages,
    typingIndicators,
    isLoading,
    error,
    
    // Actions
    loadMessages,
    sendMessage,
    setTypingIndicator,
    addReaction,
    removeReaction,
    getOrCreateConversation,
    startChat,
    refresh,
    updateOnlineStatus,
    
    // Subscriptions
    subscribeToMessages,
    subscribeToTyping,
    subscribeToOnlineStatus
  }
}
