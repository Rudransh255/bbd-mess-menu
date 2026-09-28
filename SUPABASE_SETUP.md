# Supabase setup

Project ref: `prluhctpfmnacirbxzbj`

## Apply the migrations

The checked-in migration is the source of truth. Authenticate and link the CLI, preview the change, then apply it:

```powershell
npx supabase login
npx supabase link --project-ref prluhctpfmnacirbxzbj
npx supabase db push --dry-run
npx supabase db push
```

Do not use `db reset --linked`; it deletes remote data.

## Configure the app

Copy `.env.example` to `.env.local`, then add the project's publishable key. A Supabase secret key is not required for admin authentication and must never be exposed to browser code.

In Supabase Auth, enable Google and add these redirect URLs:

- `http://localhost:3000/api/auth/callback`
- `https://<production-domain>/api/auth/callback`

Set `SITE_URL` to the matching origin in each environment.

## Approve the first admin

Have the administrator sign in once so the user exists in `auth.users`. Then approve that exact account from the Supabase SQL editor, replacing the placeholder email:

```sql
insert into public.admins (user_id, email, display_name)
select id, lower(email), raw_user_meta_data ->> 'full_name'
from auth.users
where lower(email) = lower('approved-admin@example.com')
on conflict (user_id) do update
set active = true,
    email = excluded.email,
    display_name = excluded.display_name;
```

Signing in with Google does not add an allowlist record automatically.

## Publishing safety

Imported menu images are private. An image-imported menu can be published only after its `menu_imports` row is marked `verified` with `reviewed_at` and `reviewed_by`, and the menu itself has `verified_at` and `verified_by` set by the publishing admin. The database trigger rejects every other publication attempt.
