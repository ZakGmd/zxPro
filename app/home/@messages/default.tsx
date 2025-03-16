// app/home/@messages/default.tsx
"use client";

import { SearchBar } from "@/components/search/search-bar";

export default function Messages() {
  return (
    <div className="h-full p-4">
      <SearchBar />
      <h2 className="text-xl font-bold mb-4 text-white">Messages</h2>
      <div className="text-gray-400 text-center mt-8">
        <p>No messages yet. Start a conversation!</p>
      </div>
    </div>
  );
}