import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import fs from 'fs';
import { RegistroRepository } from "../repositories/registro.repository";
import { RegistroMedicamentoRepository } from "../repositories/registro-medicamento.repository";
import { DocumentoRepository } from "../repositories/documento.repository";

const prisma = new PrismaClient();
const registroRepository = new RegistroRepository();
const registroMedicamentoRepository = new RegistroMedicamentoRepository();
const documentoRepository = new DocumentoRepository();

export const RegistroController = {
    // Crear registro
    create: async (req: Request, res: Response) => {
        let { file, idPerfil, idCategoria, fechaReal, detalle, medicamentos, idMedico, idDocumento } = req.body;
        fechaReal = new Date(fechaReal);
        if (esVacio(detalle)) {
            return res.status(422).json({ msg: 'El detalle no puede estar vacío' });
        }
        let payload: any = {
            idPerfil: parseInt(idPerfil),
            detalle, fechaCreacion: new Date(),
            fechaModificacion: new Date(),
            fechaReal
        }
        payload['idCategoria'] = idCategoria ? parseInt(idCategoria) : null;
        payload['idMedico'] = idMedico ? parseInt(idMedico) : null;
        try {
            const newRegistro = await prisma.registro.create({
                data: payload
            });
            res.status(200).json({ msg: 'Registro creado correctamente', data: newRegistro });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el registro.', detail: error.message });
            console.log(error);
        }
        function esVacio(cadena: string) {
            return cadena.trim() === '';
        }
    },

    // Recuperar registros en base a filtros
    getAll: async (req: Request, res: Response) => {
        try {
            const registros = await registroRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Recuperar registro por id
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await registroRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Actualizar registro
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { file, idPerfil, idCategoria, fechaReal, detalle, medicamentos, idMedico, idDocumento } = req.body;

        if ( !detalle ) {
            return res.status(422).json({ msg: 'El detalle no puede estar vacío' });
        }

        const { indicaciones, dosis } = req.body;
        try {
            res.status(200).json({ msg: 'Se ha actualizado el registro.', data: await registroRepository.updateById(Number(id), { 
                idPerfil: idPerfil ? parseInt(idPerfil) : undefined,  // Solo actualiza si los valores existen
                idCategoria: idCategoria ? parseInt(idCategoria) : undefined,
                idMedico: idMedico ? parseInt(idMedico) : undefined,
                detalle: detalle,
                fechaModificacion: new Date(),
                fechaReal: fechaReal ? new Date(fechaReal) : undefined,
            }) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el registro.', detail: error.message });
        }
    },

    // Eliminar registro

    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            // Actualiza el registro principal
            const deleteRegistro = await prisma.registro.update({
                where: {
                    idRegistro: parseInt(id), // Debes pasar el ID del registro a actualizar
                },
                data: {
                    fechaBaja: new Date(),
                },
            });
            res.status(200).json({ msg: 'Registro eliminado correctamente' });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al eliminar el registro.', detail: error.message });
        }
    },

    // Se elimina el documento del registro (SoftDelete)
    deleteDoc: async (req: Request, res: Response) => {
        const { id_registro, id_documento } = req.params
        try {
            const documentoEliminado = await prisma.documento.update({
                where: {
                    idRegistro: parseInt(id_registro),
                    idDocumento: parseInt(id_documento),
                },
                data: {
                    fechaBaja: new Date()
                }
            });
            res.status(200).json({ msg: 'Se ha eliminado el registro' });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al eliminar el registro.', detail: error.message });
        }
    },

    getAllDoc: async (req: Request, res: Response) => {
        try {
            const documentos = await documentoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${documentos.length > 0 ? 'Se han encontrado documentos' : 'No se han encontrado documentos'}`, data: documentos});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los documentos', detail: error.message });
        }
    },

    // Recuperar registro por id
    getDoc: async (req: Request, res: Response) => {
        const { id_documento } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el documento del registro', data: await documentoRepository.findById(Number(id_documento), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el documento del registro', detail: error.message });
        }
    },

    // Se agrega un documento a un registro existente
    addDoc: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { idMedico, idTipoDocumento, nombre } = req.body;

        // Defino valores para propiedades de archivos 
        const bytes = Number(req.file?.size);
        const tamanioAux = bytes / 1048576;
        const mb = Number(tamanioAux.toFixed(3));

        try {
            if (req.file) {
                const documentoRegistro = await prisma.documento.create({
                    data: {
                        nombre: nombre || req.file.originalname,
                        tamanioMB: mb,
                        urlRepositorio: req.file?.path,
                        fechaCreado: new Date(),
                        idRegistro: parseInt(id),
                        idMedico: parseInt(idMedico),
                        idTipoDocumento: parseInt(idTipoDocumento)  // Pasar directamente idTipoDocumento
                    },
                });
                return res.status(200).json({ msg: 'Se adjunto el documento.', data: documentoRegistro });
            } else {
                return res.status(404).json({ msg: 'No existe un archivo a adjuntar.' });
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al adjuntar el documento.', detail: error.message });
        }
    },

    // Actualización de un documento del registro
    updateDoc: async (req: Request, res: Response) => {
        const { id_registro, id_documento } = req.params;
        const { idTipoDocumento, idMedico, nombre } = req.body;

        // Actualiza o crea el documento si se subió un archivo

        try {
            const documento = await prisma.documento.findUnique({
                where: { idDocumento: parseInt(id_documento) },
            });
            if (req.file && fs.existsSync(documento!.urlRepositorio)) {
                fs.unlinkSync(documento!.urlRepositorio); // Eliminar el archivo anterior
            }

            const documentoRegistro = await prisma.documento.update({
                where: { idDocumento: parseInt(id_documento) },
                data: {
                    nombre: nombre || documento?.nombre,
                    idTipoDocumento: parseInt(idTipoDocumento),
                    idRegistro: parseInt(id_registro),
                    idMedico: parseInt(idMedico)
                },
            })
            return res.status(200).json({ msg: 'Se actualizo el documento.', data: documentoRegistro });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el medicamento del registro', detail: error.message });
        }
    },

    // Recuperar registro por id
    getMed: async (req: Request, res: Response) => {
        const { id_registro_medicamento } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el medicamento del registro', data: await registroMedicamentoRepository.findById(Number(id_registro_medicamento), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el medicamento del registro', detail: error.message });
        }
    },

    // Añadir medicamentos al registro médico
    addMed: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { medicamentos } = req.body;

        if (medicamentos) {
            for (const med of medicamentos) {
                try {
                    const registroMedicamento = await prisma.registroMedicamento.create({
                        data: { idRegistro: parseInt(id), idMedicamento: parseInt(med.idMedicamento), dosis: parseInt(med.dosis), indicaciones: med.indicaciones, fechaDesde: new Date() }
                    });
                    res.status(200).json({ msg: 'Medicamentos agregados correctamente.', data: registroMedicamento });
                } catch (error: any) {
                    console.error(error);
                    res.status(500).json({ msg: 'Error al agregar medicamentos del registro.', detail: error.message });
                }
            };
        } else {
            const { dosis, idMedicamento, indicaciones } = req.body;
            try {
                const registroMedicamento = await prisma.registroMedicamento.create({
                    data: { idRegistro: parseInt(id), idMedicamento: parseInt(idMedicamento), dosis: parseInt(dosis), indicaciones: indicaciones, fechaDesde: new Date() }
                });
                res.status(200).json({ msg: 'Medicamento agregado a registro correctamente.', data: registroMedicamento });
            } catch (error: any) {
                console.error(error);
                res.status(500).json({ msg: 'Error al agregar medicamento al registro.', detail: error.message });
            }
        }
    },

    // Actualizar medicamentos del registro médico
    updateMed: async (req: Request, res: Response) => {
        const { id_registro, id_registro_medicamento } = req.params;
        const { medicamentos, idMedicamento } = req.body;

        // Actualiza o crea medicamentos relacionados
        if (medicamentos) {
            try {
                for (const med of medicamentos) {
                    const existingMed = await prisma.registroMedicamento.findFirst({
                        where: {
                            idRegistroMedicamento: parseInt(id_registro_medicamento),
                        },
                    });

                    if (existingMed) {
                        // Actualiza el medicamento si ya existe
                        const medActualizado = await prisma.registroMedicamento.update({
                            where: {
                                idRegistroMedicamento: existingMed.idRegistroMedicamento, // Usa la clave primaria
                            },
                            data: {
                                dosis: parseInt(med.dosis),
                                indicaciones: med.indicaciones,
                                fechaDesde: new Date(),
                            },
                        });
                    } else {
                        // Crea un nuevo medicamento si no existe
                        const medActualizado = await prisma.registroMedicamento.create({
                            data: {
                                idRegistro: parseInt(id_registro),
                                idMedicamento: parseInt(med.idMedicamento),
                                dosis: parseInt(med.dosis),
                                indicaciones: med.indicaciones,
                                fechaDesde: new Date(),
                            },
                        });
                    }
                }

                // Si todo va bien, envía una respuesta exitosa
                res.status(200).json({ msg: 'Medicamentos actualizados correctamente.' });
            } catch (error: any) {
                console.error(error);
                res.status(500).json({ msg: 'Error al actualizar medicamentos del registro.', detail: error.message });
            }
        } else if (idMedicamento) {
            const { indicaciones, dosis } = req.body;
            try {
                res.status(200).json({ msg: 'Se ha actualizado el medicamento del registro.', data: await registroMedicamentoRepository.updateById(Number(id_registro_medicamento), { indicaciones, dosis, idMedicamento }) });
            } catch (error: any) {
                res.status(500).json({ msg: 'Error al actualizar el medicamento del registro.', detail: error.message });
            }
        } else {
            res.status(400).json({ msg: 'No se proporcionaron medicamentos.' });
        }
    },

    // Eliminar medicamentos del registro médico
    deleteMed: async (req: Request, res: Response) => {
        const { id_registro, id_registro_medicamento } = req.params;

        try {
            const deleteRegistroMedicamento = await prisma.registroMedicamento.update({
                where: {
                    idRegistroMedicamento: parseInt(id_registro_medicamento),
                },
                data: {
                    fechaHasta: new Date(),
                }
            });
            return res.status(200).json({ msg: 'Se elimino el medicamento del registro.', data: deleteRegistroMedicamento });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al eliminar el medicamento del registro.', detail: error.message });
        }
    }
}