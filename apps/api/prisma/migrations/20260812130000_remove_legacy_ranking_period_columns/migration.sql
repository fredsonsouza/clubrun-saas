-- Final ranking identity cleanup after the periodStart backfill was deployed.
BEGIN;

ALTER TABLE rankings
  DROP COLUMN year,
  DROP COLUMN month,
  DROP COLUMN week;

COMMIT;
