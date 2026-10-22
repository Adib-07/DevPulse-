/*
# Create voice_interactions table (single-tenant, no auth)

## Purpose
DevPulse Portal is a hackathon demo with no sign-in screen. The browser
talks to Supabase using the anon key for its entire lifetime. This table
persists the simulated Alexa+ voice-command history so it survives page
reloads during a live presentation.

## 1. New Tables
- `voice_interactions`
  - `id` (uuid, primary key)
  - `command` (text, not null) — the exact user-entered voice command text
  - `response` (text, not null) — the simulated assistant response text
  - `command_id` (text, not null) — recognized command identifier:
    FETCH_TASKS | CHECK_REPO | RUN_GUARDRAIL | UNKNOWN
  - `status` (text, not null) — ok | unknown | error
  - `created_at` (timestamptz, defaults to now()) — timestamp of the interaction

## 2. Indexes
- `voice_interactions_created_at_idx` on `created_at DESC` — the app loads
  recent history ordered by most recent first.

## 3. Security
- RLS ENABLED on `voice_interactions`.
- Single-tenant, intentionally shared/public demo data: CRUD policies use
  `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`.
  This is correct because the app has no sign-in screen and every request
  runs as the anon role; an `authenticated`-only policy would make the table
  look empty to the app.

## 4. Notes
- No `user_id` column or `auth.users` FK — there is no auth flow.
- The app inserts rows via the anon-key client and reads recent rows on load.
- Rows can be deleted (Reset Demo clears the history) and re-created freely.
*/

CREATE TABLE IF NOT EXISTS voice_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command text NOT NULL,
  response text NOT NULL,
  command_id text NOT NULL CHECK (command_id IN ('FETCH_TASKS','CHECK_REPO','RUN_GUARDRAIL','UNKNOWN')),
  status text NOT NULL CHECK (status IN ('ok','unknown','error')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_interactions_created_at_idx
  ON voice_interactions (created_at DESC);

ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_voice_interactions" ON voice_interactions;
CREATE POLICY "anon_select_voice_interactions"
  ON voice_interactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_voice_interactions" ON voice_interactions;
CREATE POLICY "anon_insert_voice_interactions"
  ON voice_interactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_voice_interactions" ON voice_interactions;
CREATE POLICY "anon_update_voice_interactions"
  ON voice_interactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_voice_interactions" ON voice_interactions;
CREATE POLICY "anon_delete_voice_interactions"
  ON voice_interactions FOR DELETE
  TO anon, authenticated USING (true);
