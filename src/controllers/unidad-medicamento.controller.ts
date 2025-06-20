import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { UnidadMedicamentoRepository } from "../repositories/unidad-medicamento.repository";

const prisma = new PrismaClient();
const unidadMedicamentRepository = new UnidadMedicamentoRepository();

export const UnidadMedicamentoController = {
    // Obtener todos las unidades de medicamentos
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
            const registros = await unidadMedicamentRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await unidadMedicamentRepository.getPaginate(params, limit, page,"/medicines");
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros, links, status: "SUCCESSFULL"});
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message, status: "ERROR" });
        }
    },

    // Obtener una unidad de medicamento por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await unidadMedicamentRepository.findById(Number(id), decodeURIComponent(req.url)), status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message, status: "ERROR" });
        }
    },

    // Crear un nueva unidad de medicamento (create)
    create: async (req: Request, res: Response) => {
        const { nombre, indicaciones, unidadDeMedida, cantidadDeDosis } = req.body;
        try {
            const nuevoUnidadMedicamento = await prisma.unidadMedicamento.create({
                data: { nombre, indicaciones, unidadDeMedida:parseInt(unidadDeMedida), cantidadDeDosis:parseInt(cantidadDeDosis) },
            });
            res.status(200).json({ msg: 'Se ha creado la unidad de medicamento.', data: nuevoUnidadMedicamento, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la unidad de medicamento', detail: error.message, status: "ERROR" });
        }
    },

    // Actualizar una unidad de medicamento (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, indicaciones, unidadDeMedida, cantidadDeDosis, fechaBaja } = req.body;
        const payload: any = { nombre, indicaciones, unidadDeMedida:parseInt(unidadDeMedida), cantidadDeDosis:parseInt(cantidadDeDosis)};
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const unidadMedicamentoActualizado = await prisma.unidadMedicamento.update({
                where: { idUnidadMedicamento: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado la unidad de medicamento.', data: unidadMedicamentoActualizado, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar la unidad de medicamento', detail: error.message, status: "ERROR" });
        }
    },

    // Eliminar una unidad de medicamento (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {

            const associatedMedicamentos = await prisma.medicamento.findMany({
                where: { idUnidadMedicamento: parseInt(id) },
            });

            if (associatedMedicamentos.length > 0) {
                return res.status(400).json({ msg: 'No se puede eliminar la unidad de medicamento porque está asociada a uno o más medicamentos.', status: "ERROR" });
            }

            await prisma.unidadMedicamento.delete({
                where: { idUnidadMedicamento: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado la unidad de medicamento.', status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar la unidad de medicamento', detail: error.message, status: "ERROR" });
        }
    },
}
