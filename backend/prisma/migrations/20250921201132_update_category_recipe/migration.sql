-- DropIndex
DROP INDEX "public"."Recipe_user_id_name_key";

-- AlterTable
ALTER TABLE "public"."Food" ADD COLUMN     "local_menu_category_id" INTEGER;

-- CreateIndex
CREATE INDEX "Food_category_id_idx" ON "public"."Food"("category_id");

-- CreateIndex
CREATE INDEX "Food_local_menu_category_id_idx" ON "public"."Food"("local_menu_category_id");

-- CreateIndex
CREATE INDEX "Recipe_name_idx" ON "public"."Recipe"("name");

-- CreateIndex
CREATE INDEX "RecipeIngredient_ingredient_id_idx" ON "public"."RecipeIngredient"("ingredient_id");

-- AddForeignKey
ALTER TABLE "public"."Food" ADD CONSTRAINT "Food_local_menu_category_id_fkey" FOREIGN KEY ("local_menu_category_id") REFERENCES "public"."LocalMenuCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
