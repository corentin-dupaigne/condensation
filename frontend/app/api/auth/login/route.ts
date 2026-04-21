import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function base64URLEncode(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET() {
  if (!process.env.AUTH_URL || !process.env.CLIENT_ID || !process.env.REDIRECT_URI) {
    return new Response('OAuth configuration error inside environment variables', { status: 500 });
  }

  const code_verifier = base64URLEncode(crypto.randomBytes(32));
  const code_challenge = base64URLEncode(
    crypto.createHash('sha256').update(code_verifier).digest()
  );

  const state = base64URLEncode(crypto.randomBytes(16));

  const cookieStore = await cookies();
  cookieStore.set('code_verifier', code_verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
  });
  cookieStore.set('state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
  });

  const authUrl = new URL(`${process.env.AUTH_URL}/auth/oauth-init`);
  authUrl.searchParams.append('client_id', process.env.CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', '*'); 
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', code_challenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  redirect(authUrl.toString());
}
