/*
  Warnings:

  - The values [user_premium,business] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[user_id,local_id,subscription_type]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscription_type` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('LOCAL', 'COMMUNITY_USER');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('LOCAL_MONTHLY', 'LOCAL_ANNUAL', 'COMMUNITY_USER_MONTHLY', 'COMMUNITY_USER_ANNUAL');
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStateMP" ADD VALUE 'inactive';
ALTER TYPE "SubscriptionStateMP" ADD VALUE 'active';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "local_id" TEXT,
ADD COLUMN     "payment_history" JSONB,
ADD COLUMN     "subscription_type" "SubscriptionType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_local_id_subscription_type_key" ON "Subscription"("user_id", "local_id", "subscription_type");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "Local"("id") ON DELETE SET NULL ON UPDATE CASCADE;
