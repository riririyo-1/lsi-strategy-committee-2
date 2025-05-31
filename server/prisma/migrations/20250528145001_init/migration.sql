-- CreateTable
CREATE TABLE "TrendReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "videoUrl" TEXT,
    "posterUrl" TEXT,
    "pdfUrl" TEXT,
    "speaker" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrendReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "trendReportId" TEXT NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_trendReportId_fkey" FOREIGN KEY ("trendReportId") REFERENCES "TrendReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
