-- Forward-only consistency invariants for workout projections.
-- Abort before adding checks if existing data is invalid.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM workouts WHERE distance <= 0)
     OR EXISTS (SELECT 1 FROM workouts WHERE duration IS NOT NULL AND duration <= 0)
     OR EXISTS (
       SELECT 1 FROM athlete_profiles
       WHERE shoes_remaining_distance IS NOT NULL
         AND shoes_remaining_distance < 0
     ) THEN
    RAISE EXCEPTION 'Cannot add workout consistency checks: invalid existing numeric data';
  END IF;
END $$;

ALTER TABLE workouts
  ADD COLUMN version INTEGER NOT NULL DEFAULT 0,
  ADD CONSTRAINT workouts_distance_positive_check CHECK (distance > 0),
  ADD CONSTRAINT workouts_duration_positive_check CHECK (duration IS NULL OR duration > 0),
  ADD CONSTRAINT workouts_version_nonnegative_check CHECK (version >= 0);

ALTER TABLE athlete_profiles
  ADD CONSTRAINT athlete_profiles_shoes_remaining_nonnegative_check
    CHECK (shoes_remaining_distance IS NULL OR shoes_remaining_distance >= 0);

COMMIT;
