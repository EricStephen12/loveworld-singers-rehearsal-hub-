'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationManager } from '@/utils/navigation'
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
    <div className="h-screen bg-[#E5DDD5] flex flex-col overflow-hidden">
      {/* WhatsApp-style header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-400 to-purple-500 shadow-md w-full">
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
        <button
          onClick={() => NavigationManager.safeBack(router)}
              className="p-2 -ml-2 text-white hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Support"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-purple-500 rounded-full"></div>
        </div>
              <div>
                <h1 className="font-semibold text-white text-base">LWSRH Support</h1>
                <p className="text-xs text-purple-100">Online</p>
              </div>
            </div>
        </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200"
            >
              <MoreVertical className="w-5 h-5" />
          </button>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-red-100 border border-red-300 rounded-lg p-3 shadow-md animate-fadeIn max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 text-sm">Loading messages...</p>
          </div>
        </div>
      )}

      {/* WhatsApp-style messages area with pattern background */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 w-full" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
        <div className="space-y-3">
        {chatMessages.map((message, index) => {
            const showTimestamp = index === 0 ||
              new Date(message.timestamp).getTime() - new Date(chatMessages[index - 1].timestamp).getTime() > 300000; // 5 minutes

          return (
              <div key={message.id} className="animate-fadeIn">
                {/* Date separator */}
                {showTimestamp && (
                  <div className="flex justify-center my-4">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                      {message.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
              )}

                {/* Message bubble */}
                <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-1`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${message.isBot ? '' : ''}`}>
                    {/* Message content */}
                    <div
                      className={`px-3 py-2 rounded-lg shadow-sm ${
                        message.isBot
                          ? 'bg-white text-gray-900 rounded-tl-none'
                          : 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</div>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        message.isBot ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        <span className="text-[10px]">
                          {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        {!message.isBot && (
                          <div className="flex items-center">
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                            <Check className="w-3.5 h-3.5 -ml-2 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                </div>
                </div>
              </div>
            );
        })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-1 animate-fadeIn">
              <div className="bg-white px-4 py-2.5 rounded-lg rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Sending indicator */}
          {isSending && (
            <div className="flex justify-end mb-1 animate-fadeIn">
              <div className="bg-[#DCF8C6] px-4 py-2.5 rounded-lg rounded-tr-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style input area - Fixed */}
      <div className="flex-shrink-0 bg-[#F0F0F0] border-t border-gray-300 shadow-lg w-full">
        <div className="px-3 py-2 w-full">
          <div className="flex items-end gap-2">
            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
            >
              <Smile className="w-5 h-5" />
          </button>

            {/* Input field */}
            <div className="flex-1 max-w-[calc(100%-60px)] bg-white rounded-3xl px-4 py-2.5 flex items-center gap-2 shadow-sm border border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
                placeholder="Message"
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-[15px] min-w-0"
                disabled={isSending}
              />
              {/* Attachment button - hide on small screens */}
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 hidden sm:block">
                <Paperclip className="w-5 h-5" />
              </button>
          </div>

            {/* Send button - always visible */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
              className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 ${
                input.trim() && !isSending
                  ? 'bg-purple-400 text-white hover:bg-purple-500 shadow-md active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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