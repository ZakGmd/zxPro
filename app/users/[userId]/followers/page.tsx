import { UserList } from "@/components/profile/user-list"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Followers",
  description: "People who follow this user",
}

export default function FollowersPage({ params }: { params: { userId: string } }) {
  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 backdrop-blur-md bg-[#1D1D1F]/80 border-b border-gray-800">
        <Link href={`/users/${params.userId}`} className="mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Followers</h1>
        </div>
      </header>

      <UserList userId={params.userId} type="followers" />
    </div>
  )
} 