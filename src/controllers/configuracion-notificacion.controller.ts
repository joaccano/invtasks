import { Request, Response } from "express";
import { ConfiguracionNotificacionRepository } from "../repositories/configuracion-notificacion.repository";
import { PrismaClient } from "@prisma/client";
import { calculateDailyIntervalsRepetition } from "../helpers/time.helper";
import { medicineNotificationQueue } from "../queues/medicine-notification.queue";

const configuracionNotificacionRepository = new ConfiguracionNotificacionRepository();
const prisma = new PrismaClient();

export const ConfiguracionNotificacionController = {
    // Recuperar registros en base a filtros
    getAll: async (req: Request, res: Response) => {
        try {
            const configuracionNotificacion = await configuracionNotificacionRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${configuracionNotificacion.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: configuracionNotificacion });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un categoria por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await configuracionNotificacionRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo notificacion (create)
     create: async (req: Request, res: Response) => {
        let { cantidadFrecuencia, cantidadMedicamento, idMedicamento, idTipoFrecuencia } = req.body;
        let { id_notificacion } = req.params;
        try {
            // Validar si ya existe una configuración activa para esta notificación
            const configuracionActiva = await prisma.configuracionNotificacion.findFirst({
                where: {
                    idMedicamento: idMedicamento,
                    idNotificacion: Number(id_notificacion),
                    fechaBaja: null, // Solo buscamos configuraciones activas
                },
            });

            if (configuracionActiva) {
                return res.status(400).json({
                    msg: "Ya existe una configuración de notificación activa para este medicamento.",
                });
            }
            const nuevaConfiguracionNotificacion = await prisma.configuracionNotificacion.create({
                data: {
                    cantidadFrecuencia, cantidadMedicamento, idMedicamento, idTipoFrecuencia, idNotificacion: Number(id_notificacion), fechaNotificacion: new Date()
                },
                include: {
                    tipoFrecuencia: true,
                    medicamento: true,
                    notificacion: true
                }
            });
            const host = req.get('Host'); // Esto te da "localhost:3000" o el dominio si está desplegado
            const protocol = req.protocol; // "http" o "https"
            const baseUrl = `${protocol}://${host}`;
            let notificacion: any = JSON.parse(JSON.stringify(nuevaConfiguracionNotificacion.notificacion));
            notificacion['configuracionNotificacion'] = nuevaConfiguracionNotificacion;
            const delays = calculateDailyIntervalsRepetition(nuevaConfiguracionNotificacion.notificacion.fechaDesde, nuevaConfiguracionNotificacion.cantidadFrecuencia, Number(nuevaConfiguracionNotificacion.tipoFrecuencia.valor));
            for (let delayMilis of delays) {
                medicineNotificationQueue.add('medicineNotificationQueue', 
                    {notificacion: {...notificacion, baseUrl}}, 
                    {jobId: `medicineNotificationQueue-${nuevaConfiguracionNotificacion.idConfiguracionNotificacion}-${delayMilis}`, removeOnComplete: true, removeOnFail: true, delay: delayMilis });
            }
            res.status(200).json({data: nuevaConfiguracionNotificacion, msg: 'Se ha registrado la configuracion de notificación.'});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la notificacion', detail: error.message });
        }
    },

    // Actualizar un notificacion (update)
    update: async (req: Request, res: Response) => {
        // let { titulo, mensaje, fechaDesde, fechaHasta, perfil, tipoNotificacion, idConfiguracionNotificacion, idTipoFrecuencia, cantidadFrecuencia, idMedicamento, cantidadMedicamento, estadoNotificacion } = req.body;
        // let { id } = req.params;
        // const idNotificacion = Number(id);
        // try {
        //     const estadoNotificacionFilter = await prisma.estadoNotificacion.findMany({
        //         where: {
        //             nombre: {
        //                 contains: estadoNotificacion
        //             },
        //         },
        //     });

        //     const ultimoEstadoNotificacion = await prisma.notificacionEstado.findFirst({
        //         where: {
        //             idNotificacion: idNotificacion, // Filtramos por idNotificacion
        //         },
        //         orderBy: {
        //             idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
        //         },
        //     });

        //     if (ultimoEstadoNotificacion?.idEstadoNotificacion != estadoNotificacionFilter[0].idEstadoNotificacion) {
        //         const actualEstadoNotificacion = await prisma.notificacionEstado.findFirst({
        //             where: {
        //                 idNotificacion: idNotificacion, // Filtramos por idNotificacion
        //             },
        //             orderBy: {
        //                 idNotificacionEstado: 'desc', // Ordenamos por el campo 'id' en orden descendente para obtener el registro más reciente
        //             },
        //         });

        //         const estadoNotificacionActualizado = await prisma.notificacionEstado.update({
        //             where: {
        //                 idNotificacionEstado: actualEstadoNotificacion?.idNotificacionEstado,
        //             },
        //             data: {
        //                 fechaHasta: new Date(),
        //             },
        //         });
        //         const nuevoEstadoNotificacion = await prisma.notificacionEstado.create({
        //             data: {
        //                 idEstadoNotificacion: estadoNotificacionFilter[0].idEstadoNotificacion,
        //                 idNotificacion: idNotificacion,
        //                 fechaDesde: new Date(),
        //                 fechaHasta: null,
        //             }
        //         });
        //     }
        //     const dateFechaDesde = new Date(fechaDesde);
        //     const dateFechaHasta = fechaHasta ? new Date(fechaHasta) : dateFechaDesde;
        //     const notificacionActualizada = await prisma.notificacion.update({
        //         where: {
        //             idNotificacion: idNotificacion,
        //         },
        //         data: {
        //             titulo: titulo, mensaje: mensaje, fechaDesde: dateFechaDesde, fechaHasta: dateFechaHasta, idPerfil: perfil, idTipoNotificacion: tipoNotificacion,
        //         },
        //         include: {
        //             tipoNotificacion: true
        //         }
        //     })
        //     if (notificacionActualizada.idTipoNotificacion == 1) {
        //         const configuracionNotificacion = await prisma.configuracionNotificacion.update({
        //             where: {
        //                 idConfiguracionNotificacion: Number(idConfiguracionNotificacion),
        //             },
        //             data: {
        //                 idMedicamento,
        //                 idNotificacion: idNotificacion,
        //                 cantidadMedicamento: cantidadMedicamento,
        //                 idTipoFrecuencia,
        //                 cantidadFrecuencia: cantidadMedicamento,
        //                 fechaNotificacion: new Date(),
        //             },
        //         });
        //         const jobs = await medicineNotificationQueue.getJobs();
        //         for(const job of jobs) {
        //             if(job.id?.includes(`medicineNotificationQueue-${notificacionActualizada.idNotificacion}`)) {
        //                 await job.remove();
        //             }
        //         }
        //         const delays = calculateDailyIntervalsBetweenDates(dateFechaDesde, dateFechaHasta);
        //         console.log(delays)
        //         for(let delayMilis of delays) {
        //             if(delayMilis >= 0) {
        //                 notificationQueue.add('medicineNotificationQueue', 
        //                     {notificacion: notificacionActualizada} , 
        //                     {jobId: `medicineNotificationQueue-${notificacionActualizada.idNotificacion}-${delayMilis}`, removeOnComplete: true, removeOnFail: true, delay: delayMilis }  
        //                 );
        //             }
        //         }
        //     }
        //     if(notificacionActualizada.idTipoNotificacion == 2) {
        //         const jobs = await notificationQueue.getJobs(['completed', 'failed', 'waiting', 'active', 'delayed']);
        //         for(const job of jobs) {
        //             if(job.id?.includes(`notificationQueue-${notificacionActualizada.idNotificacion}`)) {
        //                 await job.remove();
        //             }
        //         }
        //         const hasta = notificacionActualizada.fechaHasta ? notificacionActualizada.fechaHasta : notificacionActualizada.fechaDesde;
        //         const delays = calculateDailyIntervalsBetweenDates(new Date(notificacionActualizada.fechaDesde), hasta);
        //         for(let delayMilis of delays) {
        //             if(delayMilis >= 0) {
        //                 notificationQueue.add('notificationQueue', 
        //                     {notificacion: notificacionActualizada} , 
        //                     {jobId: `notificationQueue-${notificacionActualizada.idNotificacion}-${delayMilis}`, removeOnComplete: true, removeOnFail: true, delay: delayMilis }  
        //                 );
        //             }
        //         }
        //     }
        //     res.status(200).json({ data: notificacionActualizada, msg: 'Se ha actualizado la notificación.'});
        // } catch (error: any) {
        //     console.log(error)
        //     res.status(500).json({ msg: 'Error al actualizar el notificacion', detail: error.message });
        // }
    },

    // Eliminar un medicamento (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.configuracionNotificacion.update({
                where: { idConfiguracionNotificacion: parseInt(id) },
                data: { fechaBaja: new Date() }
            });
            res.status(200).json({ msg: 'Se ha eliminado el medicamento.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el medicamento', detail: error.message });
        }
    },
}