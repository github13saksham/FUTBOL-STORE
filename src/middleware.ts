import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session')?.value;
    const isLoginPage = pathname === '/admin/login';
    
    // If not logged in and trying to access a protected admin route
    if (!adminSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If already logged in and trying to access the login page
    if (adminSession && isLoginPage) {
      const dashboardUrl = new URL('/admin', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
