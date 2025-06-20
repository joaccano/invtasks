import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EstadoUsuarioRepository } from "../repositories/estado-usuario.repository";

const prisma = new PrismaClient();
const estadoUsuarioRepository = new EstadoUsuarioRepository();

export const EstadoUsuarioController = {
    // Obtener todos los estado de usuarios
    getAll: async (req: Request, res: Response) => {
        try {
            const estadoUsuarios = await estadoUsuarioRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${estadoUsuarios.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: estadoUsuarios});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un estado de usuario por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await estadoUsuarioRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo estado de usuario (create)
    create: async (req: Request, res: Response) => {
        let { nombre, fechaAlta, fechaBaja } = req.body;
        try {
            const nuevoEstadoUsuario = await prisma.estadoUsuario.create({
                data: { nombre, fechaAlta: (fechaAlta || new Date()), fechaBaja: fechaBaja || null },
            });
            res.status(200).json({ msg: 'Se ha creado el estado de usuario.', data: nuevoEstadoUsuario });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el estado de usuario', detail: error.message });
        }
    },
    
    // Actualizar un estado de usuario (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { nombre, fechaBaja } = req.body;
        let payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const estadoUsuarioActualizado = await prisma.estadoUsuario.update({
                where: { idEstadoUsuario: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el estado de usuario.', data: estadoUsuarioActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el estado de usuario', detail: error.message });
        }
    },
    
    // Eliminar un estado de usuario (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.estadoUsuario.delete({
                where: { idEstadoUsuario: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el estado de usuario.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el estado de usuario', detail: error.message });
        }
    },
}
