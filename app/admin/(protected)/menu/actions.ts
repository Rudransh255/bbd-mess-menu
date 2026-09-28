'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function fail(path:string,message:string):never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
export async function createDraft(formData:FormData) {
  const weekStart=String(formData.get('week_start')??'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) fail('/admin/menu','Choose a valid Monday.');
  const {supabase}=await requireAdmin(); const {data,error}=await supabase.rpc('create_weekly_draft',{p_week_start:weekStart});
  if(error||!data) fail('/admin/menu',error?.message??'Draft could not be created.'); redirect(`/admin/menu/${data}`);
}
export async function editPublishedMenu(menuId:string) {
  if(!uuid.test(menuId)) fail('/admin/menu','Invalid menu.');
  const {supabase}=await requireAdmin(); const {data,error}=await supabase.rpc('clone_published_menu',{p_menu_week_id:menuId});
  if(error||!data) fail('/admin/menu',error?.message??'The edit draft could not be created.');
  revalidatePath('/admin/menu'); redirect(`/admin/menu/${data}?cloned=1`);
}
export async function saveDraft(menuId:string,formData:FormData) {
  if(!uuid.test(menuId)) fail('/admin/menu','Invalid menu.');
  const {supabase}=await requireAdmin(); const {data:meals,error:mealError}=await supabase.from('meals').select('id').eq('menu_week_id',menuId);
  if(mealError||meals?.length!==28) fail(`/admin/menu/${menuId}`,'The draft does not contain all 28 meals.');
  const payload=meals.map(({id})=>({id,start_time:String(formData.get(`start_${id}`)??''),end_time:String(formData.get(`end_${id}`)??''),notes:String(formData.get(`notes_${id}`)??'').slice(0,500),items:String(formData.get(`items_${id}`)??'').split('\n').map(x=>x.trim()).filter(Boolean)}));
  if(payload.some(m=>!/^\d{2}:\d{2}$/.test(m.start_time)||!/^\d{2}:\d{2}$/.test(m.end_time)||m.items.some(x=>x.length>120))) fail(`/admin/menu/${menuId}`,'Check timings and keep item names under 120 characters.');
  const {error}=await supabase.rpc('save_weekly_draft',{p_menu_week_id:menuId,p_meals:payload}); if(error) fail(`/admin/menu/${menuId}`,error.message);
  revalidatePath(`/admin/menu/${menuId}`); redirect(`/admin/menu/${menuId}?saved=1`);
}
export async function verifyDraft(menuId:string) {
  if(!uuid.test(menuId)) fail('/admin/menu','Invalid menu.'); const {supabase}=await requireAdmin();
  const {error}=await supabase.rpc('verify_menu_draft',{p_menu_week_id:menuId}); if(error) fail(`/admin/menu/${menuId}/preview`,error.message);
  revalidatePath(`/admin/menu/${menuId}/preview`); redirect(`/admin/menu/${menuId}/preview?verified=1`);
}
export async function publishDraft(menuId:string) {
  if(!uuid.test(menuId)) fail('/admin/menu','Invalid menu.'); const {supabase}=await requireAdmin();
  const {error}=await supabase.rpc('publish_menu_draft',{p_menu_week_id:menuId}); if(error) fail(`/admin/menu/${menuId}/preview`,error.message);
  revalidatePath('/','layout'); redirect('/admin/menu?published=1');
}
