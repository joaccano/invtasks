import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendEmail } from "../emailService";
import bcrypt from 'bcrypt';
import { UsuarioRepository } from "../repositories/usuario.repository";
import { RolRepository } from "../repositories/rol.repository";
import admin from "../config/firebase";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const rolRepository = new RolRepository();
const usuarioRepository = new UsuarioRepository();

export const UsuarioController = {
    // Obtener todos los usuarios
    getAll: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if(!url.includes('?')) url =  `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const limit = parseInt(params.get('take') || '0');
            const page =parseInt(params.get('page') || '1');
            params.delete('page');
            const skip = (page - 1) * limit;
            params.set('skip', skip.toString());
            const usuarios = await usuarioRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await usuarioRepository.getPaginate(params, limit, page,"/administrator/users");
            res.status(200).json({ msg: `${usuarios.length > 0 ? 'Se han encontrado usuarios' : 'No se han encontrado usuarios'}`, data: usuarios, links: links});
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    getAllRoles: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if(!url.includes('?')) url =  `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const skip = 0;
            params.set('skip', skip.toString());
            const roles = await rolRepository.findMany("?"+decodeURIComponent(params.toString()));

            res.status(200).json({ msg: `${roles.length > 0 ? 'Se han encontrado roles' : 'No se han encontrado roles'}`, data: roles});
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener los roles' });
        }
    },
    // Obtener un usuario por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            let usuario = await prisma.usuario.findUnique({
                where: { idUsuario: parseInt(id) },
                include: {
                    cuenta: {
                        include: {
                            perfilList:  {
                                where: {
                                    fechaBaja: null, // Solo selecciona perfiles activos
                                }
                            }
                        }
                    }
                }
            }) as any;

            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
            
            // Extraer el perfil principal
            const perfilPrincipal = usuario.cuenta?.perfilList.find((perfil:any) => perfil.principal === true);

            // Reemplazar el perfilList con el perfil principal en el objeto usuario
            if (perfilPrincipal) {
                usuario = {...usuario,  
                    apellido:perfilPrincipal.apellido,
                    direccion:perfilPrincipal.direccion,
                    dni:perfilPrincipal.dni,
                    email:perfilPrincipal.email,
                    fechaNacimiento: new Date(perfilPrincipal.fechaNacimiento),
                    genero:perfilPrincipal.genero,
                    nombre:perfilPrincipal.nombre,
                    principal: true } 
            }

            return res.status(200).json({ msg: 'Se ha encontrado el usuario', data: usuario, status: "SUCCESSFULL" });
        } catch (error:any) {
            return res.status(500).json({ msg: 'Error al obtener el usuario', detail: error.message, status: "ERROR" });
        }
    },

    //1er parte del proceso de validar usuario
    activateAccountRequest: async (req: Request, res: Response) => {
        const { email } = req.body;
        
        try {
            // Buscar al usuario por su email
            const usuario = await prisma.usuario.findUnique({
                where: { email },
                include: { 
                    usuarioEstadoList: {
                        include: { estadoUsuario: true }
                    }
                }
            });
    
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
    
            // Verificar si el usuario ya está en estado activo
            const estadoActivo = usuario.usuarioEstadoList.find(
                (estado) => estado.fechaHasta === null && estado.estadoUsuario.nombre === "Activo"
            );
    
            if (estadoActivo) {
                return res.status(400).json({ msg: 'El usuario ya está activo' });
            }
    
            // Generar un código de verificación
            const codigoVerificacion = Math.floor(100000 + Math.random() * 900000);
    
            // Actualizar el usuario con el código de verificación
            await prisma.usuario.update({
                where: { email },
                data: { codigoVerificacion }
            });
    
            // Enviar el correo con el código de activación
            await sendEmail(email, 'Activación de Cuenta', `Tu código de activación es: ${codigoVerificacion}`);
            console.log("codigoVerificacion", codigoVerificacion);
    
            res.status(200).json({ msg: 'Se ha enviado un correo con el código de activación', data: { email } });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al intentar activar la cuenta', detail: error.message });
        }
    },
    
    
    // 2da parte del proceso de validar usuario
    activateAccount: async (req: Request, res: Response) => {
        let { email, codigo } = req.body;
    
        try {
            // Verificar si el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { email },
                include: { usuarioEstadoList: true }
            });
    
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
    
            // Verificar que el código de verificación sea correcto
            if (usuario.codigoVerificacion !== codigo) {
                return res.status(400).json({ msg: 'Código incorrecto' });
            }
    
            // Buscar el estado actual del usuario
            const estadoActual = usuario.usuarioEstadoList.find(
                (estado) => estado.fechaHasta === null
            );
    
            // Actualizar el estado actual (cerrarlo con fechaHasta)
            if (estadoActual) {
                await prisma.usuarioEstado.update({
                    where: { idUsuarioEstado: estadoActual.idUsuarioEstado },
                    data: { fechaHasta: new Date() }
                });
            }
    
            // Crear un nuevo registro en UsuarioEstado para el estado activo
            const estadoActivo = await prisma.estadoUsuario.findFirst({
                where: { nombre: "activo" }
            });
    
            if (!estadoActivo) {
                return res.status(500).json({ msg: 'Estado activo no encontrado en la base de datos' });
            }
    
            await prisma.usuarioEstado.create({
                data: {
                    idUsuario: usuario.idUsuario,
                    idEstadoUsuario: estadoActivo.idEstadoUsuario,
                    fechaDesde: new Date(),
                    fechaHasta: null
                }
            });
    
            // Limpiar el código de verificación después de activar la cuenta
            await prisma.usuario.update({
                where: { email },
                data: { codigoVerificacion: null }
            });
    
            res.status(200).json({ msg: 'Cuenta activada correctamente' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al activar la cuenta', detail: error.message });
        }
    },
    
    // 1er parte del proceso de recuperar contraseña olvidada
    forgotPassword: async (req: Request, res: Response) => {
        const { email } = req.body;
        try {
            // Buscar el usuario por su email
            const usuario = await prisma.usuario.findUnique({
                where: { email }
            });
            if (!usuario) {
                return res.status(404).json({ msg: 'El usuario no existe' });
            }
            // Generar un código de recuperación aleatorio
            const codigoVerificacion = Math.floor(100000 + Math.random() * 900000); // Ejemplo de código de 6 dígitos
            // Actualizar el usuario con el código de recuperación
            await prisma.usuario.update({
                where: { email },
                data: { codigoVerificacion }
            });
            // Enviar el correo con el código de recuperación
            await sendEmail(email, 'Recuperación de Contraseña', `Tu código de recuperación es: ${codigoVerificacion}`);
            console.log("codigoVerificacion", codigoVerificacion);
            res.status(200).json({ msg: 'Se ha enviado un correo con el código de recuperación', data: { email } });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al intentar recuperar la contraseña', detail: error.message });
        }
    },
    // 2da parte del proceso de recuperar contraseña olvidada
    resetPassword: async (req: Request, res: Response) => {
        const { email, codigo, nuevaContrasenia, repetirContrasenia } = req.body;

        if (nuevaContrasenia !== repetirContrasenia) {
            return res.status(400).json({ msg: 'Las contraseñas no coinciden' });
        }

        try {
            // 1. Verificar si el usuario existe
            const usuario = await prisma.usuario.findUnique({
                where: { email }
            });

            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            // 2. Verificar que el código sea correcto
            if (usuario.codigoVerificacion !== codigo) {
                return res.status(400).json({ msg: 'Código incorrecto' });
            }

            // 3. Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(nuevaContrasenia, 10);

            // 4. Actualizar la contraseña del usuario y eliminar el código de recuperación
            await prisma.usuario.update({
                where: { email },
                data: {
                    contrasenia: hashedPassword,
                    codigoVerificacion: null // Borrar el código una vez usado
                }
            });

            res.status(200).json({ msg: 'Contraseña actualizada correctamente' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al restablecer la contraseña', detail: error.message });
        }
    },

    setTokenNotificacion: async (req: Request, res: Response) => {
        try {
            const { id, tokenNotificacion } = req.body;
            await usuarioRepository.updateById(id, {tokenNotificacion});
            res.status(200).json({ msg: 'Se ha actualizado el token' });
        } catch (error: any) {
            res.status(500).json({ msg: 'No se pudo actualizar el token', detail: error.message });
        }

    },
    // Crear un nuevo usuario (create)
    // create: async (req: Request, res: Response) => {
    //     const { nombreUsuario, email, contrasenia } = req.body;
    //     try {
    //         const nuevoTipoArchivo = await prisma.usuario.create({
    //             data: { nombreUsuario, email, contrasenia },
    //         });
    //         res.status(201).json(nuevoTipoArchivo);
    //     } catch (error) {
    //         res.status(500).json({ error: 'Error al crear el usuario' });
    //     }
    // },

    // Actualizar un usuario (update)
    updateById: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombreUsuario, email, password, rol, nombre, apellido, direccion, fechaNacimiento, genero, dni  } = req.body;
        let data: { nombreUsuario: string; email: string; contrasenia?: string, idRol: number } = {nombreUsuario, email, idRol: parseInt(rol)};
        try {
            if (password) {
                const saltRoundsBcrypt = Number(process.env.SALT_ROUNDS_BCRYPT);
                let passwordHash = "";
                const salt = await bcrypt.genSalt(saltRoundsBcrypt);
                const hash = await bcrypt.hash(password, salt);
                passwordHash = hash;

                data = {...data, contrasenia: passwordHash};
                // Actualizar la contraseña en Firebase
                const user = await admin.auth().getUserByEmail(email);
                await admin.auth().updateUser(user.uid, { password });             
            }
            const usuarioActualizado = await prisma.usuario.update({
                where: { idUsuario: parseInt(id) },
                data: data,
            });

            if( !apellido&&
                !direccion&&
                !dni&&
                !email&&
                !fechaNacimiento&&
                !genero&&
                !nombre)
            {
                res.status(200).json({ msg: 'Faltan llenar algunos campos.', data: usuarioActualizado, status: "SUCCESSFULL" });
            }
            const perfil={
                apellido,
                direccion,
                dni,
                email,
                fechaNacimiento: new Date(fechaNacimiento),
                genero,
                nombre,
            }
            console.log("perfil:",perfil);
            const cuenta = await prisma.cuenta.findFirst({
                where: {
                    idUsuario: parseInt(id)
                }})
            console.log("cuenta:",cuenta);

            if(cuenta)
                await prisma.perfil.updateMany({
                    where: {
                        idCuenta: cuenta.idCuenta,
                        principal: true
                    },
                    data: perfil
                });
            res.status(200).json({ msg: 'Se ha actualizado el usuario.', data: usuarioActualizado, status: "SUCCESSFULL" });
  
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el usuario' });
        }
    },

    // Eliminar un usuario (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.usuario.delete({
                where: { idUsuario: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el usuario.',status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el usuario', detail: error.message, error: "ERROR" });
        }
    },
    create: async (req: Request, res: Response) => {
        const saltRoundsBcrypt = Number(process.env.SALT_ROUNDS_BCRYPT);
        const { nombreUsuario, email, password, rol, nombre, apellido, direccion, fechaNacimiento, genero, dni } = req.body;
        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (usuario) return res.status(200).json({ msg: "Este correo electrónico ya está registrado." });
      
        const estadoUsuarioDefault = await prisma.estadoUsuario.findMany({
            where: {
                nombre: {
                    contains: "creado", // Busca que el nombre contenga el string pasado
                },
            },
        });
        if (!estadoUsuarioDefault || estadoUsuarioDefault.length == 0) return res.status(200).json({ msg: "Estado de usuario no encontrado" });
        const rolDefault = await prisma.rol.findMany({
            where: {
                idRol: parseInt(rol)
            },
        });

        if (!rolDefault || rolDefault.length == 0)
            return res.status(404).json({ msg: "Rol no encontrado" });
        try {
            let passwordHash = "";
            const salt = await bcrypt.genSalt(saltRoundsBcrypt);
            const hash = await bcrypt.hash(password, salt);
            passwordHash = hash;
            // const nuevoEstadoUsuario = await prisma.usuario.create({
            //     data: {
            //         nombreUsuario,
            //         email,
            //         contrasenia: passwordHash,
            //         fechaModificacion: new Date(),
            //         idRol: rolDefault[0].idRol,
            //         cuenta: {
            //             create: {
            //                 // Aquí puedes añadir los campos de la cuenta si los hay
                      
            //             },
            //         },
            //     },
            //     include: {
            //         cuenta: {
                      
            //         },
            //     },
            // });

            if (!nombre || !apellido || !direccion || !fechaNacimiento || !genero || !dni) {
                return res.status(400).json({ msg: "Todos los campos de perfil son obligatorios" });
            }

            const perfil={
                apellido,
                direccion,
                dni,
                email,
                fechaNacimiento: new Date(fechaNacimiento),
                genero,
                nombre,
                principal: true
            }
            if (!perfil) return res.status(404).json({ msg: "Falta información de perfil" });
          
            const nuevoEstadoUsuario = await prisma.usuario.create({
                data: {
                    nombreUsuario,
                    email,
                    contrasenia: passwordHash,
                    fechaModificacion: new Date(),
                    idRol: rolDefault[0].idRol,
                    cuenta: {
                        create: {
                            // Aquí puedes añadir los campos de la cuenta si los hay
                            perfilList: {
                                create: perfil, // Crear el perfil asociado a la cuenta
                            },
                        },
                    },
                },
                include: {
                    cuenta: {
                        include: {
                            perfilList: true,
                        },
                    },
                },
            });
            if (!nuevoEstadoUsuario) return res.status(200).json({ msg: "Problemas al crear usuario" });
            // Generar un código de verificación
            const codigoVerificacion = Math.floor(100000 + Math.random() * 900000);

            // Actualizar el usuario con el código de verificación
            await prisma.usuario.update({
                where: { email },
                data: { codigoVerificacion }
            });

            const clientOrigin = process.env.CLIENT_ORIGIN || "https://vitaltrack.vercel.app";
            const token = jwt.sign(
                { email, codigo: codigoVerificacion },
                String(process.env.SECRET_KEY_JWT),
                { expiresIn: String(process.env.EXPIRES_JWT) || "24h" }
            );
            // Correo que se le envía al usuario
            await sendEmail(email, 'Activación de Cuenta',
                `
                <p>Hola ${nombreUsuario || 'Usuario'},</p>
                <p>Gracias por registrarte  en VitalTrack. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
                <p><a href="${clientOrigin}/activar-cuenta?token=${token}">Activar Cuenta</a></p>
                <p>Este enlace es válido por 24 horas.</p>
                <p>Si no solicitaste esta verificación, por favor ignora este mensaje.</p>
                <p>Gracias,<br>Equipo de VitalTrack</p>
                `);
            await prisma.usuarioEstado.create({
                data: {
                    idEstadoUsuario: estadoUsuarioDefault[0].idEstadoUsuario,
                    idUsuario: nuevoEstadoUsuario.idUsuario,
                    fechaDesde: new Date(),
                },
            });
            return res.status(200).json({ msg: "Usuario creado satisfactoriamente", status: "SUCCESSFULL" });
        } catch (error: any) {
            return res.status(200).json({ msg: "Error al crear usuario", mensaje: "", detail: error.message, status: "ERROR" });
        }
    },

}
