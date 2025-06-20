import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EstadoMedicamentoRepository } from "../repositories/estado-medicamento.repository";

const prisma = new PrismaClient();
const estadoMedicamentoRepository = new EstadoMedicamentoRepository();

export const EstadoMedicamentoController = {
    // Obtener todos los estado de medicamentos
    getAll: async (req: Request, res: Response) => {
        try {
            const estadoMedicamentos = await estadoMedicamentoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${estadoMedicamentos.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: estadoMedicamentos});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los registros', detail: error.message });
        }
    },
    
    // Obtener un estado de medicamento por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await estadoMedicamentoRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo estado de medicamento (create)
    create: async (req: Request, res: Response) => {
        let { nombre, descripcion, fechaAlta, fechaBaja } = req.body;
        try {
            const nuevoEstadoMedicamento = await prisma.estadoMedicamento.create({
                data: { nombre, descripcion, fechaAlta: (fechaAlta || new Date()), fechaBaja: fechaBaja || null },
            });
            res.status(200).json({ msg: 'Se ha creado el estado de medicamento.', data: nuevoEstadoMedicamento });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el estado de medicamento', detail: error.message });
        }
    },
    
    // Actualizar un estado de medicamento (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { nombre, descripcion, fechaBaja } = req.body;
        let payload: any = { nombre, descripcion };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const estadoMedicamentoActualizado = await prisma.estadoMedicamento.update({
                where: { idEstadoMedicamento: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el estado de medicamento.', data: estadoMedicamentoActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el estado de medicamento', detail: error.message });
        }
    },
    
    // Eliminar un estado de medicamento (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.estadoMedicamento.delete({
                where: { idEstadoMedicamento: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el estado de medicamento.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el estado de medicamento', detail: error.message });
        }
    },
}
