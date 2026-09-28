import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
export default async function AdminPage() {
  const { supabase,admin }=await requireAdmin();
  const { data:menus }=await supabase.from('menu_weeks').select('id,status,week_start,updated_at').order('updated_at',{ascending:false}).limit(5);
  return <main className="admin-page"><div className="admin-page-head"><div><p className="eyebrow">BBD MESS / ADMIN</p><h1>Dashboard</h1><p>Welcome, {admin.display_name||admin.email}.</p></div><Link className="primary-button" href="/admin/menu">MANAGE MENUS</Link></div><section className="admin-stats" aria-label="Menu summary"><article><strong>{menus?.filter(m=>m.status==='draft').length??0}</strong><span>Recent drafts</span></article><article><strong>{menus?.filter(m=>m.status==='published').length??0}</strong><span>Published menus</span></article><article><strong>{menus?.length??0}</strong><span>Recent records</span></article></section><section className="admin-panel"><h2>Publishing rule</h2><p>Every menu stays private until it is reviewed, verified and explicitly published.</p></section></main>;
}
