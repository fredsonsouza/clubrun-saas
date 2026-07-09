/*
  Warnings:

  - The values [MEMBER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `birthDate` on the `athlete_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `races` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[strava_athlete_id]` on the table `athlete_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invite_token]` on the table `clubs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[strava_activity_id]` on the table `workouts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "RacePaymentStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterEnum
ALTER TYPE "MemberStatus" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'MANAGER', 'ADMIN', 'ATHLETE', 'COACH', 'BILLING');
ALTER TABLE "public"."members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "invites" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "members" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'ATHLETE';
COMMIT;

-- AlterEnum
ALTER TYPE "TokenType" ADD VALUE 'EMAIL_VERIFICATION';

-- AlterTable
ALTER TABLE "athlete_profiles" DROP COLUMN "birthDate",
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01 00:00:00 +00:00',
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shoes_max_distance" DOUBLE PRECISION,
ADD COLUMN     "shoes_remaining_distance" DOUBLE PRECISION,
ADD COLUMN     "strava_access_token" TEXT,
ADD COLUMN     "strava_athlete_id" TEXT,
ADD COLUMN     "strava_refresh_token" TEXT,
ADD COLUMN     "strava_token_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "invite_token" TEXT,
ADD COLUMN     "status" "ClubStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "role" SET DEFAULT 'ATHLETE';

-- AlterTable
ALTER TABLE "race_results" ADD COLUMN     "shoes_used" TEXT;

-- AlterTable
ALTER TABLE "races" DROP COLUMN "imageUrl",
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "route_data" JSONB;

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "shoes_used" TEXT,
ADD COLUMN     "strava_activity_id" TEXT,
ADD COLUMN     "sync_source" TEXT DEFAULT 'MANUAL',
ADD COLUMN     "target_distance" DOUBLE PRECISION,
ADD COLUMN     "target_duration" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "race_participants" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "race_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "payment_status" "RacePaymentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "race_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_reactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workout_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "workout_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "race_participants_race_id_athlete_id_key" ON "race_participants"("race_id", "athlete_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_reactions_workout_id_user_id_key" ON "workout_reactions"("workout_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_profiles_strava_athlete_id_key" ON "athlete_profiles"("strava_athlete_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_invite_token_key" ON "clubs"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "workouts_strava_activity_id_key" ON "workouts"("strava_activity_id");

-- CreateIndex
CREATE INDEX "workouts_athlete_id_idx" ON "workouts"("athlete_id");

-- AddForeignKey
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_race_id_fkey" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_reactions" ADD CONSTRAINT "workout_reactions_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_reactions" ADD CONSTRAINT "workout_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
