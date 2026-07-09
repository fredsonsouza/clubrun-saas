/*
  Warnings:

  - A unique constraint covering the columns `[club_id,athlete_id,year,month,week]` on the table `rankings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "rankings_club_id_athlete_id_year_month_key";

-- CreateIndex
CREATE UNIQUE INDEX "rankings_club_id_athlete_id_year_month_week_key" ON "rankings"("club_id", "athlete_id", "year", "month", "week");
