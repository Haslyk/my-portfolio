-- Add courseCode to Week and Activity
ALTER TABLE "Week" ADD COLUMN IF NOT EXISTS "courseCode" TEXT NOT NULL DEFAULT 'ag-temelleri';
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "courseCode" TEXT NOT NULL DEFAULT 'ag-temelleri';

-- Drop single-course unique index on Week(order) and replace with composite (courseCode, order)
DROP INDEX IF EXISTS "Week_order_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Week_courseCode_order_key" ON "Week"("courseCode", "order");
CREATE INDEX IF NOT EXISTS "Week_courseCode_idx" ON "Week"("courseCode");
CREATE INDEX IF NOT EXISTS "Activity_courseCode_idx" ON "Activity"("courseCode");
