-- CreateEnum
CREATE TYPE "public"."LocalEventType" AS ENUM ('TASK', 'PAYMENT', 'DELIVERY', 'MEETING', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "public"."LocalCalendarEvent" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "is_full_day" BOOLEAN NOT NULL DEFAULT false,
    "event_type" "public"."LocalEventType" NOT NULL DEFAULT 'TASK',
    "status" "public"."EventStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocalNote" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocalCalendarEvent_local_id_start_time_idx" ON "public"."LocalCalendarEvent"("local_id", "start_time");

-- CreateIndex
CREATE INDEX "LocalNote_local_id_is_pinned_due_date_idx" ON "public"."LocalNote"("local_id", "is_pinned", "due_date");

-- AddForeignKey
ALTER TABLE "public"."LocalCalendarEvent" ADD CONSTRAINT "LocalCalendarEvent_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "public"."Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocalNote" ADD CONSTRAINT "LocalNote_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "public"."Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
