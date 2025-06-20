import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { RolPermisoRepository } from "../repositories/rol-permiso.repository";

const prisma = new PrismaClient();
const rolPermisoRepository = new RolPermisoRepository();

export const RolPermisoController = {
    // Obtener todos los roles
    getAll: async (req: Request, res: Response) => {
        try {
            const registros = await rolPermisoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
}
