"use client"

import { usePathname } from 'next/navigation';
import { NextAuthProvider } from "@/components/providers/session-provider";

// app/home/layout.tsx
export default function HomeLayout({
    children,
    navigation,
    messages,
    profile,
  }: {
    children: React.ReactNode;
    navigation: React.ReactNode;
    messages: React.ReactNode;
    profile?: React.ReactNode;
  }) {
    const pathname = usePathname();
    const isProfileRoute = pathname === '/home/profile';

    return (
      <NextAuthProvider>
        <div className=" grid grid-cols-12 w-full  text-white bg-[#1D1D1F]">
          <div className="hidden md:block col-span-3  bg-gradient-to-b to-[#fc7348] to-[490%] from-[70%] from-[#1D1D1F]">
            {navigation}
          </div>
          <main className="w-full border-r col-span-6 border-gray-800 bg-gradient-to-b to-[#fc7348] to-[490%] from-[70%] from-[#1D1D1F]">
            {isProfileRoute ? profile : children}
          </main>
          <div className="hidden lg:block border-l col-span-3 border-gray-800 bg-gradient-to-b to-[#fc7348] to-[490%] from-[70%] from-[#1D1D1F]">
            {messages}
          </div>
        </div>
      </NextAuthProvider>
    );
  }