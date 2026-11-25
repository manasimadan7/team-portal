import { createContext, useContext } from 'react'

/** Lets any page open the chat plugin on a given conversation (member name or space id). */
export const ChatContext = createContext<{ openChat: (id: string) => void }>({ openChat: () => {} })
export const useChat = () => useContext(ChatContext)
