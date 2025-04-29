import type { User, Message } from "./types"

export const mockChatUsers: User[] = [
  {
    id: "user1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
    status: "Online",
    lastMessage: {
      text: "I can definitely help with a referral at Google. Let's discuss your background.",
      timestamp: "2023-03-02T14:30:00Z",
    },
  },
  {
    id: "user2",
    firstName: "Michael",
    middleName: "J",
    lastName: "Chen",
    email: "michael.chen@example.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
    status: "Away",
    lastMessage: {
      text: "I reviewed your resume and I think you'd be a great fit for our team.",
      timestamp: "2023-03-01T09:15:00Z",
    },
  },
  {
    id: "user3",
    firstName: "Emily",
    lastName: "Wong",
    email: "emily.wong@example.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
    status: "Offline",
    lastMessage: {
      text: "Could you send me your portfolio? I'd like to share it with the hiring manager.",
      timestamp: "2023-02-28T16:45:00Z",
    },
  },
  {
    id: "user4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@example.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
    status: "Online",
    lastMessage: {
      text: "The interview process usually takes about 2-3 weeks from start to finish.",
      timestamp: "2023-02-27T11:20:00Z",
    },
  },
  {
    id: "user5",
    firstName: "Jessica",
    middleName: "L",
    lastName: "Martinez",
    email: "jessica.martinez@example.com",
    profilePicture: "/placeholder.svg?height=40&width=40",
    status: "Online",
    lastMessage: {
      text: "I submitted your referral today. You should hear back from HR soon!",
      timestamp: "2023-02-26T15:10:00Z",
    },
  },
]

export const mockMessages: Record<string, Message[]> = {
  user1: [
    {
      id: "msg1",
      senderId: "user1",
      text: "Hi there! I saw your profile and noticed you're looking for opportunities in software engineering.",
      timestamp: "2023-03-02T14:20:00Z",
      isRead: true,
    },
    {
      id: "msg2",
      senderId: "current-user",
      text: "Yes, I am! I'm particularly interested in roles at Google. Do you work there?",
      timestamp: "2023-03-02T14:22:00Z",
      isRead: true,
    },
    {
      id: "msg3",
      senderId: "user1",
      text: "I do! I've been a software engineer at Google for about 3 years now. I'd be happy to chat about the company and potentially provide a referral.",
      timestamp: "2023-03-02T14:25:00Z",
      isRead: true,
    },
    {
      id: "msg4",
      senderId: "current-user",
      text: "That would be amazing! I have a strong background in full-stack development and have been working with React and Node.js for the past 2 years.",
      timestamp: "2023-03-02T14:28:00Z",
      isRead: true,
    },
    {
      id: "msg5",
      senderId: "user1",
      text: "I can definitely help with a referral at Google. Let's discuss your background.",
      timestamp: "2023-03-02T14:30:00Z",
      isRead: true,
    },
  ],
  user2: [
    {
      id: "msg1",
      senderId: "user2",
      text: "Hello! I'm a product manager at Microsoft. I noticed you're looking for opportunities in tech.",
      timestamp: "2023-03-01T09:00:00Z",
      isRead: true,
    },
    {
      id: "msg2",
      senderId: "current-user",
      text: "Hi Michael! Yes, I'm currently exploring new opportunities. I'm interested in Microsoft as well.",
      timestamp: "2023-03-01T09:05:00Z",
      isRead: true,
    },
    {
      id: "msg3",
      senderId: "user2",
      text: "Great! Could you share your resume with me? I might be able to refer you for some open positions on our team.",
      timestamp: "2023-03-01T09:10:00Z",
      isRead: true,
    },
    {
      id: "msg4",
      senderId: "current-user",
      text: "Of course! I've just sent you my resume. I'm particularly interested in software engineering roles.",
      timestamp: "2023-03-01T09:12:00Z",
      isRead: true,
    },
    {
      id: "msg5",
      senderId: "user2",
      text: "I reviewed your resume and I think you'd be a great fit for our team.",
      timestamp: "2023-03-01T09:15:00Z",
      isRead: true,
    },
  ],
  user3: [
    {
      id: "msg1",
      senderId: "current-user",
      text: "Hi Emily! I saw that you're a UX Designer at Apple. I'm really interested in learning more about design opportunities there.",
      timestamp: "2023-02-28T16:30:00Z",
      isRead: true,
    },
    {
      id: "msg2",
      senderId: "user3",
      text: "Hello! Yes, I've been with Apple for about 2 years now. Are you looking to transition into UX design?",
      timestamp: "2023-02-28T16:35:00Z",
      isRead: true,
    },
    {
      id: "msg3",
      senderId: "current-user",
      text: "I have a background in front-end development but have been doing more and more UI/UX work lately. I'd love to hear about your experience at Apple.",
      timestamp: "2023-02-28T16:40:00Z",
      isRead: true,
    },
    {
      id: "msg4",
      senderId: "user3",
      text: "Could you send me your portfolio? I'd like to share it with the hiring manager.",
      timestamp: "2023-02-28T16:45:00Z",
      isRead: true,
    },
  ],
}
