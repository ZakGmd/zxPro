// components/posts/PostForm.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";


export default function PostForm() {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 280;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "" && !imageFile) return;
    
    setIsLoading(true);
    
    try {
      let uploadedImageUrl = null;
      
      // If you have image upload functionality:
      if (imageFile) {
        // Create FormData and upload to your image hosting
        const formData = new FormData();
        formData.append("file", imageFile);
        
        // This is a placeholder - replace with your actual image upload endpoint
        // const uploadRes = await fetch("/api/upload", {
        //   method: "POST",
        //   body: formData,
        // });
        // const uploadData = await uploadRes.json();
        // uploadedImageUrl = uploadData.url;
        
        // For now, we'll use the Data URL as a placeholder
        uploadedImageUrl = image;
      }
      
      // Create the post
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          image: uploadedImageUrl,
        }),
      });
      
      if (response.ok) {
        setText("");
        setImage(null);
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // You could add a refresh function here or use SWR/React Query to update the feed
        window.location.reload(); // Simple refresh for now
      } else {
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white/20">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={session?.user?.image || "/placeholder-avatar.png"}
              alt={session?.user?.name || "User"}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          
          {/* Post Content */}
          <div className="flex-grow">
            <textarea
              placeholder="What's happening?"
              value={text}
              onChange={handleTextChange}
              className="w-full border-0 focus:ring-0 text-lg resize-none h-24"
              disabled={isLoading}
            />
            
            {/* Image Preview */}
            {image && (
              <div className="relative mt-2 mb-3">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-full bg-black bg-opacity-70 p-1 text-white hover:bg-opacity-80"
                  >
                   
                  </button>
                </div>
                <Image
                  src={image}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="rounded-lg max-h-80 w-auto object-contain"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                  disabled={isLoading}
                >
                
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {text.length}/{maxLength}
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isLoading || (text.trim() === "" && !image)}
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}