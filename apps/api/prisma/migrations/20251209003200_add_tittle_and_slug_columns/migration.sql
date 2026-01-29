/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `workouts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "slug" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workouts_slug_key" ON "workouts"("slug");
