import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const ReporteMedicamentosController = {

    getAll: async (req: Request, res: Response) => {
        const { fechaDesde, fechaHasta } = req.query;

        // Validar fechas recibidas
        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ msg: "Debe proporcionar 'fechaDesde' y 'fechaHasta'" });
        }

        const fechaDesdeParsed = new Date(fechaDesde as string);
        const fechaHastaParsed = new Date(fechaHasta as string);

        // Validar si las fechas son válidas
        if (isNaN(fechaDesdeParsed.getTime()) || isNaN(fechaHastaParsed.getTime())) {
            return res.status(400).json({ msg: "Las fechas proporcionadas no son válidas" });
        }

        try {
            const reporteMedicamentos = await prisma.medicamento.findMany({
                where: {
                    medicamentoEstadoList: {
                        some: {
                            estadoMedicamento: {
                                fechaAlta: {
                                    gte: fechaDesdeParsed,
                                    lte: fechaHastaParsed,
                                }
                            }
                        }
                    }
                },
                select: {
                    nombreFarmaco: true,
                    indicaciones: true,
                    unidadMedicamento: {
                        select: {
                            cantidadDeDosis: true,
                        }
                    },
                    medicamentoEstadoList: {
                        orderBy: {
                            fechaDesde: 'asc',
                        },
                        take: 1,
                        select: {
                            estadoMedicamento: {
                                select: {
                                    fechaAlta: true,
                                }
                            }
                        },
                    },
                }
            });

            if (reporteMedicamentos.length === 0) {
                return res.status(422).json({ msg: 'No se han encontrado resultados para los filtros ingresados.' });
            } else {
                const medicamentos = reporteMedicamentos.map(medicamento => ({
                    nombreFarmaco: medicamento.nombreFarmaco,
                    cantidadDeDosis: medicamento.unidadMedicamento.cantidadDeDosis,
                    fechaAlta: medicamento.medicamentoEstadoList[0]?.estadoMedicamento?.fechaAlta,
                    indicaciones: medicamento.indicaciones
                }));

                return res.status(200).json({ msg: 'Se han encontrado registros', data: medicamentos });
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: 'Error al obtener los medicamentos', detail: error.message });
        }
    }
};
