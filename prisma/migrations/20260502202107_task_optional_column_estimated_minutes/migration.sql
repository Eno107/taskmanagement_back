-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_columnId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "estimatedMinutes" INTEGER,
ALTER COLUMN "columnId" DROP NOT NULL,
ALTER COLUMN "position" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE SET NULL ON UPDATE CASCADE;
