/*
  Warnings:

  - You are about to drop the column `closing_time` on the `Local` table. All the data in the column will be lost.
  - You are about to drop the column `opening_time` on the `Local` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- AlterTable
ALTER TABLE "public"."Local" DROP COLUMN "closing_time",
DROP COLUMN "opening_time";

-- CreateTable
CREATE TABLE "public"."LocalSchedule" (
    "id" TEXT NOT NULL,
    "day_of_week" "public"."DayOfWeek" NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,

    CONSTRAINT "LocalSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalSchedule_local_id_day_of_week_key" ON "public"."LocalSchedule"("local_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "public"."LocalSchedule" ADD CONSTRAINT "LocalSchedule_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "public"."Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
