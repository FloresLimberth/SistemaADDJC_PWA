-- CreateIndex
CREATE INDEX "asignaciones_atleta_microciclo_atletaId_idx" ON "asignaciones_atleta_microciclo"("atletaId");

-- CreateIndex
CREATE INDEX "asignaciones_atleta_microciclo_microcicloId_idx" ON "asignaciones_atleta_microciclo"("microcicloId");

-- CreateIndex
CREATE INDEX "asignaciones_atleta_microciclo_asignadoPor_idx" ON "asignaciones_atleta_microciclo"("asignadoPor");

-- CreateIndex
CREATE INDEX "atletas_categoria_idx" ON "atletas"("categoria");

-- CreateIndex
CREATE INDEX "atletas_categoriaPeso_idx" ON "atletas"("categoriaPeso");

-- CreateIndex
CREATE INDEX "notificaciones_recomendacionId_idx" ON "notificaciones"("recomendacionId");

-- CreateIndex
CREATE INDEX "recomendaciones_microcicloAfectadoId_idx" ON "recomendaciones"("microcicloAfectadoId");

-- CreateIndex
CREATE INDEX "recomendaciones_sesionGeneradaId_idx" ON "recomendaciones"("sesionGeneradaId");

-- CreateIndex
CREATE INDEX "recomendaciones_revisadoPor_idx" ON "recomendaciones"("revisadoPor");

-- CreateIndex
CREATE INDEX "recomendaciones_aplicadoPor_idx" ON "recomendaciones"("aplicadoPor");

-- CreateIndex
CREATE INDEX "recomendaciones_registroPostEntrenamientoId_idx" ON "recomendaciones"("registroPostEntrenamientoId");

-- CreateIndex
CREATE INDEX "recomendaciones_testFisicoId_idx" ON "recomendaciones"("testFisicoId");

-- CreateIndex
CREATE INDEX "registros_post_entrenamiento_entrenadorRegistroId_idx" ON "registros_post_entrenamiento"("entrenadorRegistroId");

-- CreateIndex
CREATE INDEX "reset_passwords_usuarioId_idx" ON "reset_passwords"("usuarioId");

-- CreateIndex
CREATE INDEX "tests_fisicos_sesionId_idx" ON "tests_fisicos"("sesionId");

-- CreateIndex
CREATE INDEX "tests_fisicos_microcicloId_idx" ON "tests_fisicos"("microcicloId");

-- CreateIndex
CREATE INDEX "usuarios_estado_idx" ON "usuarios"("estado");
