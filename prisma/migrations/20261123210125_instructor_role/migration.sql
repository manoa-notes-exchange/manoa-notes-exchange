-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'INSTRUCTOR';

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "outdatedBy" INTEGER,
ADD COLUMN     "outdatedNote" TEXT;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_outdatedBy_fkey" FOREIGN KEY ("outdatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
