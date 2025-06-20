/*
  Warnings:

  - You are about to drop the column `cantidadDeDosis` on the `medicamento` table. All the data in the column will be lost.
  - Added the required column `cantidadDeDosis` to the `UnidadMedicamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medicamento` DROP COLUMN `cantidadDeDosis`;

-- AlterTable
ALTER TABLE `notificacion` ALTER COLUMN `titulo` DROP DEFAULT;

-- AlterTable
ALTER TABLE `unidadmedicamento` ADD COLUMN `cantidadDeDosis` INTEGER NOT NULL;
