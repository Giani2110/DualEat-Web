/*
  Warnings:

  - The primary key for the `CommunityMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LocalReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LocalUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RecipeIngredient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RecipeStep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserAchievement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `slug` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationFrequency" AS ENUM ('FREQUENT', 'RARE', 'NONE');

-- CreateEnum
CREATE TYPE "public"."NotificationContentType" AS ENUM ('POST', 'COMMUNITY', 'LOCAL', 'ORDER', 'FOLLOWER', 'COMMENT');

-- DropIndex
DROP INDEX "public"."User_slug_key";

-- AlterTable
ALTER TABLE "public"."CommunityMember" DROP CONSTRAINT "CommunityMember_pkey",
ADD COLUMN     "receives_notifications" "public"."NotificationFrequency" NOT NULL DEFAULT 'RARE',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CommunityMember_id_seq";

-- AlterTable
ALTER TABLE "public"."LocalReview" DROP CONSTRAINT "LocalReview_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LocalReview_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LocalReview_id_seq";

-- AlterTable
ALTER TABLE "public"."LocalUser" DROP CONSTRAINT "LocalUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LocalUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LocalUser_id_seq";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OrderItem_id_seq";

-- AlterTable
ALTER TABLE "public"."RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RecipeIngredient_id_seq";

-- AlterTable
ALTER TABLE "public"."RecipeStep" DROP CONSTRAINT "RecipeStep_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RecipeStep_id_seq";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "notificationsPref" "public"."NotificationFrequency" NOT NULL DEFAULT 'FREQUENT',
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserAchievement_id_seq";

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_type" "public"."NotificationContentType",
    "content_id" TEXT,
    "metadata" JSONB,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_created_at_user_id_idx" ON "public"."Notification"("created_at", "user_id");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
