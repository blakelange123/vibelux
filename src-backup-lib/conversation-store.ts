// Conversation persistence for AI Assistant
interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
}

interface Conversation {
  id: string
  userId: string
  title: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
}

class ConversationStore {
  private readonly STORAGE_KEY = 'vibelux_ai_conversations'
  private readonly MAX_CONVERSATIONS = 50
  private readonly MAX_MESSAGES_PER_CONVERSATION = 100

  // Get all conversations for user
  getConversations(userId: string): Conversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const conversations: Conversation[] = JSON.parse(stored)
      return conversations
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error loading conversations:', error)
      return []
    }
  }

  // Get specific conversation
  getConversation(conversationId: string, userId: string): Conversation | null {
    const conversations = this.getConversations(userId)
    return conversations.find(c => c.id === conversationId) || null
  }

  // Create new conversation
  createConversation(userId: string, firstMessage?: ConversationMessage): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2)}`,
      userId,
      title: this.generateTitle(firstMessage?.content || 'New Conversation'),
      messages: firstMessage ? [firstMessage] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.saveConversation(conversation)
    return conversation
  }

  // Add message to conversation
  addMessage(conversationId: string, userId: string, message: ConversationMessage): void {
    const conversations = this.getAllConversations()
    const conversation = conversations.find(c => c.id === conversationId && c.userId === userId)
    
    if (!conversation) {
      console.error('Conversation not found:', conversationId)
      return
    }

    conversation.messages.push(message)
    conversation.updatedAt = new Date()

    // Limit message history
    if (conversation.messages.length > this.MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_PER_CONVERSATION)
    }

    this.saveAllConversations(conversations)
  }

  // Update conversation title
  updateTitle(conversationId: string, userId: string, title: string): void {
    const conversations = this.getAllConversations()
    const conversation = conversations.find(c => c.id === conversationId && c.userId === userId)
    
    if (conversation) {
      conversation.title = title
      conversation.updatedAt = new Date()
      this.saveAllConversations(conversations)
    }
  }

  // Delete conversation
  deleteConversation(conversationId: string, userId: string): void {
    const conversations = this.getAllConversations()
    const filtered = conversations.filter(c => !(c.id === conversationId && c.userId === userId))
    this.saveAllConversations(filtered)
  }

  // Get recent messages for context (last 5 messages)
  getRecentMessages(conversationId: string, userId: string, limit = 5): ConversationMessage[] {
    const conversation = this.getConversation(conversationId, userId)
    if (!conversation) return []
    
    return conversation.messages.slice(-limit)
  }

  private saveConversation(conversation: Conversation): void {
    const conversations = this.getAllConversations()
    
    // Replace if exists, otherwise add
    const index = conversations.findIndex(c => c.id === conversation.id)
    if (index >= 0) {
      conversations[index] = conversation
    } else {
      conversations.push(conversation)
    }

    // Limit total conversations
    if (conversations.length > this.MAX_CONVERSATIONS) {
      conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      conversations.splice(this.MAX_CONVERSATIONS)
    }

    this.saveAllConversations(conversations)
  }

  private getAllConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading all conversations:', error)
      return []
    }
  }

  private saveAllConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
      // Handle storage quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Remove oldest conversations and try again
        const reduced = conversations.slice(-20)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reduced))
      }
    }
  }

  private generateTitle(content: string): string {
    // Extract meaningful title from first message
    const cleaned = content.replace(/[^\w\s]/g, '').trim()
    const words = cleaned.split(/\s+/).slice(0, 5)
    return words.join(' ') || 'New Conversation'
  }

  // Clear all conversations for user (useful for privacy)
  clearAllConversations(userId: string): void {
    const conversations = this.getAllConversations()
    const filtered = conversations.filter(c => c.userId !== userId)
    this.saveAllConversations(filtered)
  }

  // Export conversations for user
  exportConversations(userId: string): string {
    const conversations = this.getConversations(userId)
    return JSON.stringify(conversations, null, 2)
  }
}

export const conversationStore = new ConversationStore()
export type { Conversation, ConversationMessage }