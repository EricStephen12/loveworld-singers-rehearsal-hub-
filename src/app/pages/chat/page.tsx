'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, User, AlertCircle, MoreVertical, Check, Paperclip, Smile } from 'lucide-react'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useSupportMessages } from '@/hooks/useSupportMessages'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatPage() {
  const router = useRouter()
  const { chatMessages, loading, error, sendMessage } = useSupportMessages()
  const [input, setInput] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Debug: Log chat messages
  useEffect(() => {
    console.log('💬 Chat page - messages updated:', chatMessages.length, chatMessages);
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    setIsSending(true)
    const messageText = input.trim()
    setInput('')

    try {
      await sendMessage(messageText)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* WhatsApp-style header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white hover:bg-purple-500/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-white text-base">Admin Support</h1>
              <p className="text-xs text-purple-100">Online now</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-white hover:bg-purple-500/30 rounded-full transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 mx-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {chatMessages.map((message, index) => {
          const showTimestamp = index === 0 || 
            new Date(message.timestamp).getTime() - new Date(chatMessages[index - 1].timestamp).getTime() > 300000; // 5 minutes
          
          return (
            <div key={message.id}>
              {/* Timestamp */}
              {showTimestamp && (
                <div className="flex justify-center mb-3">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
              
              {/* Message */}
              <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-1`}>
                <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  {message.isBot && (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm ${
                      message.isBot
                        ? 'bg-white text-gray-900 rounded-bl-sm'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-sm'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      message.isBot ? 'text-gray-500' : 'text-purple-200'
                    }`}>
                      <span className="text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!message.isBot && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                  
                  {/* User avatar */}
                  {!message.isBot && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Sending indicator */}
        {isSending && (
          <div className="flex justify-start mb-1">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-3">
          {/* Emoji button */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          
          {/* Input field */}
          <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
            />
            {/* Attachment button */}
            <button className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isSending
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <SharedDrawer
        items={getMenuItems() || []}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  )
}
