import { NextResponse, type NextRequest } from 'next/server'

// Auth is handled at the page level via supabase server client.
// Middleware is kept minimal to avoid Edge runtime compatibility issues.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
