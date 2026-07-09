-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('PLANNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WorkoutMode" AS ENUM ('GOAL', 'FREE');

-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "city" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "assignment_mode" "WorkoutMode",
ADD COLUMN     "status" "WorkoutStatus" NOT NULL DEFAULT 'COMPLETED',
ALTER COLUMN "duration" SET DATA TYPE DOUBLE PRECISION;
