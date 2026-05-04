-- AlterTable
ALTER TABLE "dolencias" ADD COLUMN     "fechaRecuperacion" TIMESTAMP(3),
ADD COLUMN     "recuperado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recuperadoPor" BIGINT;

-- CreateIndex
CREATE INDEX "dolencias_recuperado_idx" ON "dolencias"("recuperado");

-- CreateIndex
CREATE INDEX "dolencias_recuperadoPor_idx" ON "dolencias"("recuperadoPor");

-- AddForeignKey
ALTER TABLE "dolencias" ADD CONSTRAINT "dolencias_recuperadoPor_fkey" FOREIGN KEY ("recuperadoPor") REFERENCES "entrenadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
