create or replace function public.clone_published_menu(p_menu_week_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_week public.menu_weeks%rowtype;
  source_meal public.meals%rowtype;
  draft_id uuid;
  cloned_meal_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Administrator access required';
  end if;

  select * into source_week
  from public.menu_weeks
  where id = p_menu_week_id and status = 'published';

  if not found then
    raise exception 'Published menu not found';
  end if;

  if (select count(*) from public.meals where menu_week_id = source_week.id) <> 28 then
    raise exception 'Published menu must contain all 28 meals';
  end if;

  insert into public.menu_weeks (week_start, status, source_type)
  values (source_week.week_start, 'draft', 'manual_edit')
  returning id into draft_id;

  for source_meal in
    select * from public.meals
    where menu_week_id = source_week.id
    order by date, sort_order
  loop
    insert into public.meals (
      menu_week_id, date, meal_type, start_time, end_time, notes, sort_order
    ) values (
      draft_id, source_meal.date, source_meal.meal_type,
      source_meal.start_time, source_meal.end_time,
      source_meal.notes, source_meal.sort_order
    ) returning id into cloned_meal_id;

    insert into public.menu_items (meal_id, name, sort_order)
    select cloned_meal_id, name, sort_order
    from public.menu_items
    where meal_id = source_meal.id
    order by sort_order;
  end loop;

  return draft_id;
end;
$$;

revoke all on function public.clone_published_menu(uuid) from public, anon, authenticated;
grant execute on function public.clone_published_menu(uuid) to authenticated;
