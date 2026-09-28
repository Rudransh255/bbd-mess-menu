import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) redirect('/admin/login');

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id,email,display_name,role')
    .eq('user_id', userId)
    .eq('active', true)
    .eq('role', 'admin')
    .maybeSingle();

  if (!admin) redirect('/admin/login?error=not_authorised');
  return { supabase, admin };
}
