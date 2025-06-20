import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { notificationQueue } from "../queues/notification.queue";
import { medicineNotificationQueue } from "../queues/medicine-notification.queue";
import { calculateDailyIntervalsBetweenDates } from "../helpers/time.helper";
import { NotificacionRepository } from "../repositories/notificacion.repository";
import { CustomRequest } from "../middlewares/authMiddleware";
import { FirebaseAdapter } from "../adapters/firebase.adapter";
import { PerfilRepository } from "../repositories/perfil.repository";
import jwt from "jsonwebtoken";
import { ConfiguracionNotificacionRepository } from "../repositories/configuracion-notificacion.repository";
import { InventarioRepository } from "../repositories/inventario.repository";

const prisma = new PrismaClient();
const notificacionRepository = new NotificacionRepository();
const firebaseAdapter = new FirebaseAdapter();
const perfilRepository = new PerfilRepository();
const configuracionNotificacionRepository = new ConfiguracionNotificacionRepository();
const inventarioRepository = new InventarioRepository();

export const NotificacionController = {

    // Obtener todas las notificaciones
    getAll: async (req: CustomRequest, res: Response) => {
        try {
            const notificaciones = await notificacionRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${notificaciones.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: notificaciones });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener una notificación por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await notificacionRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo notificacion (create)
    create: async (req: Request, res: Response) => {
        let { titulo, mensaje, fechaDesde, fechaHasta, idPerfil, idTipoNotificacion, idTipoFrecuencia, cantidadMedicamento, idMedicamento } = req.body;
        const estadoNotificacionDefault = await prisma.estadoNotificacion.findMany({
            where: {
                nombre: {
                    contains: "Activo", // Busca que el nombre contenga el string pasado
                },
            },
        });

        try {
            const notificacionExistente = await prisma.notificacion.findFirst({
                where: {
                    titulo,
                    mensaje,
                    idTipoNotificacion,
                    fechaHasta: null
                },
            });

            if (notificacionExistente) {
                return res.status(400).json({ msg: 'Ya existe una notificación con el mismo título, mensaje y tipo de notificación. Intente nuevamente.'});
            }
            
            const nuevoNotificacion = await prisma.notificacion.create({    
                data: {
                    titulo, mensaje, fechaDesde: new Date(fechaDesde), fechaHasta: fechaHasta ? new Date(fechaHasta) : null, idPerfil, idTipoNotificacion,
                },
                include: {
                    tipoNotificacion: true
                }
            });
            const response = await prisma.notificacionEstado.create({
                data: {
                    idEstadoNotificacion: estadoNotificacionDefault[0].idEstadoNotificacion,
                    idNotificacion: nuevoNotificacion.idNotificacion,
                    fechaDesde: new Date(fechaDesde),
                    fechaHasta: fechaDesde ? new Date(fechaDesde) : new Date(fechaHasta),
                }
            });
            // Recordatorio de turno
            if (idTipoNotificacion != 1) {
                const hasta = nuevoNotificacion.fechaHasta ? nuevoNotificacion.fechaHasta : nuevoNotificacion.fechaDesde;
                const delays = calculateDailyIntervalsBetweenDates(new Date(fechaDesde), hasta);
                for (let delayMilis of delays) {
                    const delayTime = delayMilis < 0 ? undefined : delayMilis;
                    const host = req.get('Host'); // Esto te da "localhost:3000" o el dominio si está desplegado
                    const protocol = req.protocol; // "http" o "https"
                    const baseUrl = `${protocol}://${host}`;
                    notificationQueue.add('notificationQueue',
                        { notificacion: { ...nuevoNotificacion, baseUrl } },
                        { jobId: `notificationQueue-${nuevoNotificacion.idNotificacion}`, removeOnComplete: true, removeOnFail: true, delay: delayTime }
                    );
                }
            }
            res.status(200).json({ data: nuevoNotificacion, msg: 'Se ha registrado la notificación.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la notificacion', detail: error.message });
        }
    },

    // Actualizar un notificacion (update)
    update: async (req: Request, res: Response) => {
        let { titulo, mensaje, fechaDesde, fechaHasta, perfil, tipoNotificacion, idConfiguracionNotificacion, idTipoFrecuencia, cantidadFrecuencia, idMedicamento, cantidadMedicamento, estadoNotificacion } = req.body;
        let { id } = req.params;
        const idNotificacion = Number(id);
        try {
            const estadoNotificacionFilter = await prisma.estadoNotificacion.findMany({
                where: {
                    nombre: {
                        contains: estadoNotificacion, // Busca que el nombre contenga el string pasado
                        //equals: estadoNotificacion,
                    },
                },
            });
            const ultimoEstadoNotificacion = await prisma.notificacionEstado.findFirst({
                where: {
                    idNotificacion: idNotificacion, // Filtramos por idNotificacion
                },
                orderBy: {
                    idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
                },
            });
            if (ultimoEstadoNotificacion?.idEstadoNotificacion != estadoNotificacionFilter[0].idEstadoNotificacion) {
                const actualEstadoNotificacion = await prisma.notificacionEstado.findFirst({
                    where: {
                        idNotificacion: idNotificacion, // Filtramos por idNotificacion
                    },
                    orderBy: {
                        idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
                    },
                });
                const estadoNotificacionActualizado = await prisma.notificacionEstado.update({
                    where: {
                        idNotificacionEstado: actualEstadoNotificacion?.idNotificacionEstado,
                    },
                    data: {
                        fechaHasta: new Date(),
                    },
                });
                const nuevoEstadoNotificacion = await prisma.notificacionEstado.create({
                    data: {
                        idEstadoNotificacion: estadoNotificacionFilter[0].idEstadoNotificacion,
                        idNotificacion: idNotificacion,
                        fechaDesde: new Date(),
                        fechaHasta: null,
                    }
                });
            }
            // const dateFechaDesde = new Date(fechaDesde);
            // const dateFechaHasta = fechaHasta ? new Date(fechaHasta) : dateFechaDesde;
            let payload: any = {
                mensaje, titulo
            };
            if (fechaHasta) payload['fechaHasta'] = new Date(fechaHasta);
            const notificacionActualizada = await prisma.notificacion.update({
                where: {
                    idNotificacion: idNotificacion,
                },
                data: payload,
                include: {
                    tipoNotificacion: true
                }
            })
            if (notificacionActualizada.idTipoNotificacion == 1) {


                // const configuracionNotificacion = await prisma.configuracionNotificacion.update({
                //     where: {
                //         idConfiguracionNotificacion: Number(idConfiguracionNotificacion),
                //     },
                //     data: {
                //         idMedicamento,
                //         idNotificacion: idNotificacion,
                //         cantidadMedicamento: cantidadMedicamento,
                //         idTipoFrecuencia,
                //         cantidadFrecuencia: cantidadMedicamento,
                //         fechaNotificacion: new Date(),
                //     },
                // });
                // const jobs = await medicineNotificationQueue.getJobs();
                // for(const job of jobs) {
                //     if(job.id?.includes(`medicineNotificationQueue-${notificacionActualizada.idNotificacion}`)) {
                //         await job.remove();
                //     }
                // }
                // // const delays = calculateDailyIntervalsBetweenDates(dateFechaDesde, dateFechaHasta);
                // console.log(delays)
                // for(let delayMilis of delays) {
                //     if(delayMilis >= 0) {
                //         notificationQueue.add('medicineNotificationQueue', 
                //             {notificacion: notificacionActualizada} , 
                //             {jobId: `medicineNotificationQueue-${notificacionActualizada.idNotificacion}-${delayMilis}`, removeOnComplete: true, removeOnFail: true, delay: delayMilis }  
                //         );
                //     }
                // }
            }
            if (notificacionActualizada.idTipoNotificacion == 2) {
                const jobs = await notificationQueue.getJobs(['completed', 'failed', 'waiting', 'active', 'delayed']);
                for (const job of jobs) {
                    if (job.id?.includes(`notificationQueue-${notificacionActualizada.idNotificacion}`)) {
                        await job.remove();
                    }
                }
                const hasta = notificacionActualizada.fechaHasta ? notificacionActualizada.fechaHasta : notificacionActualizada.fechaDesde;
                const delays = calculateDailyIntervalsBetweenDates(new Date(notificacionActualizada.fechaDesde), hasta);
                for (let delayMilis of delays) {
                    if (delayMilis >= 0) {
                        notificationQueue.add('notificationQueue',
                            { notificacion: notificacionActualizada },
                            { jobId: `notificationQueue-${notificacionActualizada.idNotificacion}-${delayMilis}`, removeOnComplete: true, removeOnFail: true, delay: delayMilis }
                        );
                    }
                }
            }
            res.status(200).json({ data: notificacionActualizada, msg: 'Se ha actualizado la notificación.' });
        } catch (error: any) {
            console.log(error)
            res.status(500).json({ msg: 'Error al actualizar el notificacion', detail: error.message });
        }
    },

    // Eliminar un notificacion (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const notificacion = await notificacionRepository.findUnique(`filter[idNotificacion][eq]=${id}`);
            if (!notificacion) return res.status(422).json({ msg: 'No existe la notificación' });
            // Se optara por un softDelete
            const estadoNotificacionDefault = await prisma.estadoNotificacion.findMany({
                where: {
                    nombre: {
                        contains: "Eliminado", // Busca que el nombre contenga el string pasado
                    },
                },
            });
            const ultimoEstadoNotificacion = await prisma.notificacionEstado.findFirst({
                where: {
                    idNotificacion: parseInt(id), // Filtramos por idNotificacion
                },
                orderBy: {
                    idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
                },
            });
            await prisma.notificacionEstado.update({
                where: {
                    idNotificacionEstado: ultimoEstadoNotificacion?.idNotificacionEstado,
                },
                data: {
                    fechaHasta: new Date(),
                },
            });
            const nuevoEstadoNotificacion = await prisma.notificacionEstado.create({
                data: {
                    idEstadoNotificacion: estadoNotificacionDefault[0].idEstadoNotificacion,
                    idNotificacion: parseInt(id),
                    fechaDesde: new Date(),
                    fechaHasta: null,
                }
            });
            await prisma.notificacion.update({
                where: {
                    idNotificacion: parseInt(id),
                },
                data: {
                    fechaHasta: new Date(),
                },
            });
            if (notificacion.idTipoNotificacion == 1) {
                const jobs = await medicineNotificationQueue.getJobs(['completed', 'failed', 'waiting', 'active', 'delayed']);
                for (const job of jobs) {
                    if (job.id?.includes(`medicineNotificationQueue-${notificacion.idNotificacion}`)) {
                        await job.remove({ removeChildren: true });
                    }
                }
            }
            if (notificacion.idTipoNotificacion == 2) {
                const jobs = await notificationQueue.getJobs(['completed', 'failed', 'waiting', 'active', 'delayed']);
                for (const job of jobs) {
                    if (job.id?.includes(`notificationQueue-${notificacion.idNotificacion}`)) {
                        await job.remove({ removeChildren: true });
                    }
                }
            }
            res.status(200).json({ msg: 'Se ha eliminado la notificación.' });
        } catch (error: any) {
            console.log(error);
            res.status(500).json({ msg: 'Error al eliminar el notificacion', detail: error.message });
        }
    },

    testPushById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const notification = await notificacionRepository.findById(Number(id), decodeURIComponent(req.url));
            if (notification) {
                const payload = `filter[idPerfil][eq]=${notification.idPerfil}&filter[include]=cuenta.usuario`;
                const perfil = await perfilRepository.findUnique(payload);
                const usuario = perfil.cuenta.usuario;
                const token = jwt.sign(
                    { notificacionId: notification.idNotificacion, configuracionNotificacionId: null }, // configuracionNotificacionId: .idConfiguracionNotificacion
                    String(process.env.SECRET_KEY_JWT),
                    { expiresIn: String(process.env.EXPIRES_JWT) || "24h" }
                );
                notification['token'] = token;
                const host = req.get('Host'); // Esto te da "localhost:3000" o el dominio si está desplegado
                const protocol = req.protocol; // "http" o "https"
                const baseUrl = `${protocol}://${host}`;
                notification['baseUrl'] = baseUrl;
                await firebaseAdapter.sendMessage(notification, usuario.tokenNotificacion);
                res.json({ msg: 'Se encontro registro' });
            } else {
                res.json({ msg: 'No se encontro registro' });
            }
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    pushByToken: async (req: Request, res: Response) => {
        const { token } = req.params;
        const decoded = jwt.verify(token, String(process.env.SECRET_KEY_JWT)) as jwt.JwtPayload;
        const { notificacionId, configuracionNotificacionId } = decoded;
        try {
            if (notificacionId) {
                if (configuracionNotificacionId) {
                    const payload = `filter[idConfiguracionNotificacion][eq]=${configuracionNotificacionId}&filter[include]=notificacion.perfil.cuenta.usuario`;
                    const configuracionNotificacion = await configuracionNotificacionRepository.findUnique(payload);
                    const payload2 = `filter[idPerfil][eq]=${configuracionNotificacion.notificacion.idPerfil}&filter[idMedicamento][eq]=${configuracionNotificacion.idMedicamento}&filter[include]=medicamento`;
                    const inventario = await inventarioRepository.findFirst(payload2);
                    const cantidadMedicamento = configuracionNotificacion.cantidadMedicamento;
                    const stock = inventario.stock;
                    const cantidadMinima = inventario.cantidadMinima;
                    const cantidad = stock - cantidadMedicamento;
                    let notification: any;
                    if (stock >= cantidadMedicamento) {
                        let payload: any = {};
                        payload['idPerfil'] = inventario.idPerfil;
                        payload['idMedicamento'] = inventario.idMedicamento;
                        payload['stock'] = cantidad;
                        try {
                            const inventarioActualizado = await prisma.inventario.update({
                                where: { idInventario: parseInt(inventario.idInventario) },
                                data: payload,
                            });
                        } catch (error: any) {
                            console.log('ERROR inventarioActualizado ', error);
                        }
                        if (cantidadMinima >= cantidad) {
                            notification = {
                                titulo: 'Alerta de stock',
                                mensaje: `Esta quedando poco medicamento de ${inventario.medicamento?.nombreFarmaco} - ${inventario.medicamento?.nombreFarmaco}.`,
                            }
                        } else {
                            notification = {
                                titulo: 'Stock actualizado correctamente',
                                mensaje: `Se descontaron ${configuracionNotificacion.cantidadMedicamento} unidad/es del medicamento ${inventario.medicamento?.nombreFarmaco} - ${inventario.medicamento?.nombreFarmaco} (quedan ${cantidad} unidad/es).`,
                            }
                        }
                    } else {
                        notification = {
                            titulo: 'Problema con el stock',
                            mensaje: `No se logro descontar el medicamento ${inventario.medicamento?.nombreFarmaco} - ${inventario.medicamento?.nombreFarmaco}.`,
                        }
                        let payload2: any = {};
                        payload2['fechaBaja'] = new Date();
                        try {
                            const configuracionNotificacionActualizada = await prisma.configuracionNotificacion.update({
                                where: { idConfiguracionNotificacion: parseInt(configuracionNotificacion.idConfiguracionNotificacion) },
                                data: payload2,
                            });
                        } catch (error: any) {
                            console.log('ERROR configuracionNotificacionActualizada ', error);
                        }
                    }
                    await firebaseAdapter.sendMessage(notification, configuracionNotificacion.notificacion?.perfil?.cuenta?.usuario?.tokenNotificacion);
                } else {
                    const idNotificacion = Number(notificacionId);
                    try {
                        const estadoNotificacionFilter = await prisma.estadoNotificacion.findMany({
                            where: {
                                nombre: {
                                    contains: 'Finalizado'
                                },
                            },
                        });
                        const ultimoEstadoNotificacion = await prisma.notificacionEstado.findFirst({
                            where: {
                                idNotificacion: idNotificacion, // Filtramos por idNotificacion
                            },
                            orderBy: {
                                idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
                            },
                        });
                        if (ultimoEstadoNotificacion?.idEstadoNotificacion != estadoNotificacionFilter[0].idEstadoNotificacion) {
                            const estadoNotificacionActualizado = await prisma.notificacionEstado.update({
                                where: {
                                    idNotificacionEstado: ultimoEstadoNotificacion?.idNotificacionEstado,
                                },
                                data: {
                                    fechaHasta: new Date(),
                                },
                            });
                            const nuevoEstadoNotificacion = await prisma.notificacionEstado.create({
                                data: {
                                    idEstadoNotificacion: estadoNotificacionFilter[0].idEstadoNotificacion,
                                    idNotificacion: idNotificacion,
                                    fechaDesde: new Date(),
                                    fechaHasta: null,
                                }
                            });
                        }
                        const notificacionActualizada = await prisma.notificacion.update({
                            where: {
                                idNotificacion: idNotificacion,
                            },
                            data: {
                                fechaHasta: new Date()
                            }
                        })
                        res.status(200).json({ msg: 'Se ha actualizado la notificación.' });
                    } catch (error: any) {
                        console.log(error)
                        res.status(500).json({ msg: 'Error al actualizar el notificacion', detail: error.message });
                    }
                }
            } else {


            }
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    }
}
