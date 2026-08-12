-- Forward-only ranking identity migration.
-- Existing rows are rebuilt from completed workouts, so points remain derivable.
BEGIN;

CREATE TYPE "RankingPeriodType" AS ENUM ('WEEK', 'MONTH', 'YEAR');

ALTER TABLE rankings
  ADD COLUMN period_type "RankingPeriodType",
  ADD COLUMN period_start TIMESTAMP(3);

UPDATE rankings
SET period_type = (CASE
  WHEN week IS NOT NULL THEN 'WEEK'
  WHEN month IS NOT NULL THEN 'MONTH'
  ELSE 'YEAR'
END)::"RankingPeriodType",
period_start = CASE
  WHEN week IS NOT NULL THEN make_date(year, 1, 4)
    + ((week - 1) * 7) * INTERVAL '1 day'
    - ((EXTRACT(ISODOW FROM make_date(year, 1, 4))::integer - 1) * INTERVAL '1 day')
  WHEN month IS NOT NULL THEN make_date(year, month, 1)
  ELSE make_date(year, 1, 1)
END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM rankings
    WHERE period_type IS NULL OR period_start IS NULL
  ) THEN
    RAISE EXCEPTION 'Ranking backfill produced NULL identity values';
  END IF;
END $$;

-- Keep one row for every new identity. Points are rebuilt by the application
-- from completed workouts on the next domain transition.
DELETE FROM rankings duplicate
USING rankings keeper
WHERE duplicate.id > keeper.id
  AND duplicate.club_id = keeper.club_id
  AND duplicate.athlete_id = keeper.athlete_id
  AND duplicate.period_type = keeper.period_type
  AND duplicate.period_start = keeper.period_start;

ALTER TABLE rankings
  ALTER COLUMN period_type SET NOT NULL,
  ALTER COLUMN period_start SET NOT NULL;

DROP INDEX IF EXISTS "rankings_club_id_athlete_id_year_month_week_key";
DROP INDEX IF EXISTS "rankings_club_id_athlete_id_year_month_key";

CREATE UNIQUE INDEX rankings_club_athlete_period_key
  ON rankings (club_id, athlete_id, period_type, period_start);

CREATE INDEX rankings_club_period_points_idx
  ON rankings (club_id, period_type, period_start, points);

COMMIT;
