---
name: qa-before-complete
description: Validate completed mess app features with static checks, tests, browser interaction, responsive checks, and failure states before handoff.
---

# QA Before Complete

Never mark a feature complete just because it compiles.

Before calling work complete:

1. Run lint.
2. Run TypeScript typecheck.
3. Run relevant unit tests.
4. Start the application.
5. Test the feature in a browser.
6. Use Playwright MCP when available.
7. Test at mobile width.
8. Verify loading state.
9. Verify empty state.
10. Verify error state.
11. Check the browser console.
12. Check for dead taps.
13. Check for overlap.
14. Check responsive behaviour.

For admin features, also test unauthenticated access, unauthorised access, save draft, preview, publish, and failure state.

Report remaining problems rather than hiding them.
