# Voltz Live — implementation and validation

Based on main `567ca998e369d51ab694e8807d8147948031e27c` (2026-09-05).

## Implementation

- Authenticated users create or join by a six-digit code or a locally generated QR.
- Account display name comes from Auth, never from player-entered nicknames.
- Host joins as a player. Up to 100 participants, three active rooms per host; rooms expire after 24 hours.
- Curriculum selection uses the existing five categories and fifty levels. Quiz builder extracted unchanged to `src/quiz.ts` and reused by individual challenges and server generation.
- 5/10/15/20 questions across a category; one level has ten unique questions, so its selection is capped at ten.
- Durations 0/20/30/45/60 seconds. Host may close an untimed question. Server time and a session row lock decide deadlines, first answers and phase transitions.
- Phases: lobby → question → reveal → optional leaderboard → next question / finished.
- Correct answer: 1000 points plus a linear server-calculated bonus up to 250 for timed questions. Wrong/absent: 0. Untimed: 1000. These points never change course XP.
- Fixed answer slots/icons; unused slots keep their grid positions. Final ranking, personal accuracy and host difficulty summary.
- Polling every 1200 ms after the preceding poll completes; explicit errors; reconnect/refresh state recovery and host exit dialog.
- Google sign-in preserves a pending Live code in sessionStorage across the existing OAuth callback.

## Server

Project `utgtvdmafmehjgebyhqk`. Edge Function `voltz-live`, version 2 deployed.

Private schema `voltz_live`: `sessions`, `participants`, `questions`, `answers`, `limits`.
All tables have RLS, no client policies or schema/table grants. Only service_role has access. Absence of client policies is intentional deny-by-default. Answer keys are stored inside the private question content and never exposed through direct REST tables.

`public.voltz_live_command(uuid,text,jsonb,text)` is SECURITY INVOKER, executable only by service_role. It runs a complete action and returns a filtered snapshot atomically. Private questions and explanations are omitted until reveal; current correctness/points are omitted while answers remain open.

Edge gateway `verify_jwt=false` is intentional: the handler itself requires Bearer auth, verifies it against Auth `/user`, and rejects missing, invalid and anonymous sessions. Browser-supplied identity, name, question content and score are discarded. CORS preflight is answered before authentication; only the production origin is allowed. No service key in frontend or repository.

Applied migrations:
- `voltz_live_private_engine`
- `voltz_live_verified_display_name`
- `voltz_live_authoritative_lock_time`

`supabase/live-schema.sql` is the consolidated fresh-install schema, not an idempotent reapply script. CLI unavailable in this environment; migrations were applied using Supabase MCP.

Deployment must include the Edge entrypoint AND `src/quiz.ts`, `src/curriculum.ts`, retaining their paths. The Edge Function imports the shared source directly.

## Tests actually executed

- `npm ci`: PASS (136 packages). An initial offline attempt lacked cached Vite; the regular installation succeeded.
- `npm run build`: PASS.
- All 50 levels / 500 generated questions: ten valid questions per level, options, correct index and explanations: PASS.
- QR generation and independent decode against the expected GitHub Pages URL: PASS.
- `tests/live-engine.sql` on Supabase: PASS. Two temporary Auth identities, five complete rounds, identical questions/order, join deduplication, definitive first answer, no premature keys/correctness/score, host-only controls, idempotent transitions, final ranking/summary, restore, deadline, hidden explanation, no-leaderboard path, private function/schema grants. Fixtures and data rolled back.
- Public Edge endpoint without auth: HTTP 401. OPTIONS: HTTP 200 with production CORS origin.
- Supabase security advisor: private tables show expected INFO for RLS with no policies; existing leaked-password-protection warning predates Live.
- `tests/live-api.py` attempted: BLOCKED at Auth login. Existing test account has unconfirmed email. Full authenticated Edge HTTP gameplay: NOT TESTED.
- Browser local preview: BLOCKED (`net::ERR_BLOCKED_BY_CLIENT`). No visual/mobile or two-browser E2E claim.
- Existing authenticated lessons/manual/profile/progress regression in browser: NOT TESTED. Curriculum, email code/assets, course XP and pass threshold unchanged; quiz extraction validated structurally.

## Publication gate

Frontend is not published to main/Pages until authenticated integration and browser checks can run. Backend is deployed independently and does not change existing progress or email tables/functions.

Next: confirm the test account email through the owner's inbox (or supply sign-in through secure browser authentication), run the HTTP integration test, obtain an accessible preview for two-account E2E, then review the diff, merge/push and verify the Pages workflow. No credentials should be committed or placed in a URL.

## Limits

- Polling adds about 1.2 seconds plus request latency; no load test for 100 users.
- Final test scenario with two browser contexts and mobile layout is pending.
- Existing quiz material outside the first Aprendiz topics is primarily curriculum comprehension; this change does not claim a new technical question bank.
- Full curriculum and individual quiz logic remain available in the course frontend. Live's API conceals the per-session correct index, not the educational content itself.
