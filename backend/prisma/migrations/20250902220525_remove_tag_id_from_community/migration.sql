/*
  Warnings:

  - You are about to drop the column `tag_id` on the `Community` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `Community` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Community" DROP CONSTRAINT "Community_tag_id_fkey";

-- DropIndex
DROP INDEX "public"."Community_name_idx";

-- AlterTable
ALTER TABLE "public"."Community" DROP COLUMN "tag_id",
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."_CommunityTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CommunityTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommunityTags_B_index" ON "public"."_CommunityTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "public"."Community"("name");

-- AddForeignKey
ALTER TABLE "public"."_CommunityTags" ADD CONSTRAINT "_CommunityTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CommunityTags" ADD CONSTRAINT "_CommunityTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."CommunityTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
