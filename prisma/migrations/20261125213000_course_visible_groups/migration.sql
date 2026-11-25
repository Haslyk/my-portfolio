-- AlterTable
ALTER TABLE "CourseSetting" ADD COLUMN "visibleGroups" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Initialize visibleGroups from existing defaultVisible flag
UPDATE "CourseSetting"
SET "visibleGroups" = '["1-A","1-B","2-A","2-B"]'::jsonb
WHERE "defaultVisible" = true;
