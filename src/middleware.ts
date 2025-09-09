import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Redirect to /auth/login if token is absent on pages / and /start
    if (!token && (pathname === '/' || pathname === '/start')) {
        console.log('No token found, redirecting to /auth/login');
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Redirect to / if token is present on pages /auth/login and /auth/register
    if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
        console.log('Token found, redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/start', '/auth/login', '/auth/register'],
};