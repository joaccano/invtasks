/*
  Warnings:

  - You are about to drop the column `cantidadDeDosis` on the `unidadmedicamento` table. All the data in the column will be lost.
  - Added the required column `cantidadDeDosis` to the `Medicamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medicamento` ADD COLUMN `cantidadDeDosis` INTEGER DEFAULT 1 NOT NULL;

-- AlterTable
ALTER TABLE `unidadmedicamento` DROP COLUMN `cantidadDeDosis`;
