import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const ReporteProgresoMedicamentosController = {
    getProgressMed: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { fechaDesde, fechaHasta } = req.query; 

        const fechaDesdeParsed = fechaDesde ? new Date(fechaDesde as string) : null;
        const fechaHastaParsed = fechaHasta ? new Date(fechaHasta as string) : null;

        try {
            let payload: any =  {
                where: { 
                    idPerfil: parseInt(id),
                },
                include: {
                    medicamento: true,
                },
                orderBy: {
                    stock: 'asc' // Ordenamos por stock más bajo primero
                }
            };

            if (fechaDesde || fechaHasta) {
                let fechaCreacionObjeto: any = {};
                if (fechaDesdeParsed) fechaCreacionObjeto['gte'] = fechaDesdeParsed;
                if (fechaHastaParsed) fechaCreacionObjeto['lte'] = fechaHastaParsed;
                payload.where['fechaCreacion'] = fechaCreacionObjeto;
            }

            const inventarios: any = await prisma.inventario.findMany(payload);

            if (!inventarios || inventarios.length === 0) {
                return res.status(404).json({ msg: 'No se han encontrado resultados para los filtros ingresados.' });
            }

            const labels = inventarios.map((inventario: any) => inventario.medicamento.nombreFarmaco);

            const dataValues = inventarios.map((inventario: any) => {
                let proximidadAgotamiento = 0;

                if (inventario.stock > inventario.cantidadMinima) {
                    proximidadAgotamiento = ((1 - (inventario.stock - inventario.cantidadMinima) / inventario.stock) * 100);
                } else {
                    proximidadAgotamiento = 100;
                }

                return Math.min(Math.max(Math.round(proximidadAgotamiento), 0), 100);
            });

            const backgroundColors = dataValues.map((percentage: number) => {
                if (percentage >= 80) {
                    return 'rgba(255, 99, 132, 0.5)'; // Rojo (Crítico)
                } else if (percentage >= 50) {
                    return 'rgba(255, 159, 64, 0.5)'; // Amarillo (Advertencia)
                } else {
                    return 'rgba(75, 192, 192, 0.5)'; // Verde (Seguro)
                }
            });

            // 🔥 NUEVO: Agregamos Stock Actual, Cantidad Mínima y Estado 🔥
            const estados = dataValues.map((percentage: number) => {
                if (percentage >= 80) {
                    return "Crítico"; // Rojo
                } else if (percentage >= 50) {
                    return "Advertencia"; // Amarillo
                } else {
                    return "Seguro"; // Verde
                }
            });

            const stockActual = inventarios.map((inventario: any) => inventario.stock);
            const cantidadMinima = inventarios.map((inventario: any) => inventario.cantidadMinima);

            const datasets = [
                {
                    label: 'Proximidad de Agotamiento',
                    data: dataValues,
                    borderColor: 'rgba(255, 99, 132, 1)', 
                    backgroundColor: backgroundColors,
                }
            ];

            res.status(200).json({
                msg: 'Se han encontrado resultados',
                data: { 
                    labels,
                    datasets,
                    stockActual,  // 🔹 Nuevo campo Stock Actual
                    cantidadMinima, // 🔹 Nuevo campo Cantidad Mínima
                    estados // 🔹 Nuevo campo Estado
                },
            });

        } catch (error) {
            console.error("Error al obtener los datos:", error);
            res.status(500).json({ msg: 'Hubo un error al obtener los resultados.' });
        }
    },
};
