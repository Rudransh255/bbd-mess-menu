import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/admin/login?error=callback_failed', url));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/admin/login?error=callback_failed', url));

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const { data: admin } = userId
    ? await supabase.from('admins').select('user_id').eq('user_id', userId).eq('active', true).eq('role', 'admin').maybeSingle()
    : { data: null };

  if (!admin) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/admin/login?error=not_authorised', url));
  }

  return NextResponse.redirect(new URL('/admin', url));
}
