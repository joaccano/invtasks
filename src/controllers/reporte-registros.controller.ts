import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const ReporteRegistrosController = {
    getAll: async (req: Request, res: Response) => {
     
        const { fechaDesde, fechaHasta, categoria, perfilId, medicoId } = req.query;
        console.log('fechaDesde', fechaDesde);
        console.log('fechaHasta', fechaHasta);
        // Asegúrate de convertir los valores de las fechas a Date
        const fechaDesdeDate = new Date(fechaDesde as string);
        const fechaHastaDate = new Date(fechaHasta as string);

        /*if (isNaN(fechaDesdeDate.getTime()) || isNaN(fechaHastaDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }*/
        
        try {
            // Consulta de registros por mes
            const registrosPorMes = await prisma.registro.groupBy({
                by: ['fechaCreacion'],
                _count: {
                    idRegistro: true,
                },
                where: {
                    ...(fechaDesdeDate && fechaHastaDate && { 
                        fechaCreacion: {
                            gte: fechaDesdeDate,
                            lte: fechaHastaDate,
                        },
                    }),
                    ...(categoria && { idCategoria: Number(categoria) }),
                    ...(perfilId && { idPerfil: Number(perfilId) }),
                    ...(medicoId && { idMedico: Number(medicoId) }),
                },
                orderBy: {
                    fechaCreacion: 'asc',
                },
            });
            

            const registrosPorMesData = {
                labels: registrosPorMes.map(r => r.fechaCreacion.toLocaleString('default', { month: 'long' })),
                data: registrosPorMes.map(r => r._count.idRegistro),
            };

            // Consulta de registros por categoría
            const registrosPorCategoria = await prisma.registro.groupBy({
                by: ['idCategoria'],
                _count: {
                    idRegistro: true,
                },
                where: {
                    fechaCreacion: {
                        gte: fechaDesdeDate,
                        lte: fechaHastaDate,
                    },
                    ...(perfilId && { idPerfil: Number(perfilId) }),
                    ...(medicoId && { idMedico: Number(medicoId) }),
                },
            });

            // Obtener nombres de categorías
            const categoriaIds = registrosPorCategoria.map(r => r.idCategoria);
            const categorias = await prisma.categoria.findMany({
                where: {
                    idCategoria: {
                        in: categoriaIds as number[],
                    },
                },
            });

            const registrosPorCategoriaData = {
                labels: categorias.map(c => c.nombre),
                data: registrosPorCategoria.map(r => r._count.idRegistro),
            };

            // Consulta de registros por médico
            const registrosPorMedico = await prisma.registro.groupBy({
                by: ['idMedico'],
                _count: {
                    idRegistro: true,
                },
                where: {
                    fechaCreacion: {
                        gte: fechaDesdeDate,
                        lte: fechaHastaDate,
                    },
                    ...(perfilId && { idPerfil: Number(perfilId) }),
                },
            });

            // Obtener nombres de médicos
            const medicoIds = registrosPorMedico.map(r => r.idMedico);
            const medicos = await prisma.medico.findMany({
                where: {
                    idMedico: {
                        in: medicoIds as number[],
                    },
                },
            });

            const registrosPorMedicoData = {
                labels: medicos.map(m => m.nombre),
                data: registrosPorMedico.map(r => r._count.idRegistro),
            };

            // Respuesta final
            const responseData = {
                registrosPorMes: registrosPorMesData,
                registrosPorCategoria: registrosPorCategoriaData,
                registrosPorMedico: registrosPorMedicoData,
            };
            return res.status(200).json({ msg: 'Se han encontrado registros', data: responseData })
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ msg: 'Error fetching report data', detail: error.message });
        }
    },
};
