-- AlterTable
ALTER TABLE "TopicsArticle" ADD COLUMN     "subCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "TopicsArticle" ADD CONSTRAINT "TopicsArticle_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
