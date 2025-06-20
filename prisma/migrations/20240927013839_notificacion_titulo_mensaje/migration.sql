/*
  Warnings:

  - Added the required column `titulo` to the `Notificacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notificacion` ADD COLUMN `mensaje` VARCHAR(191) NULL,
    ADD COLUMN `titulo` VARCHAR(191) NOT NULL DEFAULT 'Sin título';

