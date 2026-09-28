import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/require-admin';
import { SubmitButton } from '@/app/admin/components/submit-button';
import { createDraft } from './actions';
export default async function MenusPage({searchParams}:{searchParams:Promise<{error?:string;published?:string}>}) {
  const {error,published}=await searchParams; const {supabase}=await requireAdmin();
  const {data:menus}=await supabase.from('menu_weeks').select('id,week_start,status,verified_at,updated_at').order('week_start',{ascending:false});
  return <main className="admin-page"><div className="admin-page-head"><div><p className="eyebrow">ADMIN / MENUS</p><h1>Weekly menus</h1><p>Create a private draft before changing anything students can see.</p></div></div>{error&&<p className="admin-alert error" role="alert">{error}</p>}{published&&<p className="admin-alert success" role="status">Menu published successfully.</p>}<section className="admin-panel"><h2>New weekly draft</h2><form action={createDraft} className="create-draft-form"><label htmlFor="week-start">Week starts on Monday</label><input id="week-start" name="week_start" type="date" required/><SubmitButton>CREATE PRIVATE DRAFT</SubmitButton></form></section><section className="admin-panel"><h2>Menu records</h2>{!menus?.length?<p className="admin-empty">No menu drafts yet.</p>:<div className="admin-menu-list">{menus.map(menu=><article key={menu.id}><div><span className={`admin-status ${menu.status}`}>{menu.status}</span><h3>Week of {menu.week_start}</h3><p>{menu.verified_at?'Verified and ready for publishing':'Not verified'}</p></div><Link className="secondary-button" href={`/admin/menu/${menu.id}`}>{menu.status==='draft'?'EDIT DRAFT':'VIEW MENU'}</Link></article>)}</div>}</section></main>;
}
