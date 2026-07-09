/*
  Warnings:

  - Changed the type of `type` on the `workouts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('EASY', 'INTERVAL', 'TEMPO', 'LONG', 'RECOVERY', 'RACE', 'STRENGTH', 'WALK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_system_admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workouts" DROP COLUMN "type",
ADD COLUMN     "type" "WorkoutType" NOT NULL;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
