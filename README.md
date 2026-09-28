# BBD Mess

Mobile-first hostel mess menu app, based on the supplied Stitch screens. This first slice includes the student home, weekly timetable, and a feedback preview.

## Run locally

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` to check the app.

The displayed menu in `lib/menu.ts` is a preview transcription of the supplied hostel mess sheet effective 22 September 2026. It is pending human verification and is not connected to a live publishing system, so last-minute changes must be checked against the mess notice. Feedback is saved to this browser's local storage only and is labelled accordingly in the UI. Supabase publishing, anonymous feedback submission, admin authentication, and image import still need a development Supabase project and Gemini credentials.
