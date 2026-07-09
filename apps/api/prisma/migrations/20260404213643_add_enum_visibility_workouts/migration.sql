-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'COACH_ONLY', 'PRIVATE');

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';
