-- DropForeignKey
ALTER TABLE `documento` DROP FOREIGN KEY `Documento_idMedico_fkey`;

-- AlterTable
ALTER TABLE `documento` MODIFY `idMedico` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_idMedico_fkey` FOREIGN KEY (`idMedico`) REFERENCES `Medico`(`idMedico`) ON DELETE SET NULL ON UPDATE CASCADE;
