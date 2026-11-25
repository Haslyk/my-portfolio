-- Add classLevel (default 2 = 2. Sınıf) and section (default 'A' = A Grubu / 1. Grup) to Student
ALTER TABLE "Student" ADD COLUMN "classLevel" INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "Student" ADD COLUMN "section" TEXT NOT NULL DEFAULT 'A';
CREATE INDEX "Student_classLevel_section_idx" ON "Student"("classLevel", "section");

-- Add unlockedGroups JSONB array to Week for per-group week lock/unlock
ALTER TABLE "Week" ADD COLUMN "unlockedGroups" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Week 1 is open for all groups; preserve any already admin-unlocked weeks (order > 1) for the existing 2-A group
UPDATE "Week" SET "unlockedGroups" = '["1-A","1-B","2-A","2-B"]'::jsonb WHERE "order" = 1;
UPDATE "Week" SET "unlockedGroups" = '["2-A"]'::jsonb WHERE "order" > 1 AND "isAdminUnlocked" = true;
