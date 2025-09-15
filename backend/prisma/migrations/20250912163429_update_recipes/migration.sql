/*
  Warnings:

  - Added the required column `main_image` to the `Recipe` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Recipe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Recipe" ADD COLUMN     "main_image" TEXT NOT NULL,
ADD COLUMN     "total_time" INTEGER,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."RecipeIngredient" ALTER COLUMN "quantity" SET DATA TYPE TEXT;
