import { Request, Response } from "express";
import { DocumentoRepository } from "../repositories/documento.repository";

const documentoRepository = new DocumentoRepository();

export const DocumentoController = {
    // Recuperar registros en base a filtros
    getAll: async (req: Request, res: Response) => {
        try {
            const documentos = await documentoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${documentos.length > 0 ? 'Se han encontrado documentos' : 'No se han encontrado documentos'}`, data: documentos});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las documentos', detail: error.message });
        }
    },
}