-- DropForeignKey
ALTER TABLE `registro` DROP FOREIGN KEY `Registro_idCategoria_fkey`;

-- DropForeignKey
ALTER TABLE `registro` DROP FOREIGN KEY `Registro_idMedico_fkey`;

-- AlterTable
ALTER TABLE `registro` MODIFY `idMedico` INTEGER NULL,
    MODIFY `idCategoria` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `Categoria`(`idCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idMedico_fkey` FOREIGN KEY (`idMedico`) REFERENCES `Medico`(`idMedico`) ON DELETE SET NULL ON UPDATE CASCADE;
