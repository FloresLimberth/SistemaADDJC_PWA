/*
  Warnings:

  - You are about to drop the column `peso` on the `atletas` table. All the data in the column will be lost.
  - Made the column `categoriaPeso` on table `atletas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sesionId` on table `tests_fisicos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `microcicloId` on table `tests_fisicos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "tests_fisicos" DROP CONSTRAINT "tests_fisicos_microcicloId_fkey";

-- DropForeignKey
ALTER TABLE "tests_fisicos" DROP CONSTRAINT "tests_fisicos_sesionId_fkey";

-- AlterTable
ALTER TABLE "atletas" DROP COLUMN "peso",
ALTER COLUMN "categoriaPeso" SET NOT NULL;

-- AlterTable
ALTER TABLE "tests_fisicos" ADD COLUMN     "asistio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "motivoInasistencia" TEXT,
ALTER COLUMN "sesionId" SET NOT NULL,
ALTER COLUMN "microcicloId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests_fisicos" ADD CONSTRAINT "tests_fisicos_microcicloId_fkey" FOREIGN KEY ("microcicloId") REFERENCES "microciclos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
