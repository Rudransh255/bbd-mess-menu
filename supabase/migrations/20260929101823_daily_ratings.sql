create table public.daily_ratings (
  id bigint generated always as identity primary key,
  service_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'evening_tea', 'dinner')),
  rating smallint not null check (rating between 1 and 5),
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  unique (service_date, meal_type, voter_id)
);

alter table public.daily_ratings enable row level security;
revoke all on public.daily_ratings from anon, authenticated;

create or replace function public.get_daily_rating_counts(p_service_date date, p_meal_type text)
returns table (rating smallint, total bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select score::smallint, count(r.id)::bigint
  from generate_series(1, 5) score
  left join public.daily_ratings r
    on r.service_date = p_service_date
   and r.meal_type = p_meal_type
   and r.rating = score
  where p_meal_type in ('breakfast', 'lunch', 'evening_tea', 'dinner')
  group by score
  order by score;
$$;

create or replace function public.submit_daily_rating(
  p_service_date date,
  p_meal_type text,
  p_rating smallint,
  p_voter_id uuid
)
returns table (rating smallint, total bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_service_date <> (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'Ratings can only be submitted for today';
  end if;
  if p_meal_type not in ('breakfast', 'lunch', 'evening_tea', 'dinner') then
    raise exception 'Invalid meal';
  end if;
  if p_rating not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  insert into public.daily_ratings (service_date, meal_type, rating, voter_id)
  values (p_service_date, p_meal_type, p_rating, p_voter_id)
  on conflict (service_date, meal_type, voter_id)
  do update set rating = excluded.rating, created_at = now();

  return query select * from public.get_daily_rating_counts(p_service_date, p_meal_type);
end;
$$;

revoke all on function public.get_daily_rating_counts(date, text) from public, anon, authenticated;
revoke all on function public.submit_daily_rating(date, text, smallint, uuid) from public, anon, authenticated;
grant execute on function public.get_daily_rating_counts(date, text) to anon, authenticated;
grant execute on function public.submit_daily_rating(date, text, smallint, uuid) to anon, authenticated;
