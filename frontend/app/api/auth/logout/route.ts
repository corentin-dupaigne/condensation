import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // Revoke the token on the backend before clearing cookies.
  // Use the internal API_URL (server-to-server) so the browser never touches it.
  if (accessToken) {
    const backendApi = process.env.API_URL || process.env.AUTH_URL || 'http://localhost:8000';
    try {
      await fetch(`${backendApi}/api/auth/token/revoke`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });
    } catch {
      // Continue with logout even if revocation fails (token will expire on its own)
    }
  }

  // Redirect the browser to the backend to also destroy the Laravel web session,
  // then delete the cookies on the redirect response (not via cookieStore, which
  // may not be flushed when a NextResponse.redirect is returned).
  const backendAuth = process.env.AUTH_URL || 'http://localhost:8000';
  const response = NextResponse.redirect(`${backendAuth}/auth/logout`);
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}
