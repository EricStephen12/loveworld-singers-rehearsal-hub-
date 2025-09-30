// Simple support system using localStorage - no database needed
export interface SupportMessage {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string;
  adminRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  supportMessageId?: string;
}

// Simple storage using localStorage
const STORAGE_KEY = 'loveworld_support_messages';

export class SimpleSupportStorage {
  // Get all messages
  static getMessages(): SupportMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save messages
  static saveMessages(messages: SupportMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  // Add new message
  static addMessage(messageData: Omit<SupportMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>): SupportMessage {
    const messages = this.getMessages();
    const newMessage: SupportMessage = {
      ...messageData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    messages.unshift(newMessage); // Add to beginning
    this.saveMessages(messages);
    return newMessage;
  }

  // Update message (for admin responses)
  static updateMessage(id: string, updates: Partial<SupportMessage>): SupportMessage | null {
    const messages = this.getMessages();
    const index = messages.findIndex(msg => msg.id === id);
    
    if (index === -1) return null;
    
    messages[index] = {
      ...messages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    if (updates.adminResponse) {
      messages[index].adminRespondedAt = new Date().toISOString();
    }
    
    this.saveMessages(messages);
    return messages[index];
  }

  // Get messages for a specific user
  static getUserMessages(userEmail: string): SupportMessage[] {
    return this.getMessages().filter(msg => msg.userEmail === userEmail);
  }

  // Convert support messages to chat format
  static convertToChatMessages(supportMessages: SupportMessage[]): ChatMessage[] {
    const chatMessages: ChatMessage[] = [];
    
    // Add welcome message if no messages exist
    if (supportMessages.length === 0) {
      chatMessages.push({
        id: 'welcome',
        text: "Hello! I'm here to help you with any questions or issues you might have. Feel free to ask me anything!",
        isBot: true,
        timestamp: new Date()
      });
      return chatMessages;
    }

    supportMessages.forEach((msg) => {
      // Add user message
      chatMessages.push({
        id: `user-${msg.id}`,
        text: `**${msg.subject}**\n\n${msg.message}`,
        isBot: false,
        timestamp: new Date(msg.createdAt),
        supportMessageId: msg.id
      });

      // Add admin response if exists
      if (msg.adminResponse) {
        chatMessages.push({
          id: `admin-${msg.id}`,
          text: msg.adminResponse,
          isBot: true,
          timestamp: new Date(msg.adminRespondedAt || msg.updatedAt),
          supportMessageId: msg.id
        });
      }
    });

    // Sort by timestamp
    chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return chatMessages;
  }

  // Simulate admin auto-responses for demo
  static addAutoResponse(messageId: string): void {
    const autoResponses = [
      "Thank you for your message! I've received your request and our team will get back to you as soon as possible.",
      "Thanks for reaching out! We're looking into your issue and will respond shortly.",
      "Hello! I've received your support request. Our team is reviewing it and will provide assistance soon.",
      "Thank you for contacting support! We appreciate your patience while we review your request.",
      "Hi there! Your message has been received and is being reviewed by our support team."
    ];
    
    const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
    
    // Add response after a short delay to simulate real interaction
    setTimeout(() => {
      this.updateMessage(messageId, {
        adminResponse: randomResponse,
        status: 'in_progress'
      });
      
      // Trigger a custom event to notify components of the update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('supportMessageUpdated', { detail: { messageId } }));
      }
    }, 2000);
  }

  // Clear all messages (for testing)
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
