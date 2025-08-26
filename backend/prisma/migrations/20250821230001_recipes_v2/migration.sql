/*
  Warnings:

  - You are about to drop the column `unit_of_measure` on the `Ingredient` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `unit_of_measure_id` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('recipe', 'post');

-- AlterTable
ALTER TABLE "public"."Community" ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "public"."Ingredient" DROP COLUMN "unit_of_measure",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "type",
ADD COLUMN     "type" "public"."PostType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."RecipeIngredient" ADD COLUMN     "unit_of_measure_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."UnitOfMeasure" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_name_key" ON "public"."UnitOfMeasure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_abbreviation_key" ON "public"."UnitOfMeasure"("abbreviation");

-- AddForeignKey
ALTER TABLE "public"."RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "public"."UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
