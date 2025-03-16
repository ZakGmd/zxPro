"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchBar } from "./search/search-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Bell, Home, MessageSquare, PlusCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { useEffect, useState } from "react"

export function NavBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread message count
  useEffect(() => {
    if (!user?.id) return
    
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages')
        if (!response.ok) return
        
        const conversations = await response.json()
        const total = conversations.reduce(
          (sum: number, conversation: { unreadCount: number }) => 
            sum + (conversation.unreadCount || 0), 
          0
        )
        
        setUnreadCount(total)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }
    
    fetchUnreadCount()
    
    // Poll for new messages every minute
    const intervalId = setInterval(fetchUnreadCount, 60000)
    
    return () => clearInterval(intervalId)
  }, [user?.id])

  if (!user) return null

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#1D1D1F]/80 backdrop-blur-md border-b border-gray-800 z-10">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/home" className="text-xl font-bold text-white">
            Tingle
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/home" className={`text-gray-400 hover:text-white ${pathname === '/home' ? 'text-white' : ''}`}>
            <Home className="w-6 h-6" />
          </Link>
          
          <Link href="/notifications" className={`text-gray-400 hover:text-white ${pathname === '/notifications' ? 'text-white' : ''}`}>
            <Bell className="w-6 h-6" />
          </Link>
          
          <Link href="/messages" className={`relative text-gray-400 hover:text-white ${pathname.startsWith('/messages') ? 'text-white' : ''}`}>
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-5 h-5 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-[10px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Link>

          <Button className="rounded-full" size="sm">
            <PlusCircle className="w-5 h-5 mr-1" />
            <span>Post</span>
          </Button>
          
          <Link href="/users/me" className="ml-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || "User"} />
              <AvatarFallback className="bg-blue-600">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
} 