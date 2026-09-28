create schema if not exists private;

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  display_name text,
  role text not null default 'admin' check (role = 'admin'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
      and role = 'admin'
      and active
  );
$$;

create table public.menu_weeks (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source_type text not null default 'manual_edit' check (source_type in ('manual_edit', 'image_import')),
  verified_at timestamptz,
  verified_by uuid references public.admins(user_id),
  published_at timestamptz,
  published_by uuid references public.admins(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((verified_at is null) = (verified_by is null)),
  check ((published_at is null) = (published_by is null))
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  menu_week_id uuid not null references public.menu_weeks(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'evening_tea', 'dinner')),
  start_time time not null,
  end_time time not null,
  notes text check (char_length(notes) <= 500),
  sort_order smallint not null check (sort_order between 1 and 4),
  unique (menu_week_id, date, meal_type),
  unique (menu_week_id, date, sort_order),
  check (end_time > start_time)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  sort_order smallint not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique (meal_id, sort_order)
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.menu_imports (
  id uuid primary key default gen_random_uuid(),
  menu_week_id uuid references public.menu_weeks(id) on delete set null,
  uploaded_by uuid not null references public.admins(user_id),
  image_path text not null,
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'processing', 'review_required', 'verified', 'failed')),
  raw_extraction jsonb,
  reviewed_at timestamptz,
  reviewed_by uuid references public.admins(user_id),
  created_at timestamptz not null default now(),
  check ((reviewed_at is null) = (reviewed_by is null)),
  check (processing_status <> 'verified' or reviewed_at is not null)
);

create table public.publish_history (
  id uuid primary key default gen_random_uuid(),
  menu_week_id uuid not null references public.menu_weeks(id) on delete restrict,
  published_by uuid not null references public.admins(user_id),
  version_number integer not null check (version_number > 0),
  source_type text not null check (source_type in ('manual_edit', 'image_import')),
  previous_version_id uuid references public.publish_history(id),
  snapshot jsonb not null,
  published_at timestamptz not null default now(),
  unique (menu_week_id, version_number)
);

create index menu_weeks_week_start_idx on public.menu_weeks (week_start);
create unique index one_published_menu_per_week_idx on public.menu_weeks (week_start) where status = 'published';
create index meals_date_idx on public.meals (date);
create index meals_menu_week_id_idx on public.meals (menu_week_id);
create index ratings_meal_id_idx on public.ratings (meal_id);
create index ratings_created_at_idx on public.ratings (created_at);
create index feedback_meal_id_idx on public.feedback (meal_id);
create index feedback_created_at_idx on public.feedback (created_at);
create index menu_imports_menu_week_id_idx on public.menu_imports (menu_week_id);
create index publish_history_menu_week_id_idx on public.publish_history (menu_week_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_menu_weeks_updated_at
before update on public.menu_weeks
for each row execute function private.set_updated_at();

create or replace function private.guard_menu_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    if not private.is_admin() then
      raise exception 'Only an active admin can publish a menu';
    end if;

    if new.verified_at is null or new.verified_by is distinct from (select auth.uid()) then
      raise exception 'The publishing admin must verify the menu before publishing';
    end if;

    if new.source_type = 'image_import' and not exists (
      select 1
      from public.menu_imports
      where menu_week_id = new.id
        and processing_status = 'verified'
        and reviewed_at is not null
        and reviewed_by = (select auth.uid())
    ) then
      raise exception 'Imported menu transcription requires admin review before publishing';
    end if;

    update public.menu_weeks
    set status = 'archived'
    where week_start = new.week_start
      and status = 'published'
      and id <> new.id;

    new.published_at = now();
    new.published_by = (select auth.uid());
  end if;

  return new;
end;
$$;

create trigger guard_menu_publication
before insert or update of status on public.menu_weeks
for each row execute function private.guard_menu_publication();

create or replace function private.record_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_version integer;
  prior_version uuid;
  menu_snapshot jsonb;
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    select coalesce(max(version_number), 0) + 1,
           (array_agg(id order by version_number desc))[1]
      into next_version, prior_version
    from public.publish_history
    where menu_week_id = new.id;

    select jsonb_build_object(
      'menu_week', to_jsonb(new),
      'meals', coalesce(jsonb_agg(
        to_jsonb(m) || jsonb_build_object(
          'items', coalesce((
            select jsonb_agg(to_jsonb(i) order by i.sort_order)
            from public.menu_items i
            where i.meal_id = m.id
          ), '[]'::jsonb)
        ) order by m.date, m.sort_order
      ), '[]'::jsonb)
    ) into menu_snapshot
    from public.meals m
    where m.menu_week_id = new.id;

    insert into public.publish_history (
      menu_week_id, published_by, version_number, source_type,
      previous_version_id, snapshot, published_at
    ) values (
      new.id, new.published_by, next_version, new.source_type,
      prior_version, menu_snapshot, new.published_at
    );
  end if;

  return new;
end;
$$;

create trigger record_menu_publication
after insert or update of status on public.menu_weeks
for each row execute function private.record_publication();

alter table public.admins enable row level security;
alter table public.menu_weeks enable row level security;
alter table public.meals enable row level security;
alter table public.menu_items enable row level security;
alter table public.ratings enable row level security;
alter table public.feedback enable row level security;
alter table public.menu_imports enable row level security;
alter table public.publish_history enable row level security;

revoke all on public.admins, public.menu_weeks, public.meals, public.menu_items,
  public.ratings, public.feedback, public.menu_imports, public.publish_history
  from anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.guard_menu_publication() from public, anon, authenticated;
revoke all on function private.record_publication() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

grant select on public.menu_weeks, public.meals, public.menu_items to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.menu_weeks, public.meals, public.menu_items to authenticated;
grant insert (meal_id, rating) on public.ratings to anon, authenticated;
grant insert (meal_id, rating, message) on public.feedback to anon, authenticated;
grant select, update, delete on public.ratings, public.feedback to authenticated;
grant select, insert, update, delete on public.menu_imports to authenticated;
grant select on public.publish_history to authenticated;

create policy "Admins can view their own allowlist row"
on public.admins for select to authenticated
using (user_id = (select auth.uid()) and active);

create policy "Published menu weeks are public"
on public.menu_weeks for select to anon, authenticated
using (status = 'published' or (select private.is_admin()));

create policy "Admins manage menu weeks"
on public.menu_weeks for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Published meals are public"
on public.meals for select to anon, authenticated
using (
  exists (
    select 1 from public.menu_weeks w
    where w.id = menu_week_id and w.status = 'published'
  ) or (select private.is_admin())
);

create policy "Admins manage meals"
on public.meals for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Published menu items are public"
on public.menu_items for select to anon, authenticated
using (
  exists (
    select 1
    from public.meals m
    join public.menu_weeks w on w.id = m.menu_week_id
    where m.id = meal_id and w.status = 'published'
  ) or (select private.is_admin())
);

create policy "Admins manage menu items"
on public.menu_items for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Anyone can rate a published meal"
on public.ratings for insert to anon, authenticated
with check (
  exists (
    select 1
    from public.meals m
    join public.menu_weeks w on w.id = m.menu_week_id
    where m.id = meal_id and w.status = 'published'
  )
);

create policy "Admins can read ratings"
on public.ratings for select to authenticated
using ((select private.is_admin()));

create policy "Admins can manage ratings"
on public.ratings for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete ratings"
on public.ratings for delete to authenticated
using ((select private.is_admin()));

create policy "Anyone can submit feedback for a published meal"
on public.feedback for insert to anon, authenticated
with check (
  exists (
    select 1
    from public.meals m
    join public.menu_weeks w on w.id = m.menu_week_id
    where m.id = meal_id and w.status = 'published'
  )
);

create policy "Admins can read feedback"
on public.feedback for select to authenticated
using ((select private.is_admin()));

create policy "Admins can manage feedback"
on public.feedback for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete feedback"
on public.feedback for delete to authenticated
using ((select private.is_admin()));

create policy "Admins view menu imports"
on public.menu_imports for select to authenticated
using ((select private.is_admin()));

create policy "Admins create menu imports"
on public.menu_imports for insert to authenticated
with check ((select private.is_admin()) and uploaded_by = (select auth.uid()));

create policy "Admins update menu imports"
on public.menu_imports for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete menu imports"
on public.menu_imports for delete to authenticated
using ((select private.is_admin()));

create policy "Admins view publish history"
on public.publish_history for select to authenticated
using ((select private.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mess-menu-imports',
  'mess-menu-imports',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read menu import images"
on storage.objects for select to authenticated
using (bucket_id = 'mess-menu-imports' and (select private.is_admin()));

create policy "Admins can upload menu import images"
on storage.objects for insert to authenticated
with check (bucket_id = 'mess-menu-imports' and (select private.is_admin()));

create policy "Admins can update menu import images"
on storage.objects for update to authenticated
using (bucket_id = 'mess-menu-imports' and (select private.is_admin()))
with check (bucket_id = 'mess-menu-imports' and (select private.is_admin()));

create policy "Admins can delete menu import images"
on storage.objects for delete to authenticated
using (bucket_id = 'mess-menu-imports' and (select private.is_admin()));
