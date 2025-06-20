import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EstadoNotificacionRepository } from "../repositories/estado-notificacion.repository";

const prisma = new PrismaClient();
const estadoNotificacionRepository = new EstadoNotificacionRepository();

export const EstadoNotificacionController = {
    // Obtener todos los estado de medicamentos
    getAll: async (req: Request, res: Response) => {
        try {
            const estadoNotificaciones = await estadoNotificacionRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${estadoNotificaciones.length > 0 ? 'Se han encontrado los registros' : 'No se han encontrado los registros'}`, data: estadoNotificaciones});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los registros', detail: error.message });
        }
    },
    
    // Obtener un estado de notificacion por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await estadoNotificacionRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo estado de notificacion (create)
    create: async (req: Request, res: Response) => {
        let { nombre, fechaAlta, fechaBaja } = req.body;
        try {
            const nuevoEstadoNotificacion = await prisma.estadoNotificacion.create({
                data: { nombre, fechaAlta: (fechaAlta || new Date()), fechaBaja: fechaBaja || null },
            });
            res.status(200).json({ msg: 'Se ha creado el estado de notificación.', data: nuevoEstadoNotificacion });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el estado de notificacion', detail: error.message });
        }
    },
    
    // Actualizar un estado de notificacion (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { nombre, fechaBaja } = req.body;
        let payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const estadoNotificacionActualizado = await prisma.estadoNotificacion.update({
                where: { idEstadoNotificacion: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el estado de notificación.', data: estadoNotificacionActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el estado de notificacion', detail: error.message });
        }
    },
    
    // Eliminar un estado de notificacion (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.estadoNotificacion.delete({
                where: { idEstadoNotificacion: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el estado de notificación.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el estado de notificacion', detail: error.message });
        }
    },
}
