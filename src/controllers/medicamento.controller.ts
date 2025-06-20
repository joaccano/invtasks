import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { MedicamentoRepository } from "../repositories/medicamento.repository";
import { UnidadMedicamentoRepository } from "../repositories/unidad-medicamento.repository";

const csv = require('csvtojson');
const xlsx = require('xlsx');
const fs = require('fs');
const { Parser } = require('json2csv');
const path = require('path');
const EXPECTED_HEADERS = ['indicaciones', 'contraindicaciones', 'nombreFarmaco', 'nombreGenerico', 'idUnidadMedicamento'];
const prisma = new PrismaClient();
const medicamentoRepository = new MedicamentoRepository();
const unidadMedicamentRepository = new UnidadMedicamentoRepository();

export const MedicamentoController = {
    getAll: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if (!url.includes('?')) url = `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const limit = parseInt(params.get('take') || '0');
            const page = parseInt(params.get('page') || '1');
            params.delete('page');
            const skip = (page - 1) * limit;
            params.set('skip', skip.toString());
            const registros = await medicamentoRepository.findMany("?" + decodeURIComponent(params.toString()));
            const links = await medicamentoRepository.getPaginate(params, limit, page, "/medicines");
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros, links, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message, status: "ERROR" });
        }
    },

    getByName: async (req: Request, res: Response) => {
        const { nombre } = req.query;
        console.log(nombre);
        try {
            const estadoMedicamento = await prisma.estadoMedicamento.findMany({
                where: {
                    nombre: 'Activo',
                },
            });
            const medicamentos = await prisma.medicamento.findMany({
                where: {
                    nombreFarmaco: {
                        contains: String(nombre),
                    },
                    medicamentoEstadoList: {
                        some: {
                            estadoMedicamento: {
                                idEstadoMedicamento: estadoMedicamento[0].idEstadoMedicamento, // Valida que el estado sea "Activo"
                            },
                        },
                    },
                },
                take: 10,
            });
            if (medicamentos) {
                return res.status(200).json({ msg: 'Se han encontrado medicamentos', medicamentos: medicamentos })
            } else {
                return res.status(200).json({ msg: 'No han encontrado medicamentos', medicamentos: medicamentos })
            }
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener medicamentos', detail: error.message });
        }
    },

    // Obtener un medicamento por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await medicamentoRepository.findById(Number(id), decodeURIComponent(req.url)), status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message, status: "ERROR" });
        }
    },
    getAllUnits: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if (!url.includes('?')) url = `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const skip = 0;
            params.set('skip', skip.toString());
            const roles = await unidadMedicamentRepository.findMany("?" + decodeURIComponent(params.toString()));

            res.status(200).json({ msg: `${roles.length > 0 ? 'Se han encontrado unidades' : 'No se han encontrado unidades'}`, data: roles });
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener los unidades' });
        }
    },
    // Importar csv.
    // Crear un nuevo medicamento (create)
    create: async (req: Request, res: Response) => {
        const { indicaciones, contraindicaciones, nombreFarmaco, nombreGenerico, idUnidadMedicamento } = req.body;

        try {
            // Verifica si ya existe un medicamento con el mismo nombreFarmaco, nombreGenerico e idUnidadMedicamento
            const medicamentoExistente = await prisma.medicamento.findFirst({
                where: {
                    AND: [
                        { nombreFarmaco: { equals: nombreFarmaco.toLowerCase() } },
                        { nombreGenerico: { equals: nombreGenerico.toLowerCase() } },
                        { idUnidadMedicamento: parseInt(idUnidadMedicamento) }
                    ]
                }
            });

            if (medicamentoExistente) {
                return res.status(409).json({
                    msg: "Ya existe un medicamento con el mismo nombre farmacológico, nombre genérico y unidad de medicamento.",
                    status: "ERROR"
                });
            }

            // Busca el estado por defecto para el medicamento
            const estadoMedicamentoDefault = await prisma.estadoMedicamento.findMany({
                where: {
                    nombre: {
                        contains: "creado", // Busca que el nombre contenga el string "creado"
                    },
                },
            });

            if (!estadoMedicamentoDefault || estadoMedicamentoDefault.length == 0) {
                return res.status(404).json({
                    msg: "Estado de medicamento no encontrado",
                    status: "ERROR"
                });
            }

            // Crea el nuevo medicamento
            const nuevoMedicamento = await prisma.medicamento.create({
                data: {
                    indicaciones,
                    contraindicaciones,
                    nombreFarmaco: nombreFarmaco.toLowerCase(), // Convertir a minúsculas
                    nombreGenerico: nombreGenerico.toLowerCase(), // Convertir a minúsculas
                    idUnidadMedicamento: parseInt(idUnidadMedicamento)
                },
                include: {
                    unidadMedicamento: true
                },
            });

            if (!nuevoMedicamento) {
                return res.status(404).json({
                    msg: "Problemas al crear medicamento",
                    status: "ERROR"
                });
            }

            // Asocia el medicamento con un estado inicial
            await prisma.medicamentoEstado.create({
                data: {
                    idEstadoMedicamento: estadoMedicamentoDefault[0].idEstadoMedicamento,
                    idMedicamento: nuevoMedicamento.idMedicamento,
                    fechaDesde: new Date(),
                },
            });

            res.status(201).json({
                msg: 'Se ha creado el medicamento.',
                data: nuevoMedicamento,
                status: "SUCCESSFULL"
            });
        } catch (error: any) {
            res.status(500).json({
                msg: 'Error al crear el medicamento',
                detail: error.message,
                status: "ERROR"
            });
        }
    },

    // Actualizar un medicamento (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { indicaciones, contraindicaciones, nombreFarmaco, nombreGenerico, fechaBaja, idUnidadMedicamento, idPerfil } = req.body;
        const payload: any = { indicaciones, contraindicaciones, nombreFarmaco, nombreGenerico };
        if (idPerfil) payload['idPerfil'] = idPerfil;
        if (idUnidadMedicamento) payload['idUnidadMedicamento'] = parseInt(idUnidadMedicamento);
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const medicamentoActualizado = await prisma.medicamento.update({
                where: { idMedicamento: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el medicamento.', data: medicamentoActualizado, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el medicamento', detail: error.message, status: "ERROR" });
        }
    },

    // Eliminar un medicamento (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {

            const inventarioRelacionado = await prisma.inventario.findFirst({
                where: { idMedicamento: parseInt(id) },
            });

            if (inventarioRelacionado) {
                return res.status(409).json({
                    msg: 'No se puede eliminar el medicamento porque está relacionado con inventario.',
                    status: "ERROR"
                });
            }

            const registroRelacionado = await prisma.registroMedicamento.findFirst({
                where: { idMedicamento: parseInt(id) },
            });

            if (registroRelacionado) {
                return res.status(409).json({
                    msg: 'No se puede eliminar el medicamento porque está relacionado con un registro de medicamento.',
                    status: "ERROR"
                });
            }

            const configuracionNotificacionRelacionado = await prisma.configuracionNotificacion.findFirst({
                where: { idMedicamento: parseInt(id) },
            });

            if (configuracionNotificacionRelacionado) {
                return res.status(409).json({
                    msg: 'No se puede eliminar el medicamento porque está relacionado con una configuración de notificación.',
                    status: "ERROR"
                });
            }
            await prisma.medicamento.delete({
                where: { idMedicamento: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el medicamento.', status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el medicamento', detail: error.message, status: "ERROR" });
        }
    },

    // Obtener los medicamentos de un estado específico.
    getByStatus: async (req: Request, res: Response) => {
        const { nombreEstado } = req.params;  // Recibe el nombre del estado a través de los parámetros de la solicitud
        // Validación: Verifica que el parámetro sea un string y no esté vacío o con solo espacios
        try {
            // Paso 1: Buscar el ID del estado que coincide con el nombre proporcionado
            const estado = await prisma.estadoMedicamento.findFirst({
                where: {
                    nombre: nombreEstado,  // Filtra por el nombre del estado recibido por parámetro
                },
                select: {
                    idEstadoMedicamento: true,  // Solo selecciona el ID del estado, ya que es lo que necesitamos
                },
            });
            console.log("Estado encontrado:", estado);  // Agrega esta línea para ver qué está devolviendo el `findFirst`
            // Si no encuentra el estado, retorna un error 404 indicando que no se encontró
            if (!estado) {
                console.log("Estado no encontrado, retornando error 404");  // Depuración adicional
                return res.status(404).json({ error: `Estado "${nombreEstado}" no encontrado` });
            }
            // Paso 2: Buscar los medicamentos que tienen el estado especificado
            const medicamentos = await prisma.medicamento.findMany({
                where: {
                    // En la lista de estado de medicamento, busca aquellos que tengan el ID del estado encontrado
                    medicamentoEstadoList: {
                        some: {
                            idEstadoMedicamento: estado.idEstadoMedicamento,  // Coincide con el ID del estado encontrado
                            fechaHasta: null,  // Asegura que el estado esté activo, es decir, que no tenga una fecha de finalización
                        },
                    },
                },
                // Incluir relaciones para obtener detalles adicionales de las otras tablas relacionadas
                include: {
                    unidadMedicamento: true,  // Incluye la relación con la unidad de medicamento
                    medicamentoEstadoList: {
                        include: {
                            estadoMedicamento: true,  // Incluye los detalles del estado del medicamento
                        },
                    },
                },
            });
            // Si no encuentra medicamentos con ese estado, retorna un error 404
            if (medicamentos.length === 0) {
                console.log("No se encontraron medicamentos con ese estado");  // Depuración adicional
                return res.status(404).json({ error: `No se encontraron medicamentos con el estado "${nombreEstado}"` });
            }
            // Si encuentra medicamentos, los devuelve en la respuesta
            res.status(200).json({ data: medicamentos });
        } catch (error: any) {
            // En caso de un error, retorna un error 500 con un mensaje genérico
            console.error("Error en la ejecución", error);  // Depuración adicional
            res.status(500).json({ msg: 'Error al obtener los medicamentos', detail: error.message });
        }
    },
    // Obtener todos los medicamentos que coincidan con un nombre genérico (getByName)
    getByNombreGenerico: async (req: Request, res: Response) => {
        // Extraer el parámetro 'nombreGenerico' de los parámetros de la solicitud
        const { nombreGenerico } = req.params;
        try {
            // Paso 1: Encontrar el ID del estado "Activo"
            const estadoActivo = await prisma.estadoMedicamento.findFirst({
                where: {
                    nombre: "Activo" // Buscar el estado con el nombre "Activo"
                },
                select: {
                    idEstadoMedicamento: true // Seleccionar solo el ID del estado
                }
            });
            // Si no se encuentra el estado "Activo", devolver un error 404
            if (!estadoActivo) {
                return res.status(404).json({ msg: 'Estado "Activo" no encontrado' });
            }
            // Paso 2: Buscar medicamentos que coincidan con el nombre genérico y tengan el estado "Activo"
            const medicamentos = await prisma.medicamento.findMany({
                where: {
                    nombreGenerico: {
                        contains: nombreGenerico, // Filtrar medicamentos cuyo nombre genérico contenga la cadena proporcionada
                    },
                    medicamentoEstadoList: {
                        some: {
                            idEstadoMedicamento: estadoActivo.idEstadoMedicamento, // Filtrar por estado "Activo"
                            fechaHasta: null, // Asegurarse de que es el estado actual (fechaHasta es null)
                        },
                    },
                },
                include: {
                    unidadMedicamento: true, // Incluir información de la relación 'unidadMedicamento'
                    medicamentoEstadoList: {
                        include: {
                            estadoMedicamento: true, // Incluir detalles del estado del medicamento asociado
                        },
                    },
                },
            });
            // Si no se encuentran medicamentos, devolver un error 404
            if (medicamentos.length === 0) return res.status(404).json({ msg: 'No se encontraron medicamentos activos con nombre genérico: ' + nombreGenerico });
            // Devolver los medicamentos encontrados en la respuesta
            res.status(200).json({ data: medicamentos });
        } catch (error: any) {
            // Manejar errores y devolver un error 500 en caso de fallo
            res.status(500).json({ msg: 'Error al obtener los medicamentos', detail: error.message });
        }
    },
    // Obtener todos los medicamentos que coincidan con un nombre de fármaco (getByNombreFarmaco)
    getByNombreFarmaco: async (req: Request, res: Response) => {
        const { nombreFarmaco } = req.params;  // Recibe el nombre del fármaco a través de los parámetros de la solicitud
        try {
            // Paso 1: Buscar el ID del estado "Activo" en la base de datos
            const estadoActivo = await prisma.estadoMedicamento.findFirst({
                where: {
                    nombre: "Activo",  // Busca el estado cuyo nombre sea "Activo"
                },
                select: {
                    idEstadoMedicamento: true,  // Solo selecciona el ID del estado, ya que es lo que se necesita para la búsqueda
                },
            });
            // Si no se encuentra el estado "Activo", retorna un error 404
            if (!estadoActivo) {
                return res.status(404).json({ msg: 'Estado "Activo" no encontrado' });
            }
            // Paso 2: Buscar los medicamentos que coincidan con el nombreFarmaco y tengan estado "Activo"
            const medicamentos = await prisma.medicamento.findMany({
                where: {
                    nombreFarmaco: {
                        contains: nombreFarmaco,  // Filtra por el nombre del fármaco que contenga la cadena recibida
                    },
                    // Verificar que el medicamento esté en estado "Activo"
                    medicamentoEstadoList: {
                        some: {
                            idEstadoMedicamento: estadoActivo.idEstadoMedicamento,  // Coincide con el ID del estado "Activo"
                            fechaHasta: null,  // Asegura que el estado esté activo (fechaHasta es null)
                        },
                    },
                },
                // Incluir relaciones para obtener detalles adicionales
                include: {
                    unidadMedicamento: true,  // Incluye la relación con la unidad de medicamento
                    medicamentoEstadoList: {
                        include: {
                            estadoMedicamento: true,  // Incluye los detalles del estado del medicamento
                        },
                    },
                },
            });
            // Si no se encuentran medicamentos, retorna un error 404
            if (medicamentos.length === 0) return res.status(404).json({ msg: 'No se encontraron medicamentos activos con nombre fármaco: ' + nombreFarmaco });
            // Si encuentra medicamentos, los devuelve en la respuesta
            res.status(200).json({ data: medicamentos });
        } catch (error: any) {
            // En caso de un error, retorna un error 500 con un mensaje genérico
            res.status(500).json({ msg: 'Error al obtener los medicamentos', detail: error.message });
        }
    },



    uploadRegisters: async (req: Request, res: Response) => {
        const file = req.file;
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        if (!file) {
            return res.status(400).json({ msg: 'No se ha proporcionado un archivo', status: "ERROR" });
        }

        try {
            const filePath = file.path;
            const fileExtension = file?.path.split('.').pop() ?? '';
            let data = [];

            if (fileExtension === 'csv') {
                data = await csv().fromFile(filePath);
            } else if (['xlsx', 'xls'].includes(fileExtension)) {
                const workbook = xlsx.readFile(filePath);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                data = xlsx.utils.sheet_to_json(sheet);
            } else {
                return res.status(400).json({ msg: 'Formato de archivo no soportado', status: "ERROR" });
            }
            if (!data.length) {
                return res.status(400).json({ msg: 'El archivo está vacío', status: "ERROR" });
            }

            // Validar la cabecera
            const fileHeaders = Object.keys(data[0]);
            const missingHeaders = EXPECTED_HEADERS.filter(header => !fileHeaders.includes(header));

            if (missingHeaders.length > 0) {
                return res.status(400).json({
                    msg: `Cabecera incorrecta. Faltan columnas: ${missingHeaders.join(', ')}`,
                    status: "ERROR"
                });
            }

            const estadoMedicamentoDefault = await prisma.estadoMedicamento.findMany({
                where: { nombre: { contains: "creado" } }
            });
            if (!estadoMedicamentoDefault.length) {
                return res.status(404).json({ msg: "Estado de medicamento no encontrado" });
            }

            let createdMedicamentos = [];
            let duplicatedMedicamentos = [];
            let failedMedicamentos = [];

            for (const record of data) {
                const { indicaciones, contraindicaciones, nombreFarmaco, nombreGenerico, idUnidadMedicamento } = record;
                const unidadMedidaId = parseInt(idUnidadMedicamento);

                const values = Object.values(record);

                // Validar que la fila tenga el número correcto de columnas
                if (values.length !== EXPECTED_HEADERS.length) {
                    failedMedicamentos.push({ ...record, error: 'Numero incorrecto de columnas' });
                    continue;
                }

                if (isNaN(unidadMedidaId)) {
                    failedMedicamentos.push({ ...record, error: 'ID de unidad de medida inválido' });
                    continue;
                }

                // Verificar si la unidad de medida existe en la base de datos
                const unidadMedida = await prisma.unidadMedicamento.findUnique({
                    where: { idUnidadMedicamento: unidadMedidaId }
                });

                if (!unidadMedida) {
                    failedMedicamentos.push({ ...record, error: 'Unidad de medida no encontrada en la base de datos' });
                    continue;
                }

                const existingMedicamento = await prisma.medicamento.findFirst({
                    where: {
                        AND: [
                            { nombreFarmaco: { equals: nombreFarmaco.toLowerCase() } },
                            { nombreGenerico: { equals: nombreGenerico.toLowerCase() } },
                            { idUnidadMedicamento: unidadMedidaId }
                        ]
                    }
                });

                if (existingMedicamento) {
                    duplicatedMedicamentos.push({ ...record, error: 'El medicamento ya existe' });
                    continue;
                }

                try {
                    const nuevoMedicamento = await prisma.medicamento.create({
                        data: {             indicaciones, 
                            contraindicaciones, 
                            nombreFarmaco: nombreFarmaco.toLowerCase(), // Convertir a minúsculas
                            nombreGenerico: nombreGenerico.toLowerCase(), // Convertir a minúsculas
                            idUnidadMedicamento: unidadMedidaId },
                        include: { unidadMedicamento: true }
                    });
                    await prisma.medicamentoEstado.create({
                        data: {
                            idEstadoMedicamento: estadoMedicamentoDefault[0].idEstadoMedicamento,
                            idMedicamento: nuevoMedicamento.idMedicamento,
                            fechaDesde: new Date()
                        }
                    });
                    createdMedicamentos.push(nuevoMedicamento);
                } catch (error: any) {
                    console.log(error)
                    failedMedicamentos.push({ ...record, error: error.message || 'Error desconocido al crear el medicamento' });
                }
            }

            const duplicatedCsvPath = path.join(__dirname, '../../uploads/imports/duplicados.csv');
            const failedCsvPath = path.join(__dirname, '../../uploads/imports/fallidos.csv');

            if (duplicatedMedicamentos.length) {
                const duplicatedCsv = new Parser().parse(duplicatedMedicamentos);
                fs.writeFileSync(duplicatedCsvPath, duplicatedCsv);
            }

            if (failedMedicamentos.length) {
                const failedCsv = new Parser().parse(failedMedicamentos);
                fs.writeFileSync(failedCsvPath, failedCsv);
            }

            res.status(201).json({
                msg: 'Proceso completado.',
                data: createdMedicamentos,
                duplicatedFile: duplicatedMedicamentos.length ? '/uploads/duplicados.csv' : null,
                failedFile: failedMedicamentos.length ? '/uploads/fallidos.csv' : null,
                status: "SUCCESSFULL"
            });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al procesar el archivo', detail: error.message, status: "ERROR" });
        }
    }

}
