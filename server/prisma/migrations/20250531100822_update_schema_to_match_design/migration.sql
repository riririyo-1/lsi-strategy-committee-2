/*
  Warnings:

  - You are about to drop the `Agenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrendReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_trendReportId_fkey";

-- DropTable
DROP TABLE "Agenda";

-- DropTable
DROP TABLE "TrendReport";

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "labels" TEXT[],
    "thumbnailUrl" TEXT,
    "articleUrl" TEXT NOT NULL,
    "fullText" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "viewCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "publishDate" TIMESTAMP(3),
    "content" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicsArticle" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
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
    "agenda" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchArticle" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_articleUrl_key" ON "Article"("articleUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TopicsArticle_topicId_articleId_key" ON "TopicsArticle"("topicId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchArticle_researchId_articleId_key" ON "ResearchArticle"("researchId", "articleId");

-- AddForeignKey
ALTER TABLE "TopicsArticle" ADD CONSTRAINT "TopicsArticle_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicsArticle" ADD CONSTRAINT "TopicsArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicsArticle" ADD CONSTRAINT "TopicsArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchArticle" ADD CONSTRAINT "ResearchArticle_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchArticle" ADD CONSTRAINT "ResearchArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchArticle" ADD CONSTRAINT "ResearchArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
