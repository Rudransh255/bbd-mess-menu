import { requireAdmin } from '@/lib/auth/require-admin';
import Link from 'next/link';
import { signOut } from './actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><header className="admin-header"><Link href="/admin" className="admin-brand">BBD MESS <span>ADMIN</span></Link><nav aria-label="Admin navigation"><Link href="/admin">Dashboard</Link><Link href="/admin/menu">Menus</Link></nav><form action={signOut}><button className="admin-signout" type="submit">Sign out</button></form></header>{children}</div>;
}
