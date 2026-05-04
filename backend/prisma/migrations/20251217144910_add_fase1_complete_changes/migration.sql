/*
  Warnings:

  - You are about to alter the column `mediaVolumen` on the `microciclos` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `mediaIntensidad` on the `microciclos` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "catalogo_ejercicios" ADD COLUMN     "categoria" VARCHAR(50),
ADD COLUMN     "duracionMinutos" INTEGER,
ADD COLUMN     "intensidadSugerida" DECIMAL(5,2),
ADD COLUMN     "sistemaEnergetico" VARCHAR(50);

-- AlterTable
ALTER TABLE "microciclos" ADD COLUMN     "iCarga1" DECIMAL(5,2),
ADD COLUMN     "iCarga1Nivel" SMALLINT,
ADD COLUMN     "iCarga2" DECIMAL(5,2),
ADD COLUMN     "iCarga2Nivel" SMALLINT,
ADD COLUMN     "vCarga1" DECIMAL(5,2),
ADD COLUMN     "vCarga1Nivel" SMALLINT,
ADD COLUMN     "vCarga2" DECIMAL(5,2),
ADD COLUMN     "vCarga2Nivel" SMALLINT,
ALTER COLUMN "mediaVolumen" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "mediaIntensidad" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "zonaEsfuerzo" VARCHAR(50);

-- CreateTable
CREATE TABLE "baremos" (
    "id" BIGSERIAL NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "nivel" SMALLINT NOT NULL,
    "porcentajeMin" DECIMAL(5,2) NOT NULL,
    "porcentajeMax" DECIMAL(5,2) NOT NULL,
    "minutosMin" INTEGER,
    "minutosMax" INTEGER,
    "fcMin" INTEGER,
    "fcMax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baremos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nomenclatura" (
    "id" BIGSERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombreCompleto" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "wintPercent" DECIMAL(5,2),
    "sistemaEnergetico" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nomenclatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_esfuerzo" (
    "id" BIGSERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombreCompleto" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "wintPercent" DECIMAL(5,2),
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_esfuerzo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "baremos_tipo_idx" ON "baremos"("tipo");

-- CreateIndex
CREATE INDEX "baremos_nivel_idx" ON "baremos"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "baremos_tipo_nivel_key" ON "baremos"("tipo", "nivel");

-- CreateIndex
CREATE UNIQUE INDEX "nomenclatura_codigo_key" ON "nomenclatura"("codigo");

-- CreateIndex
CREATE INDEX "nomenclatura_codigo_idx" ON "nomenclatura"("codigo");

-- CreateIndex
CREATE INDEX "nomenclatura_categoria_idx" ON "nomenclatura"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "zonas_esfuerzo_codigo_key" ON "zonas_esfuerzo"("codigo");

-- CreateIndex
CREATE INDEX "zonas_esfuerzo_codigo_idx" ON "zonas_esfuerzo"("codigo");

-- CreateIndex
CREATE INDEX "zonas_esfuerzo_categoria_idx" ON "zonas_esfuerzo"("categoria");
