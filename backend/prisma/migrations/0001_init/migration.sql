-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TEXT', 'FILE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT,
    "inputType" "InputType" NOT NULL DEFAULT 'TEXT',
    "originalText" TEXT NOT NULL,
    "plagiarismScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentences" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "aiScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "humanScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiModelUsed" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "pdfPath" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");
