import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Clean up the secure PKCE tokens stored on the client side
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  // Immediately dump the user back seamlessly to the unauthenticated homepage
  // via the backend to destroy the origin Laravel persistence session too!
  const backendAuth = process.env.AUTH_URL || 'http://localhost:8000';
  return NextResponse.redirect(`${backendAuth}/auth/logout`);
}
