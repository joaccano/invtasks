import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EspecialidadRepository } from "../repositories/especialidad.repository";

const prisma = new PrismaClient();
const especialidadRepository = new EspecialidadRepository();

export const EspecialidadController = {
    // Obtener todos los especialidad
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
            const registros = await especialidadRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await especialidadRepository.getPaginate(params, limit, page,"/specialties");
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros, links, status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los registros', detail: error.message, status: "ERROR"});
        }
    },
    
    // Obtener un especialidad por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await especialidadRepository.findById(Number(id), decodeURIComponent(req.url)), status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message, status: "ERROR" });
        }
    },
    
    // Crear un nuevo especialidad (create)
    create: async (req: Request, res: Response) => {
        const { nombre, fechaAlta, fechaBaja } = req.body;
        try {
            const nuevoEspecialidad = await prisma.especialidad.create({
                data: { nombre, fechaAlta: (fechaAlta || new Date()), fechaBaja: fechaBaja || null },
            });
            res.status(200).json({ msg: 'Se ha creado la especialidad.', data: nuevoEspecialidad, status: "SUCCESSFULL" });

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el especialidad', detail: error.message, status: "ERROR" });
        }
    },
    
    // Actualizar un especialidad (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const  { nombre, fechaBaja } = req.body;
        const payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const especialidadActualizado = await prisma.especialidad.update({
                where: { idEspecialidad: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado la especialidad.', data: especialidadActualizado, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el especialidad', detail: error.message, status: "ERROR" });
        }
    },
    
    // Eliminar un especialidad (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const relatedMedico = await prisma.medico.findFirst({
                where: { idEspecialidad: parseInt(id) },
            });

            if (relatedMedico) {
                return res.status(400).json({ msg: 'No se puede eliminar la especialidad porque está relacionada con un médico.', status: "ERROR" });
            }

            await prisma.especialidad.delete({
                where: { idEspecialidad: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado la especialidad.', status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el especialidad', detail: error.message, status: "ERROR" });
        }
    },
}
