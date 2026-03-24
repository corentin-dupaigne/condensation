import { redirect } from 'next/navigation';

export async function GET() {
  const authUrl = process.env.AUTH_URL || 'http://localhost:8000';
  redirect(`${authUrl}/register`);
}
