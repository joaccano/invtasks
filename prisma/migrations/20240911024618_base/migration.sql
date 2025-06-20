/*
  Warnings:

  - Made the column `nombre` on table `estadousuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fechaAlta` on table `estadousuario` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `idRol` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Made the column `nombreUsuario` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contrasenia` on table `usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fechaDesde` on table `usuarioestado` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `EstadoUsuario` MODIFY `nombre` VARCHAR(191) NOT NULL,
    MODIFY `fechaAlta` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `idRol` INTEGER NOT NULL,
    MODIFY `nombreUsuario` VARCHAR(191) NOT NULL,
    MODIFY `contrasenia` VARCHAR(191) NOT NULL,
    MODIFY `firebaseId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `UsuarioEstado` MODIFY `fechaDesde` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Rol` (
    `idRol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idRol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permiso` (
    `idPermiso` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idPermiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolPermiso` (
    `idRolPermiso` INTEGER NOT NULL AUTO_INCREMENT,
    `idPermiso` INTEGER NOT NULL,
    `idRol` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idRolPermiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cuenta` (
    `idCuenta` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NOT NULL,

    UNIQUE INDEX `Cuenta_idUsuario_key`(`idUsuario`),
    PRIMARY KEY (`idCuenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Perfil` (
    `idPerfil` INTEGER NOT NULL AUTO_INCREMENT,
    `idCuenta` INTEGER NOT NULL,
    `principal` BOOLEAN NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` INTEGER NOT NULL,
    `genero` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idPerfil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `idNotificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `idPerfil` INTEGER NOT NULL,
    `idInventario` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idNotificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstadoNotificacion` (
    `idEstadoNotificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idEstadoNotificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacionEstado` (
    `idNotificacionEstado` INTEGER NOT NULL AUTO_INCREMENT,
    `idNotificacion` INTEGER NOT NULL,
    `idEstadoNotificacion` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idNotificacionEstado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoFrecuencia` (
    `idTipoFrecuencia` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `valor` INTEGER NOT NULL,

    PRIMARY KEY (`idTipoFrecuencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoNotificacion` (
    `idTipoNotificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idTipoNotificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfiguracionNotificacion` (
    `idConfiguracionNotificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `idTipoFrecuencia` INTEGER NOT NULL,
    `idNotificacion` INTEGER NOT NULL,
    `idMedicamento` INTEGER NOT NULL,
    `cantidadFrecuencia` INTEGER NOT NULL,
    `cantidadMedicamento` INTEGER NOT NULL,
    `fechaNotificacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idConfiguracionNotificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicamento` (
    `idMedicamento` INTEGER NOT NULL AUTO_INCREMENT,
    `idUnidadMedicamento` INTEGER NOT NULL,
    `contraindicaciones` VARCHAR(191) NOT NULL,
    `indicaciones` VARCHAR(191) NOT NULL,
    `nombreFarmaco` VARCHAR(191) NOT NULL,
    `nombreGenerico` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idMedicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstadoMedicamento` (
    `idEstadoMedicamento` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idEstadoMedicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicamentoEstado` (
    `idMedicamentoEstado` INTEGER NOT NULL AUTO_INCREMENT,
    `idMedicamento` INTEGER NOT NULL,
    `idEstadoMedicamento` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idMedicamentoEstado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventario` (
    `idInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `idPerfil` INTEGER NOT NULL,
    `idMedicamento` INTEGER NOT NULL,
    `stock` VARCHAR(191) NOT NULL,
    `cantidadMinima` INTEGER NOT NULL,

    PRIMARY KEY (`idInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnidadMedicamento` (
    `idUnidadMedicamento` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `indicaciones` VARCHAR(191) NOT NULL,
    `unidadDeMedida` INTEGER NOT NULL,
    `cantidadDeDosis` INTEGER NOT NULL,

    PRIMARY KEY (`idUnidadMedicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `idCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `idPerfil` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registro` (
    `idRegistro` INTEGER NOT NULL AUTO_INCREMENT,
    `idPerfil` INTEGER NOT NULL,
    `idMedico` INTEGER NOT NULL,
    `idCategoria` INTEGER NOT NULL,
    `detalle` VARCHAR(191) NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL,
    `fechaModificacion` DATETIME(3) NOT NULL,
    `fechaReal` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idRegistro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistroMedicamento` (
    `idRegistroMedicamento` INTEGER NOT NULL AUTO_INCREMENT,
    `idMedicamento` INTEGER NOT NULL,
    `idRegistro` INTEGER NOT NULL,
    `indicaciones` VARCHAR(191) NOT NULL,
    `dosis` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idRegistroMedicamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidad` (
    `idEspecialidad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idEspecialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medico` (
    `idMedico` INTEGER NOT NULL AUTO_INCREMENT,
    `idEspecialidad` INTEGER NOT NULL,
    `idPerfil` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `telefonoContacto` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idMedico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `idDocumento` INTEGER NOT NULL AUTO_INCREMENT,
    `idTipoDocumento` INTEGER NOT NULL,
    `idMedico` INTEGER NOT NULL,
    `idRegistro` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `tamanioMB` INTEGER NOT NULL,
    `urlRepositorio` VARCHAR(191) NOT NULL,
    `fechaCreado` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idDocumento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoDocumento` (
    `idTipoDocumento` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaAlta` DATETIME(3) NOT NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idTipoDocumento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoArchivo` (
    `idTipoArchivo` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `extension` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idTipoArchivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NotificacionToTipoNotificacion` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NotificacionToTipoNotificacion_AB_unique`(`A`, `B`),
    INDEX `_NotificacionToTipoNotificacion_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `Rol`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_idPermiso_fkey` FOREIGN KEY (`idPermiso`) REFERENCES `Permiso`(`idPermiso`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_idRol_fkey` FOREIGN KEY (`idRol`) REFERENCES `Rol`(`idRol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cuenta` ADD CONSTRAINT `Cuenta_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perfil` ADD CONSTRAINT `Perfil_idCuenta_fkey` FOREIGN KEY (`idCuenta`) REFERENCES `Cuenta`(`idCuenta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionEstado` ADD CONSTRAINT `NotificacionEstado_idNotificacion_fkey` FOREIGN KEY (`idNotificacion`) REFERENCES `Notificacion`(`idNotificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionEstado` ADD CONSTRAINT `NotificacionEstado_idEstadoNotificacion_fkey` FOREIGN KEY (`idEstadoNotificacion`) REFERENCES `EstadoNotificacion`(`idEstadoNotificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfiguracionNotificacion` ADD CONSTRAINT `ConfiguracionNotificacion_idNotificacion_fkey` FOREIGN KEY (`idNotificacion`) REFERENCES `Notificacion`(`idNotificacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfiguracionNotificacion` ADD CONSTRAINT `ConfiguracionNotificacion_idTipoFrecuencia_fkey` FOREIGN KEY (`idTipoFrecuencia`) REFERENCES `TipoFrecuencia`(`idTipoFrecuencia`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfiguracionNotificacion` ADD CONSTRAINT `ConfiguracionNotificacion_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medicamento` ADD CONSTRAINT `Medicamento_idUnidadMedicamento_fkey` FOREIGN KEY (`idUnidadMedicamento`) REFERENCES `UnidadMedicamento`(`idUnidadMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoEstado` ADD CONSTRAINT `MedicamentoEstado_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoEstado` ADD CONSTRAINT `MedicamentoEstado_idEstadoMedicamento_fkey` FOREIGN KEY (`idEstadoMedicamento`) REFERENCES `EstadoMedicamento`(`idEstadoMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `Categoria`(`idCategoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registro` ADD CONSTRAINT `Registro_idMedico_fkey` FOREIGN KEY (`idMedico`) REFERENCES `Medico`(`idMedico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroMedicamento` ADD CONSTRAINT `RegistroMedicamento_idMedicamento_fkey` FOREIGN KEY (`idMedicamento`) REFERENCES `Medicamento`(`idMedicamento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroMedicamento` ADD CONSTRAINT `RegistroMedicamento_idRegistro_fkey` FOREIGN KEY (`idRegistro`) REFERENCES `Registro`(`idRegistro`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medico` ADD CONSTRAINT `Medico_idEspecialidad_fkey` FOREIGN KEY (`idEspecialidad`) REFERENCES `Especialidad`(`idEspecialidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Medico` ADD CONSTRAINT `Medico_idPerfil_fkey` FOREIGN KEY (`idPerfil`) REFERENCES `Perfil`(`idPerfil`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_idTipoDocumento_fkey` FOREIGN KEY (`idTipoDocumento`) REFERENCES `TipoDocumento`(`idTipoDocumento`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_idMedico_fkey` FOREIGN KEY (`idMedico`) REFERENCES `Medico`(`idMedico`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_idRegistro_fkey` FOREIGN KEY (`idRegistro`) REFERENCES `Registro`(`idRegistro`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotificacionToTipoNotificacion` ADD CONSTRAINT `_NotificacionToTipoNotificacion_A_fkey` FOREIGN KEY (`A`) REFERENCES `Notificacion`(`idNotificacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NotificacionToTipoNotificacion` ADD CONSTRAINT `_NotificacionToTipoNotificacion_B_fkey` FOREIGN KEY (`B`) REFERENCES `TipoNotificacion`(`idTipoNotificacion`) ON DELETE CASCADE ON UPDATE CASCADE;
