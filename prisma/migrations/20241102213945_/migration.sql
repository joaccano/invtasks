/*
  Warnings:

  - You are about to drop the column `codigoRecuperacion` on the `usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `codigoRecuperacion`,
    ADD COLUMN `codigoVerificacion` INTEGER NULL;
