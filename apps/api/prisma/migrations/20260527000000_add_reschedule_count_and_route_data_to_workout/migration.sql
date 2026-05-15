-- AlterTable
ALTER TABLE "workouts" ADD COLUMN "route_data" JSONB,
ADD COLUMN "reschedule_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "original_date" TIMESTAMP(3);
