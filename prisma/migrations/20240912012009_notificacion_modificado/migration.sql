/*
  Warnings:

  - You are about to drop the column `idInventario` on the `notificacion` table. All the data in the column will be lost.
  - You are about to drop the `_notificaciontotiponotificacion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idTipoNotificacion` to the `Notificacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_NotificacionToTipoNotificacion` DROP FOREIGN KEY `_NotificacionToTipoNotificacion_A_fkey`;

-- DropForeignKey
ALTER TABLE `_NotificacionToTipoNotificacion` DROP FOREIGN KEY `_NotificacionToTipoNotificacion_B_fkey`;

-- AlterTable
ALTER TABLE `Notificacion` DROP COLUMN `idInventario`,
    ADD COLUMN `idTipoNotificacion` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_NotificacionToTipoNotificacion`;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idTipoNotificacion_fkey` FOREIGN KEY (`idTipoNotificacion`) REFERENCES `TipoNotificacion`(`idTipoNotificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;
