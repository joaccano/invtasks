import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {TipoArchivoController} from "../controllers/tipo-archivo.controller";
import {EstadoUsuarioController} from "../controllers/estado-usuario.controller";
import {PermisoController} from "../controllers/permiso.controller";
import {AuthController} from "../controllers/auth.controller";
import {RolController} from "../controllers/rol.controller";
import {UsuarioController} from "../controllers/usuario.controller";
import {TipoDocumentoController} from "../controllers/tipo-documento.controller";
import {EspecialidadController} from "../controllers/especialidad.controller";
import {EstadoMedicamentoController} from "../controllers/estado-medicamento.controller";
import {UnidadMedicamentoController} from "../controllers/unidad-medicamento.controller";
import {MedicoController} from "../controllers/medico.controller";
import {MedicamentoController} from "../controllers/medicamento.controller";
import {InventarioController} from "../controllers/inventario.controller";
import {EstadoNotificacionController} from "../controllers/estado-notificacion.controller";
import {TipoFrecuenciaController} from "../controllers/tipo-frecuencia.controller";
import {NotificacionController} from "../controllers/notificacion.controller";
import {RegistroController} from "../controllers/registro.controller";
import {PerfilController} from "../controllers/perfil.controller";
import {TipoNotificacionController} from "../controllers/tipo-notificacion.controller";
import {CategoriaController} from "../controllers/categoria.controller";
import {ReporteMedicamentosUsadosController} from "../controllers/reporte-medicamento-usado.controller";
import {ReporteRegistrosController} from "../controllers/reporte-registros.controller";
import {ReporteUsuariosActivosController} from "../controllers/reporte-usuario.controller";
import {ReporteMedicamentosController} from "../controllers/reporte-medicamentos.controller";
import {ReporteFuncionalidadesController} from "../controllers/reporte-funcionalidades.controller";
import {ReporteRangosEdadController} from "../controllers/reporte-edades.controller";
import { RegistroCompartidoController } from "../controllers/registro-compartido.controller";
import { RegistroTokenController } from "../controllers/registro-token.controller";
import { BackupController } from "../controllers/backup.controller";
import {ReporteProgresoMedicamentosController} from "../controllers/reporte-medicamentos-progreso.controller"

import upload from '../multer';
import { DocumentoController } from "../controllers/documento.controller";
import { RolPermisoController } from "../controllers/rol-permiso.controller";
import { ConfiguracionNotificacionController } from "../controllers/configuracion-notificacion.controller";
import { TestController } from "../controllers/test.controller";
import { ReporteMedicosMasVisitadosController } from "../controllers/reporte-medicos.controller";

const router = express.Router();

// auth
router.post("/auth/log-in", AuthController.logIn);
router.post("/auth/sign-up", AuthController.createUser);
router.post("/auth/login-social", AuthController.loginSocial);
router.post("/auth/activar-cuenta/:token", AuthController.activateAccount);

// tipoArchivo
router.get("/tipo-archivos", [authMiddleware], TipoArchivoController.getAll);
router.get("/tipo-archivos/:id", [authMiddleware], TipoArchivoController.getById);
router.post("/tipo-archivos", [authMiddleware], TipoArchivoController.create);
router.put("/tipo-archivos/:id", [authMiddleware], TipoArchivoController.update);
router.delete("/tipo-archivos/:id", [authMiddleware], TipoArchivoController.delete);

// estadoUsuario
router.get("/estado-usuarios", [authMiddleware], EstadoUsuarioController.getAll);
router.get("/estado-usuarios/:id", [authMiddleware], EstadoUsuarioController.getById);
router.post("/estado-usuarios", [authMiddleware], EstadoUsuarioController.create);
router.put("/estado-usuarios/:id", [authMiddleware], EstadoUsuarioController.update);
router.delete("/estado-usuarios/:id", [authMiddleware], EstadoUsuarioController.delete);

// permiso
router.get("/permisos", [authMiddleware], PermisoController.getAll);
router.get("/permissions", [authMiddleware], PermisoController.getAdminAll);
router.get("/permisos/:id", [authMiddleware], PermisoController.getById);
router.get("/permissions/:id", [authMiddleware], PermisoController.getAdminById);
router.post("/permisos", [authMiddleware], PermisoController.create);
router.put("/permisos/:id", [authMiddleware], PermisoController.update);
router.delete("/permisos/:id", [authMiddleware], PermisoController.delete);

// rol
router.get("/roles", [authMiddleware], RolController.getAll);
router.get("/roles/permisos", [authMiddleware], RolController.getAllPermissions);
router.get("/roles/:id", [authMiddleware], RolController.getById);
router.get("/roles2/:id", [authMiddleware], RolController.getAdminById);
router.post("/roles", [authMiddleware], RolController.create);
router.put("/roles/:id", [authMiddleware], RolController.update);
router.delete("/roles/:id", [authMiddleware], RolController.delete);

// rolPermiso
router.get("/rol-permisos", [authMiddleware], RolPermisoController.getAll);

// usuario
router.get("/usuarios", [authMiddleware], UsuarioController.getAll);
router.get("/usuarios/roles", [authMiddleware], UsuarioController.getAllRoles);
router.get("/usuarios/:id", [authMiddleware], UsuarioController.getById);
router.post("/usuarios/solicitar-codigo-activacion", [authMiddleware], UsuarioController.activateAccountRequest);
router.post("/usuarios/activar-cuenta", [authMiddleware], UsuarioController.activateAccount);
router.post("/usuarios/olvido-contrasenia", UsuarioController.forgotPassword); // No requiere autenticación porque el usuario no va a estar logueado. 1er parte del proceso de recuperar contraseña olvidada
router.post("/usuarios/resetear-contrasenia", UsuarioController.resetPassword); // No requiere autenticación porque el usuario no va a estar logueado. 2da parte del proceso de recuperar contraseña olvidada
router.post("/usuarios", [authMiddleware], UsuarioController.create);
router.put("/usuarios/token-notificacion", [authMiddleware], UsuarioController.setTokenNotificacion);
router.put("/usuarios/:id", [authMiddleware], UsuarioController.updateById);
router.delete("/usuarios/:id", [authMiddleware], UsuarioController.delete);

// tipoDocumento
router.get("/tipo-documentos", [authMiddleware], TipoDocumentoController.getAll);
router.get("/tipo-documentos/:id", [authMiddleware], TipoDocumentoController.getById);
router.post("/tipo-documentos", [authMiddleware], TipoDocumentoController.create);
router.put("/tipo-documentos/:id", [authMiddleware], TipoDocumentoController.update);
router.delete("/tipo-documentos/:id", [authMiddleware], TipoDocumentoController.delete);

// especialidad
router.get("/especialidades", [authMiddleware], EspecialidadController.getAll);
router.get("/especialidades/:id", [authMiddleware], EspecialidadController.getById);
router.post("/especialidades", [authMiddleware], EspecialidadController.create);
router.put("/especialidades/:id", [authMiddleware], EspecialidadController.update);
router.delete("/especialidades/:id", [authMiddleware], EspecialidadController.delete);

// estadoMedicamento
router.get("/estado-medicamentos", [authMiddleware], EstadoMedicamentoController.getAll);
router.get("/estado-medicamentos/:id", [authMiddleware], EstadoMedicamentoController.getById);
router.post("/estado-medicamentos", [authMiddleware], EstadoMedicamentoController.create);
router.put("/estado-medicamentos/:id", [authMiddleware], EstadoMedicamentoController.update);
router.delete("/estado-medicamentos/:id", [authMiddleware], EstadoMedicamentoController.delete);

// unindadMedicamento   
router.get("/unidad-medicamentos", [authMiddleware], UnidadMedicamentoController.getAll);
router.get("/unidad-medicamentos/:id", [authMiddleware], UnidadMedicamentoController.getById);
router.post("/unidad-medicamentos", [authMiddleware], UnidadMedicamentoController.create);
router.put("/unidad-medicamentos/:id", [authMiddleware], UnidadMedicamentoController.update);
router.delete("/unidad-medicamentos/:id", [authMiddleware], UnidadMedicamentoController.delete);

router.get("/medicos", [authMiddleware], MedicoController.getAll);
router.get("/medicos/:id", [authMiddleware], MedicoController.getById);
router.post("/medicos", [authMiddleware], MedicoController.create);
router.put("/medicos/:id", [authMiddleware], MedicoController.update);
router.delete("/medicos/:id", [authMiddleware], MedicoController.delete);

// medicamento
router.get("/medicamentos", [authMiddleware], MedicamentoController.getAll);
router.get('/medicamentos/nombre-farmaco/:nombreFarmaco', [authMiddleware], MedicamentoController.getByNombreFarmaco);
router.get('/medicamentos/estado/:nombreEstado', [authMiddleware], MedicamentoController.getByStatus);
router.get('/medicamentos/nombre-generico/:nombreGenerico', [authMiddleware], MedicamentoController.getByNombreGenerico);
router.get("/medicamentos/unidades-medicamentos", [authMiddleware], MedicamentoController.getAllUnits);
router.get("/medicamentos/:id", [authMiddleware], MedicamentoController.getById);
router.post("/medicamentos", [authMiddleware], MedicamentoController.create);
router.post("/medicamentos/import", [authMiddleware], upload.single('file'), MedicamentoController.uploadRegisters);
router.put("/medicamentos/:id", [authMiddleware], MedicamentoController.update);
router.delete("/medicamentos/:id", [authMiddleware], MedicamentoController.delete);
router.get("/medicamentos/nombre-farmaco",[authMiddleware], MedicamentoController.getByName);

// inventario
router.get("/inventarios", [authMiddleware], InventarioController.getAll);
// router.get("/inventarios/:idPerfil", [authMiddleware], InventarioController.getInventariosByPerfil); // Recuperar todos los inventarios de un perfil.
router.get("/inventarios/:id", [authMiddleware], InventarioController.getById);
router.post("/inventarios", [authMiddleware], InventarioController.create);
router.put("/inventarios/:id", [authMiddleware], InventarioController.update);
router.patch("/inventarios/tomar-medicamento/:idInventario", [authMiddleware], InventarioController.takeMedicine); // Tomar un medicamento de un inventario.
router.delete("/inventarios/:id", [authMiddleware], InventarioController.delete);

// estadoNotificacion
router.get("/estado-notificaciones", [authMiddleware], EstadoNotificacionController.getAll);
router.get("/estado-notificaciones/:id", [authMiddleware], EstadoNotificacionController.getById);
router.post("/estado-notificaciones", [authMiddleware], EstadoNotificacionController.create);
router.put("/estado-notificaciones/:id", [authMiddleware], EstadoNotificacionController.update);
router.delete("/estado-notificaciones/:id", [authMiddleware], EstadoNotificacionController.delete);

// tipoFrecuencia
router.get("/tipo-frecuencias", [authMiddleware], TipoFrecuenciaController.getAll);
router.get("/tipo-frecuencias/:id", [authMiddleware], TipoFrecuenciaController.getById);
router.post("/tipo-frecuencias", [authMiddleware], TipoFrecuenciaController.create);
router.put("/tipo-frecuencias/:id", [authMiddleware], TipoFrecuenciaController.update);
router.delete("/tipo-frecuencias/:id", [authMiddleware], TipoFrecuenciaController.delete);

//notificacion
router.get("/notificaciones", [authMiddleware], NotificacionController.getAll);
router.get("/notificaciones/:id", [authMiddleware], NotificacionController.getById);
router.post("/notificaciones", [authMiddleware], NotificacionController.create);
router.put("/notificaciones/:id", [authMiddleware], NotificacionController.update);
router.delete("/notificaciones/:id", [authMiddleware], NotificacionController.delete);

router.post("/notificaciones/:id/testear-push", [authMiddleware], NotificacionController.testPushById);
router.post("/notificaciones/:token/accion", NotificacionController.pushByToken);

router.post("/notificaciones/:id_notificacion/configuracion-notificaciones", [authMiddleware], ConfiguracionNotificacionController.create);
router.put("/notificaciones/:id_notificacion/configuracion-notificaciones/:id_configuracion_notificacion", [authMiddleware], ConfiguracionNotificacionController.update);
router.get("/configuracion-notificaciones", [authMiddleware], ConfiguracionNotificacionController.getAll);
router.get("/configuracion-notificaciones/:id", [authMiddleware], ConfiguracionNotificacionController.getById);
router.delete("/configuracion-notificaciones/:id", [authMiddleware], ConfiguracionNotificacionController.delete);

// registro
router.get('/registros', [authMiddleware], RegistroController.getAll);
router.get('/registros/:id', [authMiddleware], RegistroController.getById)
router.post('/registros/', [authMiddleware], upload.single('file'), RegistroController.create);
router.put('/registros/:id', [authMiddleware], RegistroController.update)
router.delete('/registros/:id', [authMiddleware], RegistroController.delete);

// documentos del registro
router.get('/registros/:id_registro/documentos', [authMiddleware], RegistroController.getAllDoc)
router.get('/registros/:id_registro/documentos/:id_documento', [authMiddleware], RegistroController.getDoc)
router.post('/registros/:id/documentos', [authMiddleware], upload.single('file'), RegistroController.addDoc)
router.put('/registros/:id_registro/documentos/:id_documento', [authMiddleware], upload.single('file'), RegistroController.updateDoc)
router.delete('/registros/:id_registro/documentos/:id_documento', [authMiddleware], RegistroController.deleteDoc)

// medicamentos del registro
router.get('/registros/:id_registro/medicamentos/:id_registro_medicamento', [authMiddleware], RegistroController.getMed)
router.post('/registros/:id/medicamentos', [authMiddleware], RegistroController.addMed)
router.put('/registros/:id_registro/medicamentos/:id_registro_medicamento', [authMiddleware], RegistroController.updateMed)
router.delete('/registros/:id_registro/medicamentos/:id_registro_medicamento', [authMiddleware], RegistroController.deleteMed)

// documentos
router.get('/documentos', DocumentoController.getAll)

// perfil
router.get('/perfiles', [authMiddleware], PerfilController.getAll);
router.get('/perfiles/:id', [authMiddleware], PerfilController.getById);
router.post('/perfiles', [authMiddleware], PerfilController.create);
router.put('/perfiles/:id', [authMiddleware], PerfilController.update);

// tipoNotificacion
router.get("/tipo-notificaciones", [authMiddleware], TipoNotificacionController.getAll);
router.get("/tipo-notificaciones/:id", [authMiddleware], TipoNotificacionController.getById);
router.post("/tipo-notificaciones", [authMiddleware], TipoNotificacionController.create);
router.put("/tipo-notificaciones/:id", [authMiddleware], TipoNotificacionController.update);
router.delete("/tipo-notificaciones/:id", [authMiddleware], TipoNotificacionController.delete);

// categoria
router.get("/categorias", [authMiddleware], CategoriaController.getAll);
router.get("/categorias/:id", [authMiddleware], CategoriaController.getById);
router.post("/categorias", [authMiddleware], CategoriaController.create);
router.put("/categorias/:id", [authMiddleware], CategoriaController.update);
router.delete("/categorias/:id", [authMiddleware], CategoriaController.delete);

// reportes
router.get("/reporte-medicamentos-usados/", [authMiddleware], ReporteMedicamentosUsadosController.getAll)
router.get("/reporte-registros",[authMiddleware], ReporteRegistrosController.getAll)
router.get("/reporte-medicamentos-usados/:id", [authMiddleware], ReporteMedicamentosUsadosController.getById)
router.get("/reporte-usuarios", [authMiddleware], ReporteUsuariosActivosController.getUsuariosActivos)
router.get("/reporte-medicamentos", [authMiddleware], ReporteMedicamentosController.getAll)
router.get("/reporte-funcionalidades", [authMiddleware], ReporteFuncionalidadesController.getFuncionalidades)
router.get("/reporte-edades", [authMiddleware], ReporteRangosEdadController.getPercentageByAgeRange)

router.get("/reporte-progreso-medicamento/:id", [authMiddleware], ReporteProgresoMedicamentosController.getProgressMed)
router.get("/reporte-medico/:id", [authMiddleware], ReporteMedicosMasVisitadosController.getRanking)


// registroCompartido
router.post("/obtener-permisos/:id", [authMiddleware], RegistroCompartidoController.getUrlRegister)
router.get("/shared-records/:token", RegistroTokenController.getById)

 router.get("/obtener-backups", [authMiddleware],  BackupController.getBackups)
 router.post("/generar-backups", [authMiddleware],  BackupController.createBackup)
 router.post("/restaurar-backups", [authMiddleware],  BackupController.restoreBackup)

 router.post("/test", TestController.test)


export default router;