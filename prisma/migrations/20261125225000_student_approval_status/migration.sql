-- Add approvalStatus to Student; existing students are APPROVED, new registrations default to PENDING
ALTER TABLE "Student" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Student" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
CREATE INDEX "Student_approvalStatus_idx" ON "Student"("approvalStatus");
