import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TipoDocumentoRepository } from "../repositories/tipo-documento.repository";

const prisma = new PrismaClient();
const tipoDocumentoRepository = new TipoDocumentoRepository();

export const TipoDocumentoController = {
    // Obtener todos los tipos de documento
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
            const registros = await tipoDocumentoRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await tipoDocumentoRepository.getPaginate(params, limit, page,"/types_documents");
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros, links, status: "SUCCESSFULL"});
       
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message, status: "ERROR" });
        }
    },
    
    // Obtener un tipo de documento por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await tipoDocumentoRepository.findById(Number(id), decodeURIComponent(req.url)), status: "SUCCESSFULL"});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message, status: "ERROR" });
        }
    },
    
    // Crear un nuevo tipo de documento (create)
    create: async (req: Request, res: Response) => {
        const { nombre, fechaAlta } = req.body;
        try {
            const nuevoTipoDocumento = await prisma.tipoDocumento.create({
                data: { nombre, fechaAlta: (fechaAlta || new Date()) },
            });
            res.status(200).json({ msg: 'Se ha creado el tipo de documento.', data: nuevoTipoDocumento, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el tipo de documento', detail: error.message, status: "ERROR" });
        }
    },
    
    // Actualizar un tipo de documento (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, fechaBaja } = req.body;
        const payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const tipoDocumentoActualizado = await prisma.tipoDocumento.update({
                where: { idTipoDocumento: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el tipo de documento.', data: tipoDocumentoActualizado, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el tipo de documento', detail: error.message, status: "ERROR" });
        }
    },
    
    // Eliminar un tipo de documento (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            
            const documentosRelacionados = await prisma.documento.findMany({
                where: { idTipoDocumento: parseInt(id) },
            });

            if (documentosRelacionados.length > 0) {
                return res.status(400).json({ msg: 'No se puede eliminar el tipo de documento porque está relacionado con documentos existentes.', status: "ERROR" });
            }

            await prisma.tipoDocumento.delete({
                where: { idTipoDocumento: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el tipo de documento.', status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el tipo de documento', detail: error.message, status: "ERROR" });
        }
    },
}
