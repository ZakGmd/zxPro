import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

// Function to generate a username from email or name
function generateUsername(name: string, email: string) {
  // Remove spaces, make lowercase, and remove special characters
  if (name) {
    const username = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    return username;
  }
  
  // If no name, use email username part
  return email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Function to ensure username is unique by adding a number if needed
async function ensureUniqueUsername(baseUsername: string) {
  // Check if username exists
  const existingUser = await prisma.user.findUnique({
    where: { username: baseUsername },
  });
  
  if (!existingUser) {
    return baseUsername;
  }
  
  // If username exists, add a number
  let counter = 1;
  let username = `${baseUsername}${counter}`;
  
  while (true) {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    
    if (!user) {
      return username;
    }
    
    counter++;
    username = `${baseUsername}${counter}`;
  }
}

export const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: any) => {
    const { name, email } = data;
    
    // Generate a username
    const baseUsername = generateUsername(name || "", email);
    const username = await ensureUniqueUsername(baseUsername);
    
    // Create the user with a username
    const user = await prisma.user.create({
      data: {
        ...data,
        username,
        // No need to set password as it's now optional
      },
    });
    
    return user;
  },
}; 