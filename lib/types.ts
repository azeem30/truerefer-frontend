export interface User {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  profilePicture?: string
  status?: string
  lastMessage: {
    text: string
    timestamp: string
  }
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  isRead: boolean
}
