-- Update existing null birth dates to the default date
UPDATE "athlete_profiles" SET "birthDate" = '2000-01-01 00:00:00 +00' WHERE "birthDate" IS NULL;

-- Alter birthDate column to be not null and set default
ALTER TABLE "athlete_profiles" ALTER COLUMN "birthDate" SET NOT NULL;
ALTER TABLE "athlete_profiles" ALTER COLUMN "birthDate" SET DEFAULT '2000-01-01 00:00:00 +00';

-- Add shoes and watch columns
ALTER TABLE "athlete_profiles" ADD COLUMN "shoes" TEXT;
ALTER TABLE "athlete_profiles" ADD COLUMN "watch" TEXT;

-- Add medical conditions columns
ALTER TABLE "athlete_profiles" ADD COLUMN "has_medical_conditions" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "athlete_profiles" ADD COLUMN "medical_conditions" TEXT;
