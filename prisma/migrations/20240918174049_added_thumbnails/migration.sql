-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "bigImageURL" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallImageURL" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
