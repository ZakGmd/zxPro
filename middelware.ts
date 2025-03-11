
import NextAuth from "next-auth";
import authConfig from "./auth.config"

 
 const { auth }  = NextAuth(authConfig)


export default auth((req) => {

  const isLoggedIn = !!req.auth;

  
  if (isLoggedIn && !req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/dashboard', req.url))
  }
 
  if (!isLoggedIn && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/', req.url))
  }

  console.log("ROUTE :",req.nextUrl.pathname);
  console.log("Is Loggedin" , isLoggedIn) ;

});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};