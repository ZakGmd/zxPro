import { UserProfile } from "@/components/profile/user-profile"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Profile",
  description: "View user profile",
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return <UserProfile userId={params.userId} />
} 