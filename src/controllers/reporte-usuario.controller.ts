import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const ReporteUsuariosActivosController = {
    getUsuariosActivos: async (req: Request, res: Response) => {
        const { fechaDesde, fechaHasta } = req.query;

        // Validar que las fechas sean proporcionadas
        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ msg: "Debe proporcionar 'fechaDesde' y 'fechaHasta' como parámetros de consulta." });
        }

        // Parsear las fechas y validar
        const fechaInicio = new Date(fechaDesde as string);
        const fechaFin = new Date(fechaHasta as string);

        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
            return res.status(400).json({ msg: "Las fechas proporcionadas no son válidas." });
        }

        try {
            const reporteUsuariosActivos = await prisma.perfil.findMany({
                where: {
                    principal: true,
                    idCuenta: {
                        in: await prisma.perfil.findMany({
                            where: {
                                OR: [
                                    {
                                        registroList: { 
                                            some: { 
                                                fechaCreacion: { 
                                                    gte: fechaInicio, 
                                                    lte: fechaFin 
                                                } 
                                            } 
                                        }
                                    },
                                    {
                                        notificacionList: {
                                            some: {
                                                notificacionEstadoList: {
                                                    some: {
                                                        fechaDesde: {
                                                            gte: fechaInicio,
                                                            lte: fechaFin
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        inventarioList: { 
                                            some: {} // No filtras por fecha aquí, como indicado
                                        }
                                    }
                                ]
                            },
                            select: { idCuenta: true }
                        }).then(perfiles => perfiles.map(p => p.idCuenta))
                    }
                },
                select: {
                    nombre: true,
                    apellido: true,
                    dni: true,
                    email: true,
                    genero: true,
                }
            });

            if (reporteUsuariosActivos.length === 0) {
                return res.status(422).json({ msg: 'No se han encontrado registros con los filtros ingresados.' });
            } else {
                return res.status(200).json({ msg: 'Usuarios activos encontrados', data: reporteUsuariosActivos });
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener usuarios activos', detail: error.message });
        }
    },
};
