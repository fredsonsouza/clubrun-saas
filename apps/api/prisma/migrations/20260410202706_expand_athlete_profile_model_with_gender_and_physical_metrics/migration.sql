/*
  Warnings:

  - Added the required column `city` to the `athlete_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "athlete_profiles" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "height" INTEGER;
