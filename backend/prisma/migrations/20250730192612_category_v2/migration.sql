/*
  Warnings:

  - You are about to drop the column `description` on the `CommunityTag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `FoodCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TagCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tipo` to the `FoodCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypesCategory" AS ENUM ('Tipos_de_comida', 'Estilos_o_dietas', 'Origen_y_cultura');

-- AlterTable
ALTER TABLE "CommunityTag" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "FoodCategory" ADD COLUMN     "tipo" "TypesCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Local" ADD COLUMN     "categorias_menu" TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LocalMenuCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "local_id" INTEGER NOT NULL,
    "food_category_id" INTEGER,

    CONSTRAINT "LocalMenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocalMenuCategory_local_id_idx" ON "LocalMenuCategory"("local_id");

-- CreateIndex
CREATE INDEX "LocalMenuCategory_food_category_id_idx" ON "LocalMenuCategory"("food_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "LocalMenuCategory_local_id_name_key" ON "LocalMenuCategory"("local_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCategory_name_key" ON "FoodCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TagCategory_name_key" ON "TagCategory"("name");

-- AddForeignKey
ALTER TABLE "LocalMenuCategory" ADD CONSTRAINT "LocalMenuCategory_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalMenuCategory" ADD CONSTRAINT "LocalMenuCategory_food_category_id_fkey" FOREIGN KEY ("food_category_id") REFERENCES "FoodCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
