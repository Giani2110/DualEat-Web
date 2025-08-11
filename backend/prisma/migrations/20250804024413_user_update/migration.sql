-- AlterTable
ALTER TABLE "public"."Food" ADD COLUMN     "discount" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "reset_code" TEXT,
ADD COLUMN     "reset_expires_at" TIMESTAMP(3);
