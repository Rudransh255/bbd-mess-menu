---
name: supabase-security
description: Design, review, or change Supabase schemas, RLS policies, authentication, and server-side admin access for the mess app.
---

# Supabase Security

Enable Row Level Security on every exposed table.

Anonymous users may:

- Read published menus
- Insert ratings
- Insert feedback

Anonymous users must not:

- Read submitted feedback
- Read individual rating records
- Read drafts
- Modify menus
- Access admin records

Admin authorisation must be checked server-side. Google login does not automatically grant admin access. Verify the admin role using the authorised admin data stored by the application.

Never expose `SUPABASE_SERVICE_ROLE_KEY`. Never place secret keys in Client Components, browser bundles, or `NEXT_PUBLIC_` variables. Never disable security just to make a feature work. Prefer migrations for database changes.
