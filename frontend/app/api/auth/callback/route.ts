import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    const description = url.searchParams.get('error_description') ?? error;
    return new Response(`Authorization denied: ${description}`, { status: 400 });
  }

  const cookieStore = await cookies();
  const code_verifier = cookieStore.get('code_verifier')?.value;
  const savedState = cookieStore.get('state')?.value;

  if (!code || !state || !code_verifier || state !== savedState) {
    return new Response('Invalid state or OAuth code', { status: 400 });
  }

  // Generate tokens by exchanging the code + PKCE verifier
  // In Docker, the Next JS server accesses the Laravel API over localhost ports since compose network resolves it or locally via AUTH_URL.
  // We use process.env.AUTH_URL which points to http://localhost:8000 (usually fine on the host, but between containers we might need an internal URL, however with Docker Compose host networking/port maps `localhost:8000` often works due to loopback/network driver configurations, or the user fixes AUTH_URL). 
  // Let's rely on standard fetch.
  const backendEndpoint = process.env.API_URL || process.env.AUTH_URL;
  
  try {
    const tokenResponse = await fetch(`${backendEndpoint}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        code_verifier: code_verifier,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange token:', await tokenResponse.text());
      return new Response('Failed to exchange token with backend', { status: 400 });
    }

    const tokens = await tokenResponse.json();

    // Store the access token securely in an HttpOnly cookie so the frontend is protected
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: tokens.expires_in,
      sameSite: 'lax',
    });

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }
  } catch (error) {
    console.error('Auth callback fetch error', error);
    return new Response('Network error during token exchange', { status: 500 });
  } finally {
    // Clear the sensitive temporary PKCE cookies
    cookieStore.delete('code_verifier');
    cookieStore.delete('state');
  }

  // Redirect the user back to the homepage perfectly authenticated!
  redirect('/');
}
