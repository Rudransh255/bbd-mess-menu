# Project Instructions

- Read `prd.md` and `tech_stack.md` before architectural work.
- Use the project skills in `.agents/skills/` whenever relevant.
- Inspect existing code before creating new abstractions.
- Do not install unnecessary packages. Prefer current project patterns.
- Do not rewrite working sections without a clear reason.
- Never expose secrets or place secret keys in client bundles or `NEXT_PUBLIC_` variables.
- Make database changes through migrations unless another approach is explicitly appropriate.
- Do not push or commit without explicit permission.
- Never publish AI-extracted menu data without admin verification.
- Keep student-facing pages lightweight.
- Use Indian English for visible UI copy.
- Do not use em dashes in visible website copy.
- Completed features must not contain dead buttons or placeholder taps.
- If a requirement conflicts with the PRD, stop and flag the conflict.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
