-- AlterTable
ALTER TABLE "Week" ADD COLUMN "isAdminUnlocked" BOOLEAN NOT NULL DEFAULT false;

-- Unlock Week 1 by default for all courses; Weeks 2..5 stay admin-locked by default
UPDATE "Week" SET "isAdminUnlocked" = true WHERE "order" = 1;
