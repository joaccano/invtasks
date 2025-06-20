-- CreateTable
CREATE TABLE `EstadoUsuario` (
    `idEstadoUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NULL,
    `fechaAlta` DATETIME(3) NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idEstadoUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsuarioEstado` (
    `idUsuarioEstado` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NOT NULL,
    `idEstadoUsuario` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NULL,
    `fechaHasta` DATETIME(3) NULL,

    PRIMARY KEY (`idUsuarioEstado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsuarioEstado` ADD CONSTRAINT `UsuarioEstado_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEstado` ADD CONSTRAINT `UsuarioEstado_idEstadoUsuario_fkey` FOREIGN KEY (`idEstadoUsuario`) REFERENCES `EstadoUsuario`(`idEstadoUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
