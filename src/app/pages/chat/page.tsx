'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, User, AlertCircle, MoreVertical, Check, Paperclip, Smile, Loader2 } from 'lucide-react'
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    // Simulate typing indicator
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Modern responsive header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Support"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">LWSRH Support</h1>
                <p className="text-sm text-green-600 font-medium">Online • Usually replies instantly</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="fixed top-20 left-4 right-4 z-40 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg animate-slide-down">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 text-sm font-medium">Loading messages...</p>
          </div>
        </div>
      )}

      {/* Messages area - Responsive with better spacing */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pt-24 pb-32 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {chatMessages.map((message, index) => {
            const showTimestamp = index === 0 || 
              new Date(message.timestamp).getTime() - new Date(chatMessages[index - 1].timestamp).getTime() > 300000; // 5 minutes
            
            return (
              <div key={message.id} className="animate-fade-in">
                {/* Timestamp */}
                {showTimestamp && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-white/80 backdrop-blur-sm text-gray-600 text-xs px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
                      {message.timestamp.toLocaleDateString()} {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
                
                {/* Message */}
                <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-2`}>
                  <div className={`flex items-end gap-3 max-w-[85%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Avatar */}
                    {message.isBot && (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <img
                          src="/logo.png"
                          alt="Support"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        message.isBot
                          ? 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-br-md'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</div>
                      <div className={`flex items-center justify-end gap-1 mt-2 ${
                        message.isBot ? 'text-gray-500' : 'text-purple-200'
                      }`}>
                        <span className="text-xs">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!message.isBot && (
                          <div className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <Check className="w-3 h-3 -ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* User avatar */}
                    {!message.isBot && (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-2 animate-fade-in">
              <div className="flex items-end gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Support"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sending indicator */}
          {isSending && (
            <div className="flex justify-end mb-2 animate-fade-in">
              <div className="flex items-end gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 rounded-2xl rounded-br-md shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Modern responsive input area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Emoji button */}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            {/* Input field */}
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm resize-none"
                disabled={isSending}
              />
              {/* Attachment button */}
              <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-105">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                input.trim() && !isSending
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
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
