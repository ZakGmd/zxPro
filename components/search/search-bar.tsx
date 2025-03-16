"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { SearchModal } from "./search-modal"

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="relative w-full" onClick={() => setIsOpen(true)}>
        <div className="flex items-center gap-4 w-full rounded-full bg-[#202327] px-4 py-3 text-gray-400 cursor-text">
          <Search className="w-5 h-5" />
          <span>Search</span>
        </div>
      </div>

      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
} 