'use server';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
export async function signOut() { const { supabase }=await requireAdmin(); await supabase.auth.signOut(); redirect('/admin/login'); }
