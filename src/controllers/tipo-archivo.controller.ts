import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TipoArchivoRepository } from "../repositories/tipo-archivo.repository";

const prisma = new PrismaClient();
const tipoArchivoRepository = new TipoArchivoRepository();

export const TipoArchivoController = {
    // Obtener todos los tipos de archivo
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
            const registros = await tipoArchivoRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await tipoArchivoRepository.getPaginate(params, limit, page,"/type_files");
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros, links, status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message, status: "ERROR"});
        }
    },
    
    // Obtener un tipo de archivo por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await tipoArchivoRepository.findById(Number(id), decodeURIComponent(req.url)), status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message, status: "ERROR" });
        }
    },
    
    // Crear un nuevo tipo de archivo (create)
    create: async (req: Request, res: Response) => {
        const { nombre, descripcion, extension } = req.body;
        try {
            const nuevoTipoArchivo = await prisma.tipoArchivo.create({
                data: { nombre, descripcion, extension },
            });
            res.status(200).json({ msg: 'Se ha creado la el tipo de archivo.', data: nuevoTipoArchivo, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el tipo de archivo', detail: error.message, status: "ERROR" });
        }
    },
    
    // Actualizar un tipo de archivo (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, descripcion, extension } = req.body;
        try {
            const tipoArchivoActualizado = await prisma.tipoArchivo.update({
                where: { idTipoArchivo: parseInt(id) },
                data: { nombre, descripcion, extension },
            });
            res.status(200).json({ msg: 'Se ha actualizado el tipo de archivo.', data: tipoArchivoActualizado, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el tipo de archivo', detail: error.message, status: "ERROR" });
        }
    },
    
    // Eliminar un tipo de archivo (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.tipoArchivo.delete({
                where: { idTipoArchivo: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el tipo de archivo.', status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el tipo de archivo', detail: error.message, status: "ERROR" });
        }
    },
}
