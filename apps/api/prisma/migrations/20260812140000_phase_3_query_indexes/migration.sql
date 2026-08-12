-- Phase 3: indexes backed by audited tenant-scoped list and aggregation queries.
-- Keep this migration forward-only; validate plans and write overhead in each environment.

CREATE INDEX "members_user_status_idx"
  ON "members" ("user_id", "status");

CREATE INDEX "races_club_date_idx"
  ON "races" ("club_id", "date");

CREATE INDEX "race_participants_athlete_idx"
  ON "race_participants" ("athlete_id");

CREATE INDEX "workouts_club_status_created_idx"
  ON "workouts" ("club_id", "status", "created_at" DESC);

CREATE INDEX "workouts_completed_athlete_club_date_idx"
  ON "workouts" ("athlete_id", "club_id", "date")
  WHERE "status" = 'COMPLETED';

CREATE INDEX "invoices_member_status_idx"
  ON "invoices" ("member_id", "status");
