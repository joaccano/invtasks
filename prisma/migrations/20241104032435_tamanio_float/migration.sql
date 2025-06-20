/*
  Warnings:

  - You are about to alter the column `tamanioMB` on the `documento` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `documento` MODIFY `tamanioMB` DOUBLE NOT NULL;
