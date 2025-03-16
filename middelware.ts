import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  
  const { pathname } = req.nextUrl;
  
  // Paths that don't require authentication
  const publicPaths = ['/', '/sign-in', '/sign-up'];
  
  // Check if the path requires authentication
  const isPublicPath = publicPaths.includes(pathname);
  
  // If user is not authenticated and the path is not public, redirect to sign-in
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  
  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  
  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ['/', '/sign-in', '/sign-up', '/home/:path*']
};