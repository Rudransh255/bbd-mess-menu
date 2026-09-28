create or replace function public.create_weekly_draft(p_week_start date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare draft_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin access required'; end if;
  if extract(isodow from p_week_start) <> 1 then raise exception 'Week must start on Monday'; end if;
  insert into public.menu_weeks (week_start) values (p_week_start) returning id into draft_id;
  insert into public.meals (menu_week_id, date, meal_type, start_time, end_time, sort_order)
  select draft_id, p_week_start + day_offset, meal_type,
    case when meal_type = 'breakfast' and day_offset >= 5 then time '08:30' else start_time end,
    case when meal_type = 'breakfast' and day_offset >= 5 then time '09:30' else end_time end, sort_order
  from generate_series(0, 6) as days(day_offset)
  cross join (values ('breakfast',time '08:00',time '09:00',1),('lunch',time '13:00',time '14:00',2),('evening_tea',time '17:00',time '18:00',3),('dinner',time '20:00',time '21:00',4)) schedule(meal_type,start_time,end_time,sort_order);
  return draft_id;
end; $$;

create or replace function public.save_weekly_draft(p_menu_week_id uuid, p_meals jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare meal jsonb; target_meal_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin access required'; end if;
  if not exists (select 1 from public.menu_weeks where id=p_menu_week_id and status='draft') then raise exception 'Only drafts can be edited'; end if;
  if jsonb_typeof(p_meals)<>'array' or jsonb_array_length(p_meals)<>28 then raise exception 'A weekly menu requires 28 meals'; end if;
  for meal in select value from jsonb_array_elements(p_meals) loop
    target_meal_id := (meal->>'id')::uuid;
    if not exists (select 1 from public.meals where id=target_meal_id and menu_week_id=p_menu_week_id) then raise exception 'Invalid meal'; end if;
    update public.meals set start_time=(meal->>'start_time')::time,end_time=(meal->>'end_time')::time,notes=nullif(btrim(meal->>'notes'),'') where id=target_meal_id;
    delete from public.menu_items where meal_id=target_meal_id;
    insert into public.menu_items(meal_id,name,sort_order)
    select target_meal_id,btrim(value),ordinality::smallint from jsonb_array_elements_text(meal->'items') with ordinality where char_length(btrim(value)) between 1 and 120;
  end loop;
  update public.menu_weeks set verified_at=null,verified_by=null where id=p_menu_week_id;
end; $$;

create or replace function public.verify_menu_draft(p_menu_week_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Admin access required'; end if;
  if (select count(*) from public.meals where menu_week_id=p_menu_week_id)<>28 or exists(select 1 from public.meals m where m.menu_week_id=p_menu_week_id and not exists(select 1 from public.menu_items i where i.meal_id=m.id)) then raise exception 'Every meal needs at least one food item before verification'; end if;
  update public.menu_weeks set verified_at=now(),verified_by=(select auth.uid()) where id=p_menu_week_id and status='draft';
  if not found then raise exception 'Draft not found'; end if;
end; $$;

create or replace function public.publish_menu_draft(p_menu_week_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Admin access required'; end if;
  update public.menu_weeks set status='published' where id=p_menu_week_id and status='draft';
  if not found then raise exception 'Draft not found'; end if;
end; $$;

revoke all on function public.create_weekly_draft(date) from public,anon,authenticated;
revoke all on function public.save_weekly_draft(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.verify_menu_draft(uuid) from public,anon,authenticated;
revoke all on function public.publish_menu_draft(uuid) from public,anon,authenticated;
grant execute on function public.create_weekly_draft(date) to authenticated;
grant execute on function public.save_weekly_draft(uuid,jsonb) to authenticated;
grant execute on function public.verify_menu_draft(uuid) to authenticated;
grant execute on function public.publish_menu_draft(uuid) to authenticated;
