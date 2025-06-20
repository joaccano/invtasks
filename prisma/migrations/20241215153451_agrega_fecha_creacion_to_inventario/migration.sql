-- AlterTable
ALTER TABLE `inventario` ADD COLUMN `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Backup` (
    `idBackup` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `estado` INTEGER NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idBackup`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
