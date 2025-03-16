// app/home/@navigation/default.tsx
"use client"

import Link from 'next/link';
import { Home, User, Bell, Mail, Bookmark, Settings, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { EB_Garamond, Inter } from 'next/font/google';

// Extend the User type to include username
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const inter = Inter({ subsets: ["latin"] });
export default function Navigation() {
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser | undefined;
  
  return (
    <div className={`flex items-center justify-between px-[60px] w-full  h-full ${inter.className}  `}>

    <div className="flex flex-col h-full px-3 py-2">
      <div className="mb-4">
        <h1 className={` text-4xl  ${garamond.className} font-medium bg-clip-text leading-relaxed text-transparent bg-gradient-to-r to-slate-100 from-[#fc7348]`}>Tingle</h1>
      </div>
      
      <nav className="space-y-4 flex-1">
        <Link href="/home" className="flex items-center w-[160px] transition-shadow duration-200 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.75px_0.65px_rgba(255,255,255,0.10)]  gap-2 py-1 px-3 bg-gradient-to-b from-transparent to-[#fc7348]/5 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)]  rounded-lg text-white">
          <Home color='#fc7348' strokeWidth={1} className="w-5 h-5" />
          <span className=" font-light text-[14px] ">Home</span>
        </Link>
        
        <Link 
          href="/home/profile" 
          className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-white"
        >
          <User   strokeWidth={1} className="w-5 h-5" />
          <span className="font-light text-[14px] ">Profile</span>
        </Link>
        
        <Link href="/notifications" className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-white">
          <Bell strokeWidth={1} className="w-5 h-5" />
          <span className="font-light text-[14px] ">Notifications</span>
        </Link>
        
        <Link href="/messages" className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-white">
          <Mail strokeWidth={1} className="w-5 h-5" />
          <span className="font-light text-[14px] ">Messages</span>
        </Link>
        
        <Link href="/bookmarks" className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-white">
          <Bookmark strokeWidth={1} className="w-5 h-5" />
          <span className="font-light text-[14px] ">Bookmarks</span>
        </Link>
        
        <Link href="/settings" className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-white">
          <Settings strokeWidth={1} className="w-5 h-5" />
          <span className="font-light text-[14px] ">Settings</span>
        </Link>
      </nav>
      
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 py-1 px-3 hover:bg-gradient-to-b hover:from-transparent hover:to-[#fc7348]/20 hover:from-[20%] overflow-hidden hover:shadow-[0px_1px_2px_rgba(0,0,0,0.25),inset_0px_0.8px_1.4px_rgba(255,255,255,0.10)] transition-all duration-200 rounded-lg text-red-400"
      >
        <LogOut strokeWidth={1} className="w-5 h-5" />
        <span className="font-light text-[14px] ">Logout</span>
      </button>
    </div>
    <div className="w-[4px] h-full  shadow-[0px_0.5px_1px_rgba(255,255,255,0.1),inset_-0.4px_0.2px_0px_rgba(0,0,0,0.7),inset_0.4px_0.2px_0px_rgba(0,0,0,0.7)] bg-black/5 "></div>

    </div>
  );
}