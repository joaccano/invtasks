import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TipoNotificacionRepository } from "../repositories/tipo-notificacion.repository";

const prisma = new PrismaClient();
const tipoNotificacionRepository = new TipoNotificacionRepository();

export const TipoNotificacionController = {
    // Obtener todos los tipos de notificaciones
    getAll: async (req: Request, res: Response) => {
        try {
            const registros = await tipoNotificacionRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un tipo de notificacion por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await tipoNotificacionRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo tipo de notificacion (create)
    create: async (req: Request, res: Response) => {
        const { nombre, fechaAlta } = req.body;
        try {
            const nuevoTipoNotificacion = await prisma.tipoNotificacion.create({
                data: { nombre, fechaAlta: (fechaAlta || new Date()) },
            });
            res.status(201).json({ msg: 'Se ha creado tipo notificacion', data: nuevoTipoNotificacion });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el tipo de notificacion.', detail: error.message });
        }
    },
    
    // Actualizar un tipo de notificacion (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, fechaBaja } = req.body;
        const payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const tipoNotificacionActualizado = await prisma.tipoNotificacion.update({
                where: { idTipoNotificacion: parseInt(id) },
                data: payload,
            });
            res.json({ msg: 'Se ha actualizado tipo notificacion', data: tipoNotificacionActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el tipo de notificacion.', detail: error.message });
        }
    },
    
    // Eliminar un tipo de notificacion (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.tipoNotificacion.delete({
                where: { idTipoNotificacion: parseInt(id) },
            });
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el tipo de notificacion.', detail: error.message });
        }
    },
}
