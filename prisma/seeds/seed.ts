import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
    const saltRoundsBcrypt: number = Number(process.env.SALT_ROUNDS_BCRYPT);
    const passwordBcrypt: string = String(process.env.PASSWORD_BCRYPT);
    // Crear roles
    const rolAdmin = await prisma.rol.create({
        data: {
            nombre: 'Administrador',
            descripcion: 'Rol con todos los permisos',
            fechaAlta: new Date(),
        },
    });

    const rolUsuario = await prisma.rol.create({
        data: {
            nombre: 'Usuario',
            descripcion: 'Rol con permisos limitados',
            fechaAlta: new Date(),
        },
    });

    const rolUsuarioRestringido = await prisma.rol.create({
        data: {
            nombre: 'Usuario Restringido',
            descripcion: 'Rol con permisos limitados y restringidos',
            fechaAlta: new Date(),
        },
    });

    // Crear permisos
    const p = [{ nombre: 'usuarios', descripcion: 'Permiso para gestion de usuarios' },
    { nombre: 'roles', descripcion: 'Permiso para gestiion de roles' },
    { nombre: 'permisos', descripcion: 'Permiso para gestion de permisos' },
    { nombre: 'medicamentos', descripcion: 'Permiso para gestion de medicamentos' },
    { nombre: 'unidades', descripcion: 'Permiso para unidades de medicamento' },
    { nombre: 'tipos', descripcion: 'Permiso para gestion de tipo de archivos' },
    { nombre: 'especialidades', descripcion: 'Permiso para gestion de especialidades' },
    { nombre: 'reportes', descripcion: 'Permiso para gestion de reportes' },
    { nombre: 'backups', descripcion: 'Permiso para gestion de backups' }]

    await Promise.all(
        p.map(async ({ nombre, descripcion }) => {
            ["leer", "crear", "editar", "eliminar"].map(async (accion) => {
              const name = `admin_${nombre}_${accion}`;
              const permission = await prisma.permiso.create({
                data: {
                  nombre: name,
                  descripcion,
                  fechaAlta: new Date(),
                  fechaBaja: null,
                },
              });
              await prisma.rolPermiso.create({
                data: {
                  idRol: rolAdmin.idRol,
                  idPermiso: permission.idPermiso,
                  fechaDesde: new Date(),
                },
              });
            });
        })
    );

    const permisosModulos = [
        'medicamento',
        'documento',
        'medico',
        'perfil',
        'notificacion',
        'reporte',
        'categoria',
        'registro'
    ];

    const acciones = ['list', 'show', 'create', 'edit', 'delete'];

    const permisosModulosCreacion = await Promise.all(
        permisosModulos.flatMap((modulo) =>
            acciones.map(async (accion) => {
                const permiso = await prisma.permiso.create({
                    data: {
                        nombre: `${accion}-${modulo}`,
                        descripcion: `Permiso para ${accion} ${modulo}`,
                        fechaAlta: new Date(),
                    },
                });
                return permiso;
            })
        )
    );

    const [
        permisoListMedicamento,
        permisoShowMedicamento,
        permisoCreateMedicamento,
        permisoEditMedicamento,
        permisoDeleteMedicamento,
        permisoListDocumento,
        permisoShowDocumento,
        permisoCreateDocumento,
        permisoEditDocumento,
        permisoDeleteDocumento,
        permisoListMedico,
        permisoShowMedico,
        permisoCreateMedico,
        permisoEditMedico,
        permisoDeleteMedico,
        permisoListPerfil,
        permisoShowPerfil,
        permisoCreatePerfil,
        permisoEditPerfil,
        permisoDeletePerfil,
        permisoListNotificacion,
        permisoShowNotificacion,
        permisoCreateNotificacion,
        permisoEditNotificacion,
        permisoDeleteNotificacion,
        permisoListReporte,
        permisoShowReporte,
        permisoCreateReporte,
        permisoEditReporte,
        permisoDeleteReporte,
        permisoListCategoria,
        permisoShowCategoria,
        permisoCreateCategoria,
        permisoEditCategoria,
        permisoDeleteCategoria,
        permisoListRegistro,
        permisoShowRegistro,
        permisoCreateRegistro,
        permisoEditRegistro,
        permisoDeleteRegistro,
    ] = permisosModulosCreacion;



    const permisosUsuario = [
        permisoListMedicamento,
        permisoShowMedicamento,
        permisoCreateMedicamento,
        permisoEditMedicamento,
        permisoDeleteMedicamento,
        permisoListDocumento,
        permisoShowDocumento,
        permisoCreateDocumento,
        permisoEditDocumento,
        permisoDeleteDocumento,
        permisoListMedico,
        permisoShowMedico,
        permisoCreateMedico,
        permisoEditMedico,
        permisoDeleteMedico,
        permisoListPerfil,
        permisoShowPerfil,
        permisoCreatePerfil,
        permisoEditPerfil,
        permisoDeletePerfil,
        permisoListNotificacion,
        permisoShowNotificacion,
        permisoCreateNotificacion,
        permisoEditNotificacion,
        permisoDeleteNotificacion,
        permisoListReporte,
        permisoShowReporte,
        permisoCreateReporte,
        permisoEditReporte,
        permisoDeleteReporte,
        permisoListCategoria,
        permisoShowCategoria,
        permisoCreateCategoria,
        permisoEditCategoria,
        permisoDeleteCategoria,
        permisoListRegistro,
        permisoShowRegistro,
        permisoCreateRegistro,
        permisoEditRegistro,
        permisoDeleteRegistro,
    ];

    await Promise.all(
        permisosUsuario.map(async (permiso) => {
            await prisma.rolPermiso.create({
                data: {
                    idRol: rolUsuario.idRol,
                    idPermiso: permiso.idPermiso,
                    fechaDesde: new Date(),
                },
            });
        })
    );

    //---------------------------------------------

    

    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListMedicamento.idPermiso, // Usando el id del permiso 'list-medicamento'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-documento'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListDocumento.idPermiso, // Usando el id del permiso 'list-documento'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-medico'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListMedico.idPermiso, // Usando el id del permiso 'list-medico'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-perfil'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListPerfil.idPermiso, // Usando el id del permiso 'list-perfil'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-notificacion'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListNotificacion.idPermiso, // Usando el id del permiso 'list-notificacion'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-reporte'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListReporte.idPermiso, // Usando el id del permiso 'list-reporte'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-categoria'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListCategoria.idPermiso, // Usando el id del permiso 'list-categoria'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'list-registro'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoListRegistro.idPermiso, // Usando el id del permiso 'list-registro'
            fechaDesde: new Date(),
        },
    });

    // Relación entre el rol 'Usuario' y el permiso 'show-registro'
    await prisma.rolPermiso.create({
        data: {
            idRol: rolUsuarioRestringido.idRol,
            idPermiso: permisoShowRegistro.idPermiso, // Usando el id del permiso 'show-registro'
            fechaDesde: new Date(),
        },
    });

    //--------------------------------------------
    // Crear Estados de Usuario
    const estadoActivo = await prisma.estadoUsuario.create({
        data: {
            nombre: 'Activo',
            fechaAlta: new Date(),
        },
    });

    const estadoInactivo = await prisma.estadoUsuario.create({
        data: {
            nombre: 'Inactivo',
            fechaAlta: new Date(),
        },
    });

    const estadoCreado = await prisma.estadoUsuario.create({
        data: {
            nombre: 'Creado',
            fechaAlta: new Date(),
        },
    });

    // Obtenemos passowrd hasheado
    let passwordHash: string = '';
    try {
        const salt = await bcrypt.genSalt(saltRoundsBcrypt);
        const hash = await bcrypt.hash(passwordBcrypt, salt);
        passwordHash = hash;
    } catch (error: any) {
        console.error('Error:', error);
    }

    // Crear Usuarios
    await prisma.usuario.create({
        data: {
            idRol: rolAdmin.idRol,
            nombreUsuario: 'Gregor',
            email: 'fgregorio@argency.com',
            contrasenia: "$10$.bqcMHlXHDKZz4SaWR3HeeW8tK6.gglnc9xd1elBD/rCUq6VsqrMO", // Asegúrate de cifrar las contraseñas en producción
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });
    const usuario1 = await prisma.usuario.create({
        data: {
            idRol: rolAdmin.idRol,
            nombreUsuario: 'adminUser',
            email: 'admin2@example.com',
            contrasenia: passwordHash, // Asegúrate de cifrar las contraseñas en producción
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    const usuario2 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'normalUser',
            email: 'user2@example.com',
            contrasenia: passwordHash, // Asegúrate de cifrar las contraseñas en producción
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    // Asignar estado a usuarios
    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario1.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario2.idUsuario,
            idEstadoUsuario: estadoInactivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    // Crear Cuentas
    const cuenta1 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario1.idUsuario,
        },
    });

    const cuenta2 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario2.idUsuario,
        },
    });

    // Crear Perfiles
    const perfil1 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta1.idCuenta,
            principal: true,
            nombre: 'Admin Perfil',
            apellido: 'Admin Apellido',
            dni: '12345678',
            genero: 'M',
            direccion: 'Admin Address',
            email: 'adminperfil@example.com',
            fechaNacimiento: new Date('1990-01-01'),
        },
    });

    const perfil2 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta2.idCuenta,
            principal: true,
            nombre: 'User Perfil',
            apellido: 'User Apellido',
            dni: '87654321',
            genero: 'F',
            direccion: 'User Address',
            email: 'userperfil@example.com',
            fechaNacimiento: new Date('1995-01-01'),
        },
    });
    // Usuario 3
    const usuario3 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user3',
            email: 'user3@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario3.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta3 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario3.idUsuario,
        },
    });

    const perfil3 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta3.idCuenta,
            principal: true,
            nombre: 'User Perfil 3',
            apellido: 'Apellido 3',
            dni: '10000003',
            genero: 'M',
            direccion: 'Address 3',
            email: 'user3perfil@example.com',
            fechaNacimiento: new Date('1993-01-01'),
        },
    });

    // Usuario 4
    const usuario4 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user4',
            email: 'user4@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario4.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta4 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario4.idUsuario,
        },
    });

    const perfil4 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta4.idCuenta,
            principal: true,
            nombre: 'User Perfil 4',
            apellido: 'Apellido 4',
            dni: '10000004',
            genero: 'F',
            direccion: 'Address 4',
            email: 'user4perfil@example.com',
            fechaNacimiento: new Date('1994-01-01'),
        },
    });

    // Usuario 5
    const usuario5 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user5',
            email: 'user5@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario5.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta5 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario5.idUsuario,
        },
    });

    const perfil5 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta5.idCuenta,
            principal: true,
            nombre: 'User Perfil 5',
            apellido: 'Apellido 5',
            dni: '10000005',
            genero: 'M',
            direccion: 'Address 5',
            email: 'user5perfil@example.com',
            fechaNacimiento: new Date('1995-01-01'),
        },
    });

    // Usuario 6
    const usuario6 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user6',
            email: 'user6@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario6.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta6 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario6.idUsuario,
        },
    });

    const perfil6 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta6.idCuenta,
            principal: true,
            nombre: 'User Perfil 6',
            apellido: 'Apellido 6',
            dni: '10000006',
            genero: 'M',
            direccion: 'Address 6',
            email: 'user6perfil@example.com',
            fechaNacimiento: new Date('1996-01-01'),
        },
    });

    // Usuario 7
    const usuario7 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user7',
            email: 'user7@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario7.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta7 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario7.idUsuario,
        },
    });

    const perfil7 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta7.idCuenta,
            principal: true,
            nombre: 'User Perfil 7',
            apellido: 'Apellido 7',
            dni: '10000007',
            genero: 'F',
            direccion: 'Address 7',
            email: 'user7perfil@example.com',
            fechaNacimiento: new Date('1997-01-01'),
        },
    });

    // Usuario 8
    const usuario8 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user8',
            email: 'user8@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario8.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta8 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario8.idUsuario,
        },
    });

    const perfil8 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta8.idCuenta,
            principal: true,
            nombre: 'User Perfil 8',
            apellido: 'Apellido 8',
            dni: '10000008',
            genero: 'M',
            direccion: 'Address 8',
            email: 'user8perfil@example.com',
            fechaNacimiento: new Date('1998-01-01'),
        },
    });

    // Usuario 9
    const usuario9 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user9',
            email: 'user9@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario9.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta9 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario9.idUsuario,
        },
    });

    const perfil9 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta9.idCuenta,
            principal: true,
            nombre: 'User Perfil 9',
            apellido: 'Apellido 9',
            dni: '10000009',
            genero: 'F',
            direccion: 'Address 9',
            email: 'user9perfil@example.com',
            fechaNacimiento: new Date('1999-01-01'),
        },
    });

    // Usuario 10
    const usuario10 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user10',
            email: 'user10@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario10.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta10 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario10.idUsuario,
        },
    });

    const perfil10 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta10.idCuenta,
            principal: true,
            nombre: 'User Perfil 10',
            apellido: 'Apellido 10',
            dni: '10000010',
            genero: 'M',
            direccion: 'Address 10',
            email: 'user10perfil@example.com',
            fechaNacimiento: new Date('2000-01-01'),
        },
    });

    // Usuario 11
    const usuario11 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user11',
            email: 'user11@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario11.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta11 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario11.idUsuario,
        },
    });

    const perfil11 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta11.idCuenta,
            principal: true,
            nombre: 'User Perfil 11',
            apellido: 'Apellido 11',
            dni: '10000011',
            genero: 'F',
            direccion: 'Address 11',
            email: 'user11perfil@example.com',
            fechaNacimiento: new Date('2001-01-01'),
        },
    });

    // Usuario 12
    const usuario12 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user12',
            email: 'user12@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario12.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta12 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario12.idUsuario,
        },
    });

    const perfil12 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta12.idCuenta,
            principal: true,
            nombre: 'User Perfil 12',
            apellido: 'Apellido 12',
            dni: '10000012',
            genero: 'F',
            direccion: 'Address 11',
            email: 'user12perfil@example.com',
            fechaNacimiento: new Date('2001-01-01'),
        },
    });

    // Crear Usuarios, Cuentas y Perfiles para perfiles del 13 al 18

    // Usuario 13
    const usuario13 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user13',
            email: 'user13@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario13.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta13 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario13.idUsuario,
        },
    });

    const perfil13 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta13.idCuenta,
            principal: true,
            nombre: 'User Perfil 13',
            apellido: 'Apellido 13',
            dni: '10000013',
            genero: 'M',
            direccion: 'Address 13',
            email: 'user13perfil@example.com',
            fechaNacimiento: new Date('2002-01-01'),
        },
    });

    // Usuario 14
    const usuario14 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user14',
            email: 'user14@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario14.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta14 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario14.idUsuario,
        },
    });

    const perfil14 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta14.idCuenta,
            principal: true,
            nombre: 'User Perfil 14',
            apellido: 'Apellido 14',
            dni: '10000014',
            genero: 'F',
            direccion: 'Address 14',
            email: 'user14perfil@example.com',
            fechaNacimiento: new Date('2003-01-01'),
        },
    });

    // Usuario 15
    const usuario15 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user15',
            email: 'user15@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario15.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta15 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario15.idUsuario,
        },
    });

    const perfil15 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta15.idCuenta,
            principal: true,
            nombre: 'User Perfil 15',
            apellido: 'Apellido 15',
            dni: '10000015',
            genero: 'M',
            direccion: 'Address 15',
            email: 'user15perfil@example.com',
            fechaNacimiento: new Date('2004-01-01'),
        },
    });

    // Usuario 16
    const usuario16 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user16',
            email: 'user16@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario16.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta16 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario16.idUsuario,
        },
    });

    const perfil16 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta16.idCuenta,
            principal: true,
            nombre: 'User Perfil 16',
            apellido: 'Apellido 16',
            dni: '10000016',
            genero: 'F',
            direccion: 'Address 16',
            email: 'user16perfil@example.com',
            fechaNacimiento: new Date('2005-01-01'),
        },
    });

    // Usuario 17
    const usuario17 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user17',
            email: 'user17@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario17.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta17 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario17.idUsuario,
        },
    });

    const perfil17 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta17.idCuenta,
            principal: true,
            nombre: 'User Perfil 17',
            apellido: 'Apellido 17',
            dni: '10000017',
            genero: 'M',
            direccion: 'Address 17',
            email: 'user17perfil@example.com',
            fechaNacimiento: new Date('2006-01-01'),
        },
    });

    // Usuario 18
    const usuario18 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user18',
            email: 'user18@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario18.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta18 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario18.idUsuario,
        },
    });

    const perfil18 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta18.idCuenta,
            principal: true,
            nombre: 'User Perfil 18',
            apellido: 'Apellido 18',
            dni: '10000018',
            genero: 'F',
            direccion: 'Address 18',
            email: 'user18perfil@example.com',
            fechaNacimiento: new Date('2007-01-01'),
        },
    });

    // Crear Medicamentos
    const unidadMedicamento = await prisma.unidadMedicamento.create({
        data: {
            nombre: 'Caja',
            indicaciones: 'Para medicamentos en caja',
            unidadDeMedida: 10,
            cantidadDeDosis: 1
        },
    });

    // Usuario 19
    const usuario19 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user19',
            email: 'user19@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario19.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta19 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario19.idUsuario,
        },
    });

    const perfil19 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta19.idCuenta,
            principal: true,
            nombre: 'User Perfil 19',
            apellido: 'Apellido 19',
            dni: '10000019',
            genero: 'M',
            direccion: 'Address 19',
            email: 'user19perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 20
    const usuario20 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user20',
            email: 'user20@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario20.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta20 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario20.idUsuario,
        },
    });

    const perfil20 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta20.idCuenta,
            principal: true,
            nombre: 'User Perfil 20',
            apellido: 'Apellido 20',
            dni: '10000020',
            genero: 'F',
            direccion: 'Address 20',
            email: 'user20perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 21
    const usuario21 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user21',
            email: 'user21@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario21.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta21 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario21.idUsuario,
        },
    });

    const perfil21 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta21.idCuenta,
            principal: true,
            nombre: 'User Perfil 21',
            apellido: 'Apellido 21',
            dni: '10000021',
            genero: 'M',
            direccion: 'Address 21',
            email: 'user21perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 22
    const usuario22 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user22',
            email: 'user22@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario22.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta22 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario22.idUsuario,
        },
    });

    const perfil22 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta22.idCuenta,
            principal: true,
            nombre: 'User Perfil 22',
            apellido: 'Apellido 22',
            dni: '10000022',
            genero: 'F',
            direccion: 'Address 22',
            email: 'user22perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 23
    const usuario23 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user23',
            email: 'user23@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario23.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta23 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario23.idUsuario,
        },
    });

    const perfil23 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta23.idCuenta,
            principal: true,
            nombre: 'User Perfil 23',
            apellido: 'Apellido 23',
            dni: '10000023',
            genero: 'M',
            direccion: 'Address 23',
            email: 'user23perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 24
    const usuario24 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user24',
            email: 'user24@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario24.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta24 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario24.idUsuario,
        },
    });

    const perfil24 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta24.idCuenta,
            principal: true,
            nombre: 'User Perfil 24',
            apellido: 'Apellido 24',
            dni: '10000024',
            genero: 'F',
            direccion: 'Address 24',
            email: 'user24perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 25
    const usuario25 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user25',
            email: 'user25@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario25.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta25 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario25.idUsuario,
        },
    });

    const perfil25 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta25.idCuenta,
            principal: true,
            nombre: 'User Perfil 25',
            apellido: 'Apellido 25',
            dni: '10000025',
            genero: 'M',
            direccion: 'Address 25',
            email: 'user25perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 26
    const usuario26 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user26',
            email: 'user26@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario26.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta26 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario26.idUsuario,
        },
    });

    const perfil26 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta26.idCuenta,
            principal: true,
            nombre: 'User Perfil 26',
            apellido: 'Apellido 26',
            dni: '10000026',
            genero: 'F',
            direccion: 'Address 26',
            email: 'user26perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 27
    const usuario27 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user27',
            email: 'user27@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario27.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta27 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario27.idUsuario,
        },
    });

    const perfil27 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta27.idCuenta,
            principal: true,
            nombre: 'User Perfil 27',
            apellido: 'Apellido 27',
            dni: '10000027',
            genero: 'M',
            direccion: 'Address 27',
            email: 'user27perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario 28
    const usuario28 = await prisma.usuario.create({
        data: {
            idRol: rolUsuario.idRol,
            nombreUsuario: 'user28',
            email: 'user28@example.com',
            contrasenia: passwordHash,
            fechaModificacion: new Date(),
            fechaUltimoLogin: new Date(),
        },
    });

    await prisma.usuarioEstado.create({
        data: {
            idUsuario: usuario28.idUsuario,
            idEstadoUsuario: estadoActivo.idEstadoUsuario,
            fechaDesde: new Date(),
        },
    });

    const cuenta28 = await prisma.cuenta.create({
        data: {
            idUsuario: usuario28.idUsuario,
        },
    });

    const perfil28 = await prisma.perfil.create({
        data: {
            idCuenta: cuenta28.idCuenta,
            principal: true,
            nombre: 'User Perfil 28',
            apellido: 'Apellido 28',
            dni: '10000028',
            genero: 'F',
            direccion: 'Address 28',
            email: 'user28perfil@example.com',
            fechaNacimiento: new Date('1970-01-01'),
        },
    });

    // Usuario prueba (con fechaCreacion en 2024-11-11)
const usuarioPruebaEdad = await prisma.usuario.create({
    data: {
      idRol: rolUsuario.idRol,                    // Usa el rol que corresponda
      nombreUsuario: 'usuarioPrueba',
      email: 'usuarioprueba@example.com',         // Asegúrate de que esté libre
      contrasenia: passwordHash,                  // Tu contraseña hasheada
      fechaCreacion: new Date('2024-11-11T00:00:00Z'), // Sobrescribe el valor por defecto
      fechaModificacion: new Date(),             // Lo pones a hoy o a la fecha que quieras
      fechaUltimoLogin: new Date(),              // Igual, fecha libre
    },
  });
  
  // Asignar un estado al usuario (ej. 'Activo')
  await prisma.usuarioEstado.create({
    data: {
      idUsuario: usuarioPruebaEdad.idUsuario,
      idEstadoUsuario: estadoActivo.idEstadoUsuario, // El estado 'Activo' o el que uses
      fechaDesde: new Date(),
    },
  });
  
  // Crear la cuenta asociada al usuario
  const cuentaPruebaEdad = await prisma.cuenta.create({
    data: {
      idUsuario: usuarioPruebaEdad.idUsuario,
    },
  });
  
  // Crear el perfil principal
  const perfilPruebaEdad = await prisma.perfil.create({
    data: {
      idCuenta: cuentaPruebaEdad.idCuenta,
      principal: true,
      nombre: 'Usuario',
      apellido: 'Prueba',
      dni: '10000111',
      genero: 'F',                              // O 'M', según prefieras
      direccion: 'Dirección Prueba',
      email: 'usuariopruebaperfil@example.com', // Verifica que no colisione
      fechaNacimiento: new Date('1985-01-01'),  // Fecha de nacimiento de prueba
    },
  });
  
    // Crear estados de medicamento
    const estado1 = await prisma.estadoMedicamento.create({
        data: {
            nombre: 'Activo',
            descripcion: 'El medicamento está en uso',
            fechaAlta: new Date(),
        },
    });

    const estado2 = await prisma.estadoMedicamento.create({
        data: {
            nombre: 'Inactivo',
            descripcion: 'El medicamento ya no está en uso',
            fechaAlta: new Date(),
        },
    });

    const estado3 = await prisma.estadoMedicamento.create({
        data: {
            nombre: 'Creado',
            descripcion: 'El medicamento esta creado',
            fechaAlta: new Date(),
        },
    });

    const medicamento1 = await prisma.medicamento.create({
        data: {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento general',
            nombreFarmaco: 'Paracetamol',
            nombreGenerico: 'Acetaminofén'
        },
    });

    // Crear medicamento
    const medicamento2 = await prisma.medicamento.create({
        data: {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'No se debe usar en combinación con...',
            indicaciones: 'Para el tratamiento de...',
            nombreFarmaco: 'Farmaco Ejemplo',
            nombreGenerico: 'Generico Ejemplo'
        },
    });

    // Crear estado de medicamento
    await prisma.medicamentoEstado.create({
        data: {
            idMedicamento: medicamento1.idMedicamento,
            idEstadoMedicamento: estado1.idEstadoMedicamento,
            fechaDesde: new Date(),
            fechaHasta: null, // Indica que el estado está activo actualmente
        },
    });

    await prisma.medicamentoEstado.create({
        data: {
            idMedicamento: medicamento2.idMedicamento,
            idEstadoMedicamento: estado2.idEstadoMedicamento,
            fechaDesde: new Date(),
            fechaHasta: null, // Indica que el estado está activo actualmente
        },
    });

    const medicamentos = [
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento del dolor y fiebre',
            nombreFarmaco: 'Paracetamol',
            nombreGenerico: 'Acetaminofén',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades hepáticas',
            indicaciones: 'Para tratamiento del dolor',
            nombreFarmaco: 'Advil',
            nombreGenerico: 'Ibuprofeno',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Hipersensibilidad',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Aleve',
            nombreGenerico: 'Naproxeno',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades del corazón',
            indicaciones: 'Antiinflamatorio no esteroideo',
            nombreFarmaco: 'Voltaren',
            nombreGenerico: 'Diclofenaco',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Embarazo',
            indicaciones: 'Para tratamiento de migraña',
            nombreFarmaco: 'Imitrex',
            nombreGenerico: 'Sumatriptán',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Celebrex',
            nombreGenerico: 'Celecoxib',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades renales',
            indicaciones: 'Para tratamiento de inflamación',
            nombreFarmaco: 'Toradol',
            nombreGenerico: 'Ketorolaco',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento de cólicos',
            nombreFarmaco: 'Hycodan',
            nombreGenerico: 'Dihidrocodeína',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Indocin',
            nombreGenerico: 'Indometacina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades gastrointestinales',
            indicaciones: 'Para tratamiento de dolor',
            nombreFarmaco: 'Naprosyn',
            nombreGenerico: 'Naproxeno',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Analgésico y antipirético',
            nombreFarmaco: 'Aspirina',
            nombreGenerico: 'Ácido acetilsalicílico',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Insuficiencia renal',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Feldene',
            nombreGenerico: 'Piroxicam',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento de dolor agudo',
            nombreFarmaco: 'Ultram',
            nombreGenerico: 'Tramadol',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Analgésico y antipirético',
            nombreFarmaco: 'Excedrin',
            nombreGenerico: 'Acetaminofén + Aspirina + Cafeína',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Alergias a AINEs',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Mobic',
            nombreGenerico: 'Meloxicam',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento de la artritis',
            nombreFarmaco: 'Celebrex',
            nombreGenerico: 'Celecoxib',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Analgésico',
            nombreFarmaco: 'Dafalgan',
            nombreGenerico: 'Paracetamol',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Antiinflamatorio',
            nombreFarmaco: 'Cataflam',
            nombreGenerico: 'Diclofenaco',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento de la fiebre',
            nombreFarmaco: 'Naproxen',
            nombreGenerico: 'Naproxeno',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Ninguna',
            indicaciones: 'Para tratamiento de inflamación',
            nombreFarmaco: 'Zyflamend',
            nombreGenerico: 'Mezcla de hierbas antiinflamatorias',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Alergias conocidas',
            indicaciones: 'Para tratamiento de alergias',
            nombreFarmaco: 'Claritin',
            nombreGenerico: 'Loratadina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Insuficiencia hepática',
            indicaciones: 'Para aliviar la congestión nasal',
            nombreFarmaco: 'Sudafed',
            nombreGenerico: 'Pseudoefedrina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Asma severo',
            indicaciones: 'Relajante muscular',
            nombreFarmaco: 'Flexeril',
            nombreGenerico: 'Ciclobenzaprina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades renales graves',
            indicaciones: 'Para tratamiento de infecciones bacterianas',
            nombreFarmaco: 'Cipro',
            nombreGenerico: 'Ciprofloxacino',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Hipersensibilidad a penicilinas',
            indicaciones: 'Antibiótico de amplio espectro',
            nombreFarmaco: 'Amoxil',
            nombreGenerico: 'Amoxicilina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Embarazo',
            indicaciones: 'Para tratamiento de infecciones por hongos',
            nombreFarmaco: 'Diflucan',
            nombreGenerico: 'Fluconazol',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Hipertensión no controlada',
            indicaciones: 'Para reducir el colesterol',
            nombreFarmaco: 'Lipitor',
            nombreGenerico: 'Atorvastatina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Uso concomitante con nitratos',
            indicaciones: 'Para tratamiento de disfunción eréctil',
            nombreFarmaco: 'Viagra',
            nombreGenerico: 'Sildenafilo',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Insuficiencia renal severa',
            indicaciones: 'Diurético para tratamiento de edemas',
            nombreFarmaco: 'Lasix',
            nombreGenerico: 'Furosemida',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Depresión severa',
            indicaciones: 'Antidepresivo',
            nombreFarmaco: 'Prozac',
            nombreGenerico: 'Fluoxetina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Glaucoma de ángulo cerrado',
            indicaciones: 'Antihistamínico para alergias',
            nombreFarmaco: 'Zyrtec',
            nombreGenerico: 'Cetirizina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades hepáticas severas',
            indicaciones: 'Para alivio del reflujo ácido',
            nombreFarmaco: 'Prilosec',
            nombreGenerico: 'Omeprazol',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Alergias a AINEs',
            indicaciones: 'Para alivio del dolor agudo',
            nombreFarmaco: 'Relafen',
            nombreGenerico: 'Nabumetona',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Enfermedades autoinmunes activas',
            indicaciones: 'Para tratamiento de enfermedades reumáticas',
            nombreFarmaco: 'Enbrel',
            nombreGenerico: 'Etanercept',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Epilepsia no controlada',
            indicaciones: 'Anticonvulsivo',
            nombreFarmaco: 'Dilantin',
            nombreGenerico: 'Fenitoína',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Hipotensión severa',
            indicaciones: 'Vasodilatador para tratamiento de angina',
            nombreFarmaco: 'Nitrostat',
            nombreGenerico: 'Nitroglicerina',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Hipersensibilidad al producto',
            indicaciones: 'Para tratamiento de infecciones urinarias',
            nombreFarmaco: 'Macrobid',
            nombreGenerico: 'Nitrofurantoína',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Asma inducido por aspirina',
            indicaciones: 'Para tratamiento de dolor leve a moderado',
            nombreFarmaco: 'Ponstel',
            nombreGenerico: 'Mefenámico',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Insuficiencia hepática severa',
            indicaciones: 'Para tratamiento de migrañas',
            nombreFarmaco: 'Maxalt',
            nombreGenerico: 'Rizatriptán',
        },
        {
            idUnidadMedicamento: unidadMedicamento.idUnidadMedicamento,
            contraindicaciones: 'Desórdenes hemorrágicos',
            indicaciones: 'Anticoagulante',
            nombreFarmaco: 'Coumadin',
            nombreGenerico: 'Warfarina',
        },
    ];

    for (const medicamento of medicamentos) {
        await prisma.medicamento.create({
            data: medicamento,
        });
    }


    // Crear un inventario relacionado con el perfil y medicamento
    const inventario1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil1.idPerfil,
            idMedicamento: medicamento1.idMedicamento,
            stock: 10,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-01T09:00:00'),
        },
    });

    const inventario2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil2.idPerfil,
            idMedicamento: medicamento2.idMedicamento,
            stock: 10,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-02T09:00:00'),
        },
    });

    // Inventarios para perfil 3
    const inventario3_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idMedicamento: 3,
            stock: 20,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-03T09:00:00'),
        },
    });

    const inventario3_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idMedicamento: 4,
            stock: 25,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-04T09:00:00'),
        },
    });

    // Inventarios para perfil 4
    const inventario4_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idMedicamento: 5,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-05T09:00:00'),
        },
    });

    const inventario4_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idMedicamento: 6,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-06T09:00:00'),
        },
    });

    // Inventarios para perfil 5
    const inventario5_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idMedicamento: 7,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-07T09:00:00'),
        },
    });

    const inventario5_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idMedicamento: 8,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-08T09:00:00'),
        },
    });

    // Inventarios para perfil 6
    const inventario6_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idMedicamento: 9,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-09T09:00:00'),
        },
    });

    const inventario6_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idMedicamento: 10,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-10T09:00:00'),
        },
    });

    // Inventarios para perfil 7
    const inventario7_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idMedicamento: 11,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-11T09:00:00'),
        },
    });

    const inventario7_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idMedicamento: 12,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-12T09:00:00'),
        },
    });
    // Inventarios para perfil 8
    const inventario8_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idMedicamento: 13,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-13T09:00:00'),
        },
    });

    const inventario8_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idMedicamento: 14,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-14T09:00:00'),
        },
    });

    // Inventarios para perfil 9
    const inventario9_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idMedicamento: 15,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-01T09:00:00'),
        },
    });

    const inventario9_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idMedicamento: 16,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-02T09:00:00'),
        },
    });

    // Inventarios para perfil 10
    const inventario10_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idMedicamento: 17,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-03T09:00:00'),
        },
    });

    const inventario10_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idMedicamento: 18,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-04T09:00:00'),
        },
    });

    // Inventarios para perfil 11
    const inventario11_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idMedicamento: 1,
            stock: 20,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-05T09:00:00'),
        },
    });

    const inventario11_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idMedicamento: 2,
            stock: 25,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-05T09:00:00'),
        },
    });

    // Inventarios para perfil 12
    const inventario12_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil12.idPerfil,
            idMedicamento: 3,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-07T09:00:00'),
        },
    });

    const inventario12_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil12.idPerfil,
            idMedicamento: 4,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-08T09:00:00'),
        },
    });

    // Inventarios para perfil 13
    const inventario13_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idMedicamento: 5,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-09T09:00:00'),
        },
    });

    const inventario13_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idMedicamento: 6,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-10T09:00:00'),
        },
    });

    // Inventarios para perfil 14
    const inventario14_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idMedicamento: 7,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-11T09:00:00'),
        },
    });

    const inventario14_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idMedicamento: 8,
            stock: 25,
            cantidadMinima: 1,
            fechaCreacion: new Date('2024-12-12T09:00:00'),
        },
    });

    // Inventarios para perfil 15
    const inventario15_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idMedicamento: 9,
            stock: 30,
            cantidadMinima: 3,
            fechaCreacion: new Date('2024-12-13T09:00:00'),
        },
    });

    const inventario15_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idMedicamento: 10,
            stock: 20,
            cantidadMinima: 2,
            fechaCreacion: new Date('2024-12-14T09:00:00'),
        },
    });


    // Inventarios para perfil 16
    const inventario16_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idMedicamento: 11,
            stock: 25,
            cantidadMinima: 1,
        },
    });

    const inventario16_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idMedicamento: 12,
            stock: 30,
            cantidadMinima: 3,
        },
    });

    // Inventarios para perfil 17
    const inventario17_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idMedicamento: 13,
            stock: 20,
            cantidadMinima: 2,
        },
    });

    const inventario17_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idMedicamento: 14,
            stock: 25,
            cantidadMinima: 1,
        },
    });

    // Inventarios para perfil 18
    const inventario18_1 = await prisma.inventario.create({
        data: {
            idPerfil: perfil18.idPerfil,
            idMedicamento: 15,
            stock: 30,
            cantidadMinima: 3,
        },
    });

    const inventario18_2 = await prisma.inventario.create({
        data: {
            idPerfil: perfil18.idPerfil,
            idMedicamento: 16,
            stock: 20,
            cantidadMinima: 2,
        },
    });


    // Crear Notificaciones
    const tipoFrecuencia = await prisma.tipoFrecuencia.create({ data: { nombre: 'Diario', valor: '86400000' } });
    const tipoFrecuenciaSemanal = await prisma.tipoFrecuencia.create({
        data: {
            nombre: 'Semanal',
            valor: '10080000',
        },
    });
    const tipoFrecuenciaMensual = await prisma.tipoFrecuencia.create({
        data: {
            nombre: 'Mensual',
            valor: '40320000',
        },
    });
    const tipoFrecuenciaMedio = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '12hs',
            valor: '720000',
        },
    });
    const tipoFrecuenciaOcho = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '8hs',
            valor: '480000',
        },
    });
    const tipoFrecuenciaCuarto = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '6hs',
            valor: '360000',
        },
    });
    const tipoFrecuenciaDos = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '2hs',
            valor: '120000',
        },
    });
    const tipoFrecuenciaUno = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '1hs',
            valor: '60000',
        },
    });
    const tipoFrecuenciaTreinta = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '30s',
            valor: '30000',
        },
    });
    const tipoFrecuenciaQuince = await prisma.tipoFrecuencia.create({
        data: {
            nombre: '15s',
            valor: '15000',
        },
    });

    const tipoNotificacion1 = await prisma.tipoNotificacion.create({
        data: {
            nombre: 'Toma de medicamento',
            fechaAlta: new Date(),
        },
    });

    const tipoNotificacion2 = await prisma.tipoNotificacion.create({
        data: {
            nombre: 'Recordatorio de turno',
            fechaAlta: new Date(),
        },
    });

    const tipoNotificacion3 = await prisma.tipoNotificacion.create({
        data: {
            nombre: 'Otro',
            fechaAlta: new Date(),
        },
    });

    // Crear Estados de Notificación
    const estadoNotificacionActivo = await prisma.estadoNotificacion.create({
        data: {
            nombre: 'Activo',
            fechaAlta: new Date(),
        },
    });

    const estadoNotificacionInactivo = await prisma.estadoNotificacion.create({
        data: {
            nombre: 'Inactivo',
            fechaAlta: new Date(),
        },
    });

    const estadoNotificacionCreado = await prisma.estadoNotificacion.create({
        data: {
            nombre: 'Creado',
            fechaAlta: new Date(),
        },
    });

    const estadoNotificacionEliminado = await prisma.estadoNotificacion.create({
        data: {
            nombre: 'Eliminado',
            fechaAlta: new Date()
        }
    })

    const estadoNotificacionFinalizado = await prisma.estadoNotificacion.create({
        data: {
            nombre: 'Finalizado',
            fechaAlta: new Date()
        }
    })

    // Crear Notificaciones
    // Nota: Asegúrate de que el perfil y el inventario a los que haces referencia existan
    const notificacion1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil1.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionDefault1',
            mensaje: 'Mensaje1'
            // fechaHasta se puede omitir si no es necesario
        },
    });

    // Crear Estado de Notificación para la Notificación
    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacion1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
            // fechaHasta se puede omitir si no es necesario
        },
    });

    const notificacion2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil1.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 30)),  // Ejemplo de fechaHasta
            titulo: 'Notificacion2',
            mensaje: 'Mensaje2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacion2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacion3 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil1.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'Notificacion2',
            mensaje: 'Mensaje2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacion3.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    await prisma.configuracionNotificacion.create({
        data: {
            idTipoFrecuencia: tipoFrecuencia.idTipoFrecuencia,
            idNotificacion: notificacion3.idNotificacion,
            idMedicamento: medicamento2.idMedicamento,
            cantidadFrecuencia: 2,
            cantidadMedicamento: 1,
            fechaNotificacion: new Date(),
        },
    });

    // Crear Notificaciones para perfiles 3, 4, 5 y 6

    // Notificaciones para perfil 3
    const notificacionPerfil3_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil3_1',
            mensaje: 'Mensaje para perfil 3 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil3_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil3_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 10)),
            titulo: 'NotificacionPerfil3_2',
            mensaje: 'Mensaje para perfil 3 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil3_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 4
    const notificacionPerfil4_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil4_1',
            mensaje: 'Mensaje para perfil 4 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil4_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil4_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 15)),
            titulo: 'NotificacionPerfil4_2',
            mensaje: 'Mensaje para perfil 4 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil4_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 5
    const notificacionPerfil5_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil5_1',
            mensaje: 'Mensaje para perfil 5 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil5_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil5_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 20)),
            titulo: 'NotificacionPerfil5_2',
            mensaje: 'Mensaje para perfil 5 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil5_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 6
    const notificacionPerfil6_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil6_1',
            mensaje: 'Mensaje para perfil 6 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil6_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil6_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 25)),
            titulo: 'NotificacionPerfil6_2',
            mensaje: 'Mensaje para perfil 6 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil6_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });
    // Notificaciones para perfil 7
    const notificacionPerfil7_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil7_1',
            mensaje: 'Mensaje para perfil 7 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil7_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil7_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 10)),
            titulo: 'NotificacionPerfil7_2',
            mensaje: 'Mensaje para perfil 7 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil7_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 8
    const notificacionPerfil8_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil8_1',
            mensaje: 'Mensaje para perfil 8 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil8_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil8_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 15)),
            titulo: 'NotificacionPerfil8_2',
            mensaje: 'Mensaje para perfil 8 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil8_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 9
    const notificacionPerfil9_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil9_1',
            mensaje: 'Mensaje para perfil 9 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil9_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil9_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 20)),
            titulo: 'NotificacionPerfil9_2',
            mensaje: 'Mensaje para perfil 9 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil9_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 10
    const notificacionPerfil10_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil10_1',
            mensaje: 'Mensaje para perfil 10 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil10_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil10_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 25)),
            titulo: 'NotificacionPerfil10_2',
            mensaje: 'Mensaje para perfil 10 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil10_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 11
    const notificacionPerfil11_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil11_1',
            mensaje: 'Mensaje para perfil 11 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil11_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil11_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 30)),
            titulo: 'NotificacionPerfil11_2',
            mensaje: 'Mensaje para perfil 11 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil11_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 12
    const notificacionPerfil12_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil12.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil12_1',
            mensaje: 'Mensaje para perfil 12 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil12_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 13
    const notificacionPerfil13_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil13_1',
            mensaje: 'Mensaje para perfil 13 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil13_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil13_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 10)),
            titulo: 'NotificacionPerfil13_2',
            mensaje: 'Mensaje para perfil 13 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil13_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 14
    const notificacionPerfil14_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil14_1',
            mensaje: 'Mensaje para perfil 14 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil14_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil14_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 15)),
            titulo: 'NotificacionPerfil14_2',
            mensaje: 'Mensaje para perfil 14 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil14_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 15
    const notificacionPerfil15_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil15_1',
            mensaje: 'Mensaje para perfil 15 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil15_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil15_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 20)),
            titulo: 'NotificacionPerfil15_2',
            mensaje: 'Mensaje para perfil 15 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil15_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 16
    const notificacionPerfil16_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil16_1',
            mensaje: 'Mensaje para perfil 16 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil16_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil16_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 25)),
            titulo: 'NotificacionPerfil16_2',
            mensaje: 'Mensaje para perfil 16 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil16_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 17
    const notificacionPerfil17_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil17_1',
            mensaje: 'Mensaje para perfil 17 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil17_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    const notificacionPerfil17_2 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idTipoNotificacion: tipoNotificacion2.idTipoNotificacion,
            fechaDesde: new Date(),
            fechaHasta: new Date(new Date().setDate(new Date().getDate() + 30)),
            titulo: 'NotificacionPerfil17_2',
            mensaje: 'Mensaje para perfil 17 - notificación 2',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil17_2.idNotificacion,
            idEstadoNotificacion: estadoNotificacionInactivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Notificaciones para perfil 18
    const notificacionPerfil18_1 = await prisma.notificacion.create({
        data: {
            idPerfil: perfil18.idPerfil,
            idTipoNotificacion: tipoNotificacion1.idTipoNotificacion,
            fechaDesde: new Date(),
            titulo: 'NotificacionPerfil18_1',
            mensaje: 'Mensaje para perfil 18 - notificación 1',
        },
    });

    await prisma.notificacionEstado.create({
        data: {
            idNotificacion: notificacionPerfil18_1.idNotificacion,
            idEstadoNotificacion: estadoNotificacionActivo.idEstadoNotificacion,
            fechaDesde: new Date(),
        },
    });

    // Crear Categorías
    const categoria1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil1.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 2
    const categoria2_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil2.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria2_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil2.idPerfil,
            nombre: 'Pediatría',
            descripcion: 'Categoría para registros relacionados con niños',
            fechaCreacion: new Date(),
        },
    });

    const categoria2_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil2.idPerfil,
            nombre: 'Oncología',
            descripcion: 'Categoría para registros relacionados con el cáncer',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 3
    const categoria3_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil3.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria3_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil3.idPerfil,
            nombre: 'Neurología',
            descripcion: 'Categoría para registros relacionados con el sistema nervioso',
            fechaCreacion: new Date(),
        },
    });

    const categoria3_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil3.idPerfil,
            nombre: 'Traumatología',
            descripcion: 'Categoría para registros relacionados con lesiones físicas',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 4
    const categoria4_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil4.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria4_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil4.idPerfil,
            nombre: 'Endocrinología',
            descripcion: 'Categoría para registros relacionados con las hormonas',
            fechaCreacion: new Date(),
        },
    });

    const categoria4_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil4.idPerfil,
            nombre: 'Gastroenterología',
            descripcion: 'Categoría para registros relacionados con el sistema digestivo',
            fechaCreacion: new Date(),
        },
    });

    // Crear categorías para perfiles 5 al 9

    // Categorías para perfil 5
    const categoria5_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil5.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria5_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil5.idPerfil,
            nombre: 'Reumatología',
            descripcion: 'Categoría para registros relacionados con enfermedades reumáticas',
            fechaCreacion: new Date(),
        },
    });

    const categoria5_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil5.idPerfil,
            nombre: 'Psiquiatría',
            descripcion: 'Categoría para registros relacionados con la salud mental',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 6
    const categoria6_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil6.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria6_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil6.idPerfil,
            nombre: 'Neumología',
            descripcion: 'Categoría para registros relacionados con el sistema respiratorio',
            fechaCreacion: new Date(),
        },
    });

    const categoria6_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil6.idPerfil,
            nombre: 'Oftalmología',
            descripcion: 'Categoría para registros relacionados con la vista',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 7
    const categoria7_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil7.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria7_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil7.idPerfil,
            nombre: 'Cirugía General',
            descripcion: 'Categoría para registros relacionados con procedimientos quirúrgicos',
            fechaCreacion: new Date(),
        },
    });

    const categoria7_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil7.idPerfil,
            nombre: 'Ginecología',
            descripcion: 'Categoría para registros relacionados con la salud femenina',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 8
    const categoria8_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil8.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria8_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil8.idPerfil,
            nombre: 'Traumatología',
            descripcion: 'Categoría para registros relacionados con lesiones físicas',
            fechaCreacion: new Date(),
        },
    });

    const categoria8_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil8.idPerfil,
            nombre: 'Urología',
            descripcion: 'Categoría para registros relacionados con el sistema urinario',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 9
    const categoria9_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil9.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria9_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil9.idPerfil,
            nombre: 'Endocrinología',
            descripcion: 'Categoría para registros relacionados con las hormonas',
            fechaCreacion: new Date(),
        },
    });

    const categoria9_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil9.idPerfil,
            nombre: 'Gastroenterología',
            descripcion: 'Categoría para registros relacionados con el sistema digestivo',
            fechaCreacion: new Date(),
        },
    });

    // Crear categorías para perfiles 10 al 14

    // Categorías para perfil 10
    const categoria10_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil10.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria10_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil10.idPerfil,
            nombre: 'Medicina Interna',
            descripcion: 'Categoría para registros relacionados con medicina interna',
            fechaCreacion: new Date(),
        },
    });

    const categoria10_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil10.idPerfil,
            nombre: 'Nefrología',
            descripcion: 'Categoría para registros relacionados con enfermedades renales',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 11
    const categoria11_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil11.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria11_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil11.idPerfil,
            nombre: 'Hematología',
            descripcion: 'Categoría para registros relacionados con enfermedades de la sangre',
            fechaCreacion: new Date(),
        },
    });

    const categoria11_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil11.idPerfil,
            nombre: 'Infectología',
            descripcion: 'Categoría para registros relacionados con enfermedades infecciosas',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 12
    const categoria12_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil12.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria12_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil12.idPerfil,
            nombre: 'Oncología',
            descripcion: 'Categoría para registros relacionados con cáncer',
            fechaCreacion: new Date(),
        },
    });

    const categoria12_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil12.idPerfil,
            nombre: 'Pediatría',
            descripcion: 'Categoría para registros relacionados con la salud infantil',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 13
    const categoria13_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil13.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria13_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil13.idPerfil,
            nombre: 'Reumatología',
            descripcion: 'Categoría para registros relacionados con enfermedades reumáticas',
            fechaCreacion: new Date(),
        },
    });

    const categoria13_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil13.idPerfil,
            nombre: 'Traumatología',
            descripcion: 'Categoría para registros relacionados con lesiones físicas',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 14
    const categoria14_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil14.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria14_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil14.idPerfil,
            nombre: 'Dermatología',
            descripcion: 'Categoría para registros relacionados con la piel',
            fechaCreacion: new Date(),
        },
    });

    const categoria14_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil14.idPerfil,
            nombre: 'Neurología',
            descripcion: 'Categoría para registros relacionados con el sistema nervioso',
            fechaCreacion: new Date(),
        },
    });

    // Crear categorías para perfiles 15 al 18

    // Categorías para perfil 15
    const categoria15_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil15.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria15_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil15.idPerfil,
            nombre: 'Cardiología',
            descripcion: 'Categoría para registros relacionados con el corazón',
            fechaCreacion: new Date(),
        },
    });

    const categoria15_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil15.idPerfil,
            nombre: 'Dermatología',
            descripcion: 'Categoría para registros relacionados con la piel',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 16
    const categoria16_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil16.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria16_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil16.idPerfil,
            nombre: 'Neurología',
            descripcion: 'Categoría para registros relacionados con el sistema nervioso',
            fechaCreacion: new Date(),
        },
    });

    const categoria16_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil16.idPerfil,
            nombre: 'Endocrinología',
            descripcion: 'Categoría para registros relacionados con las hormonas',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 17
    const categoria17_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil17.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria17_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil17.idPerfil,
            nombre: 'Oftalmología',
            descripcion: 'Categoría para registros relacionados con la vista',
            fechaCreacion: new Date(),
        },
    });

    const categoria17_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil17.idPerfil,
            nombre: 'Reumatología',
            descripcion: 'Categoría para registros relacionados con enfermedades reumáticas',
            fechaCreacion: new Date(),
        },
    });

    // Categorías para perfil 18
    const categoria18_1 = await prisma.categoria.create({
        data: {
            idPerfil: perfil18.idPerfil,
            nombre: 'General',
            descripcion: 'Categoría general para registros',
            fechaCreacion: new Date(),
        },
    });

    const categoria18_2 = await prisma.categoria.create({
        data: {
            idPerfil: perfil18.idPerfil,
            nombre: 'Traumatología',
            descripcion: 'Categoría para registros relacionados con lesiones físicas',
            fechaCreacion: new Date(),
        },
    });

    const categoria18_3 = await prisma.categoria.create({
        data: {
            idPerfil: perfil18.idPerfil,
            nombre: 'Gastroenterología',
            descripcion: 'Categoría para registros relacionados con el sistema digestivo',
            fechaCreacion: new Date(),
        },
    });


    // Crear Especialidades
    const especialidadCardiologia = await prisma.especialidad.create({
        data: {
            nombre: 'Cardiología',
            fechaAlta: new Date(),
        },
    });

    const especialidadDermatologia = await prisma.especialidad.create({
        data: {
            nombre: 'Dermatología',
            fechaAlta: new Date(),
        },
    });

    const especialidadGinecologia = await prisma.especialidad.create({
        data: {
            nombre: 'Ginecología',
            fechaAlta: new Date(),
        },
    });

    const especialidadPediatria = await prisma.especialidad.create({
        data: {
            nombre: 'Pediatría',
            fechaAlta: new Date(),
        },
    });

    const especialidadOncologia = await prisma.especialidad.create({
        data: {
            nombre: 'Oncología',
            fechaAlta: new Date(),
        },
    });

    const especialidadNeurologia = await prisma.especialidad.create({
        data: {
            nombre: 'Neurología',
            fechaAlta: new Date(),
        },
    });

    const especialidadUrologia = await prisma.especialidad.create({
        data: {
            nombre: 'Urología',
            fechaAlta: new Date(),
        },
    });

    const especialidadEndocrinologia = await prisma.especialidad.create({
        data: {
            nombre: 'Endocrinología',
            fechaAlta: new Date(),
        },
    });

    const especialidadOftalmologia = await prisma.especialidad.create({
        data: {
            nombre: 'Oftalmología',
            fechaAlta: new Date(),
        },
    });

    const especialidadTraumatologia = await prisma.especialidad.create({
        data: {
            nombre: 'Traumatología',
            fechaAlta: new Date(),
        },
    });

    const especialidadNeumologia = await prisma.especialidad.create({
        data: {
            nombre: 'Neumología',
            fechaAlta: new Date(),
        },
    });

    const especialidadGastroenterologia = await prisma.especialidad.create({
        data: {
            nombre: 'Gastroenterología',
            fechaAlta: new Date(),
        },
    });

    const especialidadPsiquiatria = await prisma.especialidad.create({
        data: {
            nombre: 'Psiquiatría',
            fechaAlta: new Date(),
        },
    });

    const especialidadReumatologia = await prisma.especialidad.create({
        data: {
            nombre: 'Reumatología',
            fechaAlta: new Date(),
        },
    });

    const especialidadCirugiaGeneral = await prisma.especialidad.create({
        data: {
            nombre: 'Cirugía General',
            fechaAlta: new Date(),
        },
    });


    // Crear Médicos
    const medico1 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadCardiologia.idEspecialidad,
            idPerfil: perfil1.idPerfil,
            nombre: 'Dr. Juan',
            apellido: 'Pérez',
            direccion: 'Calle Falsa 123',
            telefonoContacto: '123456789',
            email: 'juan.perez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico2 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadDermatologia.idEspecialidad,
            idPerfil: perfil2.idPerfil,
            nombre: 'Dra. Laura',
            apellido: 'Gómez',
            direccion: 'Avenida Siempre Viva 456',
            telefonoContacto: '987654321',
            email: 'laura.gomez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico3 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadGinecologia.idEspecialidad,
            idPerfil: perfil3.idPerfil,
            nombre: 'Dra. Mariana',
            apellido: 'López',
            direccion: 'Calle Primavera 789',
            telefonoContacto: '123123123',
            email: 'mariana.lopez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico4 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadPediatria.idEspecialidad,
            idPerfil: perfil4.idPerfil,
            nombre: 'Dr. Carlos',
            apellido: 'Gutiérrez',
            direccion: 'Boulevard Sol 456',
            telefonoContacto: '456456456',
            email: 'carlos.gutierrez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico5 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadOncologia.idEspecialidad,
            idPerfil: perfil5.idPerfil,
            nombre: 'Dra. Ana',
            apellido: 'Martínez',
            direccion: 'Avenida Luna 321',
            telefonoContacto: '789789789',
            email: 'ana.martinez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico6 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadNeurologia.idEspecialidad,
            idPerfil: perfil6.idPerfil,
            nombre: 'Dr. Jorge',
            apellido: 'Ramírez',
            direccion: 'Calle Río 567',
            telefonoContacto: '321321321',
            email: 'jorge.ramirez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico7 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadUrologia.idEspecialidad,
            idPerfil: perfil7.idPerfil,
            nombre: 'Dr. Pablo',
            apellido: 'Fernández',
            direccion: 'Plaza Central 890',
            telefonoContacto: '654654654',
            email: 'pablo.fernandez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico8 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadEndocrinologia.idEspecialidad,
            idPerfil: perfil8.idPerfil,
            nombre: 'Dra. Claudia',
            apellido: 'Hernández',
            direccion: 'Calle Lago 135',
            telefonoContacto: '987987987',
            email: 'claudia.hernandez@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico9 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadOftalmologia.idEspecialidad,
            idPerfil: perfil9.idPerfil,
            nombre: 'Dr. Emilio',
            apellido: 'Castro',
            direccion: 'Avenida Verde 246',
            telefonoContacto: '159159159',
            email: 'emilio.castro@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico10 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadTraumatologia.idEspecialidad,
            idPerfil: perfil10.idPerfil,
            nombre: 'Dra. Karina',
            apellido: 'Morales',
            direccion: 'Boulevard Azul 753',
            telefonoContacto: '753753753',
            email: 'karina.morales@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico11 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadNeumologia.idEspecialidad,
            idPerfil: perfil11.idPerfil,
            nombre: 'Dr. Luis',
            apellido: 'Ortega',
            direccion: 'Calle Nieve 678',
            telefonoContacto: '951951951',
            email: 'luis.ortega@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico12 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadGastroenterologia.idEspecialidad,
            idPerfil: perfil12.idPerfil,
            nombre: 'Dra. Sofía',
            apellido: 'Rojas',
            direccion: 'Avenida Blanca 369',
            telefonoContacto: '357357357',
            email: 'sofia.rojas@example.com',
            fechaAlta: new Date(),
        },
    });
    // Crear médicos para perfiles 12 al 18

    const medico13 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadDermatologia.idEspecialidad,
            idPerfil: perfil13.idPerfil,
            nombre: 'Dr. Andrés',
            apellido: 'Villalobos',
            direccion: 'Avenida Sol 456',
            telefonoContacto: '2233445566',
            email: 'andres.villalobos@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico14 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadGinecologia.idEspecialidad,
            idPerfil: perfil14.idPerfil,
            nombre: 'Dra. Liliana',
            apellido: 'Esquivel',
            direccion: 'Plaza Lila 789',
            telefonoContacto: '3344556677',
            email: 'liliana.esquivel@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico15 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadOncologia.idEspecialidad,
            idPerfil: perfil15.idPerfil,
            nombre: 'Dr. Fernando',
            apellido: 'Campos',
            direccion: 'Calle Dorada 159',
            telefonoContacto: '4455667788',
            email: 'fernando.campos@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico16 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadPediatria.idEspecialidad,
            idPerfil: perfil16.idPerfil,
            nombre: 'Dra. Gabriela',
            apellido: 'Santos',
            direccion: 'Boulevard Río 753',
            telefonoContacto: '5566778899',
            email: 'gabriela.santos@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico17 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadCardiologia.idEspecialidad,
            idPerfil: perfil17.idPerfil,
            nombre: 'Dr. Eduardo',
            apellido: 'Mendoza',
            direccion: 'Avenida Azul 951',
            telefonoContacto: '6677889900',
            email: 'eduardo.mendoza@example.com',
            fechaAlta: new Date(),
        },
    });

    const medico18 = await prisma.medico.create({
        data: {
            idEspecialidad: especialidadDermatologia.idEspecialidad,
            idPerfil: perfil18.idPerfil,
            nombre: 'Dra. Cecilia',
            apellido: 'Robles',
            direccion: 'Calle Blanca 258',
            telefonoContacto: '7788990011',
            email: 'cecilia.robles@example.com',
            fechaAlta: new Date(),
        },
    });

    const registro1 = await prisma.registro.create({
        data: {
            idPerfil: perfil1.idPerfil,
            idMedico: medico1.idMedico,
            idCategoria: categoria1.idCategoria,
            detalle: 'Registro de tratamiento',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro3_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idMedico: medico3.idMedico,
            idCategoria: categoria3_1.idCategoria,
            detalle: 'Consulta general inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro3_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil3.idPerfil,
            idMedico: medico3.idMedico,
            idCategoria: categoria3_2.idCategoria,
            detalle: 'Seguimiento de tratamiento neurológico',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 4
    const registro4_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idMedico: medico4.idMedico,
            idCategoria: categoria4_1.idCategoria,
            detalle: 'Consulta pediátrica general',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro4_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil4.idPerfil,
            idMedico: medico4.idMedico,
            idCategoria: categoria4_2.idCategoria,
            detalle: 'Seguimiento de crecimiento',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 5
    const registro5_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idMedico: medico5.idMedico,
            idCategoria: categoria5_1.idCategoria,
            detalle: 'Revisión oncológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro5_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil5.idPerfil,
            idMedico: medico5.idMedico,
            idCategoria: categoria5_2.idCategoria,
            detalle: 'Evaluación de laboratorio oncológico',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });


    // Registros para perfil 6
    const registro6_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idMedico: medico6.idMedico,
            idCategoria: categoria6_1.idCategoria,
            detalle: 'Consulta inicial en neurología',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro6_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil6.idPerfil,
            idMedico: medico6.idMedico,
            idCategoria: categoria6_2.idCategoria,
            detalle: 'Evaluación de resonancia cerebral',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 7
    const registro7_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idMedico: medico7.idMedico,
            idCategoria: categoria7_1.idCategoria,
            detalle: 'Consulta general inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro7_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil7.idPerfil,
            idMedico: medico7.idMedico,
            idCategoria: categoria7_2.idCategoria,
            detalle: 'Revisión urológica',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 8
    const registro8_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idMedico: medico8.idMedico,
            idCategoria: categoria8_1.idCategoria,
            detalle: 'Consulta endocrinológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro8_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil8.idPerfil,
            idMedico: medico8.idMedico,
            idCategoria: categoria8_2.idCategoria,
            detalle: 'Seguimiento de tratamiento hormonal',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 9
    const registro9_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idMedico: medico9.idMedico,
            idCategoria: categoria9_1.idCategoria,
            detalle: 'Evaluación oftalmológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro9_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil9.idPerfil,
            idMedico: medico9.idMedico,
            idCategoria: categoria9_2.idCategoria,
            detalle: 'Consulta de seguimiento visual',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 10
    const registro10_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idMedico: medico10.idMedico,
            idCategoria: categoria10_1.idCategoria,
            detalle: 'Consulta general en traumatología',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro10_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil10.idPerfil,
            idMedico: medico10.idMedico,
            idCategoria: categoria10_2.idCategoria,
            detalle: 'Evaluación de recuperación ósea',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 11
    const registro11_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idMedico: medico11.idMedico,
            idCategoria: categoria11_1.idCategoria,
            detalle: 'Consulta neumológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro11_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil11.idPerfil,
            idMedico: medico11.idMedico,
            idCategoria: categoria11_2.idCategoria,
            detalle: 'Evaluación de función pulmonar',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 12
    const registro12_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil12.idPerfil,
            idMedico: medico12.idMedico,
            idCategoria: categoria12_1.idCategoria,
            detalle: 'Consulta gastroenterológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro12_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil12.idPerfil,
            idMedico: medico12.idMedico,
            idCategoria: categoria12_2.idCategoria,
            detalle: 'Prueba de función hepática',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 13
    const registro13_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idMedico: medico13.idMedico,
            idCategoria: categoria13_1.idCategoria,
            detalle: 'Evaluación inicial en hematología',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro13_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil13.idPerfil,
            idMedico: medico13.idMedico,
            idCategoria: categoria13_2.idCategoria,
            detalle: 'Revisión de análisis de sangre',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 14
    const registro14_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idMedico: medico14.idMedico,
            idCategoria: categoria14_1.idCategoria,
            detalle: 'Consulta dermatológica general',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro14_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil14.idPerfil,
            idMedico: medico14.idMedico,
            idCategoria: categoria14_2.idCategoria,
            detalle: 'Tratamiento de afecciones cutáneas',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 15
    const registro15_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idMedico: medico15.idMedico,
            idCategoria: categoria15_1.idCategoria,
            detalle: 'Consulta general de seguimiento',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro15_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil15.idPerfil,
            idMedico: medico15.idMedico,
            idCategoria: categoria15_2.idCategoria,
            detalle: 'Evaluación endocrinológica avanzada',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 16
    const registro16_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idMedico: medico16.idMedico,
            idCategoria: categoria16_1.idCategoria,
            detalle: 'Consulta inicial en pediatría',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro16_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil16.idPerfil,
            idMedico: medico16.idMedico,
            idCategoria: categoria16_2.idCategoria,
            detalle: 'Seguimiento de vacunación',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 17
    const registro17_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idMedico: medico17.idMedico,
            idCategoria: categoria17_1.idCategoria,
            detalle: 'Consulta inicial en cardiología',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro17_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil17.idPerfil,
            idMedico: medico17.idMedico,
            idCategoria: categoria17_2.idCategoria,
            detalle: 'Prueba de esfuerzo cardiovascular',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    // Registros para perfil 18
    const registro18_1 = await prisma.registro.create({
        data: {
            idPerfil: perfil18.idPerfil,
            idMedico: medico18.idMedico,
            idCategoria: categoria18_1.idCategoria,
            detalle: 'Consulta dermatológica inicial',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });

    const registro18_2 = await prisma.registro.create({
        data: {
            idPerfil: perfil18.idPerfil,
            idMedico: medico18.idMedico,
            idCategoria: categoria18_2.idCategoria,
            detalle: 'Evaluación de tratamiento cutáneo',
            fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal: new Date(),
        },
    });


    // Crear Documentos
    const tipoDocumento = await prisma.tipoDocumento.create({
        data: {
            nombre: 'Informe Médico',
            fechaAlta: new Date(),
        },
    });

    const documento1 = await prisma.documento.create({
        data: {
            idTipoDocumento: tipoDocumento.idTipoDocumento,
            idMedico: medico1.idMedico,
            idRegistro: registro1.idRegistro,
            nombre: 'Informe de Diagnóstico',
            tamanioMB: 1,
            urlRepositorio: 'http://example.com/informe.pdf',
            fechaCreado: new Date(),
        },
    });

    // Crear un registro de medicamento
    const registroMedicamento1 = await prisma.registroMedicamento.create({
        data: {
            idMedicamento: medicamento1.idMedicamento,
            idRegistro: registro1.idRegistro,
            indicaciones: 'Tomar una pastilla cada 6 horas',
            dosis: 500, // Dosis en mg
            fechaDesde: new Date('2023-09-01'),
            fechaHasta: new Date('2023-09-15'), // Opcional, puede ser null
        },
    });

    const registroMedicamento2 = await prisma.registroMedicamento.create({
        data: {
            idMedicamento: medicamento2.idMedicamento,
            idRegistro: registro1.idRegistro,
            indicaciones: 'Tomar una pastilla cada 12 horas',
            dosis: 500, // Dosis en mg
            fechaDesde: new Date('2023-09-01'),
            fechaHasta: new Date('2023-09-15'), // Opcional, puede ser null
        },
    });

    // Crear varios tipos de archivo
    const tiposDeArchivo = await prisma.tipoArchivo.createMany({
        data: [
            {
                nombre: 'PDF',
                descripcion: 'Documento en formato PDF',
                extension: '.pdf',
            },
            {
                nombre: 'Imagen JPEG',
                descripcion: 'Archivo de imagen en formato JPEG',
                extension: '.jpg',
            },
            {
                nombre: 'Documento Word',
                descripcion: 'Documento en formato Microsoft Word',
                extension: '.docx',
            },
            {
                nombre: 'Hoja de Cálculo Excel',
                descripcion: 'Archivo en formato Microsoft Excel',
                extension: '.xlsx',
            },
            {
                nombre: 'Texto Plano',
                descripcion: 'Archivo de texto simple',
                extension: '.txt',
            },
        ],
    });

    console.log('Semilla ejecutada con éxito.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })


// REFERENCIA
// npx prisma db seed