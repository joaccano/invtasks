import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { sendEmail } from "../emailService";

export const usuarioRepository = new UsuarioRepository();

export const AuthController = {
    createUser: async (req: Request, res: Response) => {
        const saltRoundsBcrypt: number = Number(process.env.SALT_ROUNDS_BCRYPT);
        const { nombreUsuario, email, contrasenia, perfil } = req.body;
        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (usuario) return res.status(404).json({ msg: "Este correo electrónico ya está registrado. Por favor, utiliza una dirección de correo diferente o inicia sesión con tu cuenta existente." });
        if (!perfil) return res.status(404).json({ msg: "Falta información de perfil" });
        perfil.principal = true;
        perfil.email = email;
        perfil.fechaNacimiento = new Date(perfil.fechaNacimiento);
        const estadoUsuarioDefault = await prisma.estadoUsuario.findMany({
            where: {
                nombre: {
                    contains: "creado", // Busca que el nombre contenga el string pasado
                },
            },
        });
        if (!estadoUsuarioDefault || estadoUsuarioDefault.length == 0) return res.status(404).json({ msg: "Estado de usuario no encontrado" });
        const rolDefault = await prisma.rol.findMany({
            where: {
                nombre: {
                    contains: "usuario", // Busca que el nombre contenga el string pasado
                },
            },
        });

        if (!rolDefault || rolDefault.length == 0)
            return res.status(404).json({ msg: "Rol no encontrado" });
        try {
            let passwordHash: string = "";
            const salt = await bcrypt.genSalt(saltRoundsBcrypt);
            const hash = await bcrypt.hash(contrasenia, salt);
            passwordHash = hash;
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
            if (!nuevoEstadoUsuario) return res.status(404).json({ msg: "Problemas al crear usuario" });
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
            res.status(201).json({ msg: "Usuario creado satisfactoriamente" });
        } catch (error: any) {
            res.status(500).json({ msg: "Error al crear usuario", mensaje: "", detail: error.message });
        }
    },

    // Endpoint para loguearse
    logIn: async (req: Request, res: Response) => {
        const { email, contrasenia } = req.body;
        try {
            // Buscar usuario por email
            const usuario = await prisma.usuario.findUnique({ where: { email }, include: { rol: { include: { rolPermisoList: { include: { permiso: true } } } } } });
            if (!usuario) return res.status(404).json({ msg: "El correo electrónico ingresado no corresponde a un usuario registrado." });

            const usuarioEstados = await prisma.usuarioEstado.findFirst({ where: { idUsuario: usuario.idUsuario }, orderBy: { idUsuarioEstado: 'desc' }, include: { estadoUsuario: true } });
            if (usuarioEstados?.estadoUsuario.nombre == 'Creado') return res.status(401).json({ msg: "Valide su usuario. Ingrese a su correo y active su cuenta." });

            // Verificar contraseña
            const validPassword = await bcrypt.compare(
                contrasenia,
                usuario.contrasenia
            );
            if (!validPassword) return res.status(401).json({ msg: "El correo o contraseña ingresado es incorrecto." });

            // Actualizar la fecha del último login
            await prisma.usuario.update({
                where: { idUsuario: usuario.idUsuario },
                data: { fechaUltimoLogin: new Date() },
            });
            // Generar un token JWT (opcional)
            const token = jwt.sign(
                { idUsuario: usuario.idUsuario, email: usuario.email },
                String(process.env.SECRET_KEY_JWT),
                { expiresIn: String(process.env.EXPIRES_JWT) || "1h" }
            );
            // Retornar el token o información de usuario
            return res.status(200).json({
                msg: "Logueo exitoso",
                token, // Devolver el token
                usuario: {
                    idUsuario: usuario.idUsuario,
                    email: usuario.email,
                    idRol: usuario.idRol,
                    nombreUsuario: usuario.nombreUsuario,
                },
            });
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ msg: "Error en el servidor", detail: error.message });
        }
    },

    loginSocial: async (req: Request, res: Response) => {
        const { email } = req.body;
        const userQuery = `filter[email][eq]=${email}`;
        try {
            const user = await usuarioRepository.findUnique(userQuery);
            const usuario = await prisma.usuario.findUnique({
                where: { email:email },
                include: {
                    rol: {
                        include: {
                            rolPermisoList: {
                                include: {
                                    permiso: true // Incluye los detalles de los permisos
                                }
                            }
                        }
                    }
                }
            });
            console.log(usuario);
            if (user) {
                await usuarioRepository.updateById(user.idUsuario, { fechaUltimoLogin: new Date() });
                const token = jwt.sign(
                    { idUsuario: user.idUsuario, email: user.email },
                    String(process.env.SECRET_KEY_JWT),
                    { expiresIn: String(process.env.EXPIRES_JWT) || "1h" }
                );
                return res.status(200).json({
                    message: "Logueo exitoso",
                    token, // Devolver el token
                    usuario: {
                        idUsuario: user.idUsuario,
                        email: user.email,
                        idRol: user.idRol,
                        nombreUsuario: user.nombreUsuario,
                        permisos: usuario?.rol?.rolPermisoList
                    },
                });
            } else {
                return res.status(200).json({
                    message: "Requiere registro",
                    data: {
                        userEmail: email
                    }
                });
            }
        } catch (error: any) {
            return res.status(500).json({ msg: "Error en el servidor", detail: error.message });
        }
    },

    // 2da parte del proceso de validar usuario
    activateAccount: async (req: Request, res: Response) => {
        const { token } = req.params;
        const decoded = jwt.verify(token, String(process.env.SECRET_KEY_JWT)) as jwt.JwtPayload;
        const { email, codigo } = decoded;

        if (!email || !codigo) return res.status(404).json({ msg: 'Email o codigo no encontrado.' });

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
            if (usuario.codigoVerificacion !== Number(codigo)) {
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
    }
}
