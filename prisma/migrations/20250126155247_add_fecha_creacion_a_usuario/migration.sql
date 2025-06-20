-- DropForeignKey
ALTER TABLE `categoria` DROP FOREIGN KEY `Categoria_idPerfil_fkey`;

-- DropForeignKey
ALTER TABLE `configuracionnotificacion` DROP FOREIGN KEY `ConfiguracionNotificacion_idMedicamento_fkey`;

-- DropForeignKey
ALTER TABLE `cuenta` DROP FOREIGN KEY `Cuenta_idUsuario_fkey`;

-- DropForeignKey
ALTER TABLE `inventario` DROP FOREIGN KEY `Inventario_idMedicamento_fkey`;

-- DropForeignKey
ALTER TABLE `inventario` DROP FOREIGN KEY `Inventario_idPerfil_fkey`;

-- DropForeignKey
ALTER TABLE `medicamentoestado` DROP FOREIGN KEY `MedicamentoEstado_idMedicamento_fkey`;

-- DropForeignKey
ALTER TABLE `medico` DROP FOREIGN KEY `Medico_idPerfil_fkey`;

-- DropForeignKey
ALTER TABLE `perfil` DROP FOREIGN KEY `Perfil_idCuenta_fkey`;

-- DropForeignKey
ALTER TABLE `registro` DROP FOREIGN KEY `Registro_idPerfil_fkey`;

-- DropForeignKey
ALTER TABLE `registromedicamento` DROP FOREIGN KEY `RegistroMedicamento_idMedicamento_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_idRol_fkey`;

-- DropForeignKey
ALTER TABLE `usuarioestado` DROP FOREIGN KEY `UsuarioEstado_idUsuario_fkey`;

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `Rol`(`idRol`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEstado` ADD CONSTRAINT `UsuarioEstado_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cuenta` ADD CONSTRAINT `Cuenta_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perfil` ADD CONSTRAINT `Perfil_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `Cuenta`(`idCuenta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfiguracionNotificacion` ADD CONSTRAINT `ConfiguracionNotificacion_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoEstado` ADD CONSTRAINT `MedicamentoEstado_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroMedicamento` ADD CONSTRAINT `RegistroMedicamento_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medico` ADD CONSTRAINT `Medico_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE CASCADE ON UPDATE CASCADE;
