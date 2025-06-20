import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TipoFrecuenciaRepository } from "../repositories/tipo-frecuencia.repository";

const prisma = new PrismaClient();
const tipoFrecuenciaRepository = new TipoFrecuenciaRepository();

export const TipoFrecuenciaController = {
    // Obtener todos los tipo frecuencias
    getAll: async (req: Request, res: Response) => {
        try {
            let registros = await tipoFrecuenciaRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener una tipo frecuencia por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await tipoFrecuenciaRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo tipo frecuencia (create)
    create: async (req: Request, res: Response) => {
        let { nombre, valor } = req.body;
        try {
            const nuevoTipoFrecuencia = await prisma.tipoFrecuencia.create({
                data: { nombre, valor },
            });
            res.status(200).json({ msg: 'Se ha creado el tipo de frecuencia.', data: nuevoTipoFrecuencia });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la tipo frecuencia', detail: error.message });
        }
    },
    
    // Actualizar una tipo frecuencia (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { nombre, valor } = req.body;
        let payload: any = { nombre, valor };
        try {
            const tipoFrecuenciaActualizado = await prisma.tipoFrecuencia.update({
                where: { idTipoFrecuencia: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el tipo de frecuencia.', data: tipoFrecuenciaActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar la tipo frecuencia', detail: error.message });
        }
    },
    
    // Eliminar una tipo frecuencia (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.tipoFrecuencia.delete({
                where: { idTipoFrecuencia: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el tipo de frecuencia.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar la tipo frecuencia', detail: error.message });
        }
    },
}
