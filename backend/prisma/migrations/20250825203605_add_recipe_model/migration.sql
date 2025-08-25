/*
  Warnings:

  - You are about to drop the column `post_id` on the `RecipeIngredient` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `RecipeStep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recipe_id,step_number]` on the table `RecipeStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recipe_id` to the `RecipeIngredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipe_id` to the `RecipeStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_post_id_fkey";

-- DropForeignKey
ALTER TABLE "RecipeStep" DROP CONSTRAINT "RecipeStep_post_id_fkey";

-- DropIndex
DROP INDEX "RecipeStep_post_id_step_number_key";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "recipe_id" INTEGER;

-- AlterTable
ALTER TABLE "RecipeIngredient" DROP COLUMN "post_id",
ADD COLUMN     "recipe_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RecipeStep" DROP COLUMN "post_id",
ADD COLUMN     "recipe_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_user_id_name_key" ON "Recipe"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipe_id_step_number_key" ON "RecipeStep"("recipe_id", "step_number");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
