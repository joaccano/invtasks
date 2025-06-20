-- AlterTable
ALTER TABLE `medicamento` ALTER COLUMN `cantidadDeDosis` DROP DEFAULT;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `tokenNotificacion` VARCHAR(191) NULL;
