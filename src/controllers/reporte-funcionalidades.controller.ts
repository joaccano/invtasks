import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const ReporteFuncionalidadesController = {
    getFuncionalidades: async (req: Request, res: Response) => {
        const { fechaDesde, fechaHasta } = req.query; 

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ msg: "Debe proporcionar 'fechaDesde' y 'fechaHasta'" });
        }

        const fechaDesdeParsed = new Date(fechaDesde as string);
        const fechaHastaParsed = new Date(fechaHasta as string);

        if (isNaN(fechaDesdeParsed.getTime()) || isNaN(fechaHastaParsed.getTime())) {
            return res.status(400).json({ msg: "Las fechas proporcionadas no son válidas" });
        }

        try {
            const inventariosCount = await prisma.inventario.count({
                where: {
                    fechaCreacion:{
                        gte: fechaDesdeParsed,
                        lte: fechaHastaParsed,
                    }
                },
            });

            const registrosCount = await prisma.registro.count({
                where: {
                    fechaCreacion: {
                        gte: fechaDesdeParsed,
                        lte: fechaHastaParsed,
                    },
                },
            });

            const notificacionesCount = await prisma.notificacion.count({
                where: {
                    notificacionEstadoList: {
                        some: {
                            fechaDesde: {
                                gte: fechaDesdeParsed,
                                lte: fechaHastaParsed,
                            },
                        },
                    },
                },
            });

            const registrosConCategoria = await prisma.registro.count({
                where: {
                    idCategoria: {
                        gt: 0,
                    },
                    fechaCreacion: {
                        gte: fechaDesdeParsed,
                        lte: fechaHastaParsed,
                    },
                },
            });

            // Calcular totales y porcentajes
      const total = inventariosCount + registrosCount + notificacionesCount + registrosConCategoria;

      if (total === 0) {
        const chartData = {
          torta: {
            labels: ["No se encontró información"],
            datasets: [
              {
                label: "Uso de funcionalidades (%)",
                data: [1],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#F0F941"],
              },
            ],
          },
          barras: {
            labels: ["No se encontró información"],
            datasets: [
              {
                label: "Uso de funcionalidades",
                data: [0],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#F0F941"],
              },
            ],
          },
        };

        return res.status(200).json({ msg: "No se han encontrado resultados para los filtros ingresados.", data: chartData, status: "SUCCESSFUL" });
      }

      const inventariosPorcentaje = (inventariosCount / total) * 100;
      const registrosPorcentaje = (registrosCount / total) * 100;
      const notificacionesPorcentaje = (notificacionesCount / total) * 100;
      const categoriasPorcentaje = (registrosConCategoria / total) * 100;

      // Preparar datos para los gráficos
      const chartData = {
        torta: {
          labels: ["Notificaciones", "Inventarios", "Registros Médicos", "Categorías"],
          datasets: [
            {
              label: "Uso de funcionalidades (%)",
              data: [notificacionesPorcentaje, inventariosPorcentaje, registrosPorcentaje, categoriasPorcentaje],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#F0F941"],
            },
          ],
        },
        barras: {
          labels: ["Notificaciones", "Inventarios", "Registros Médicos", "Categorías"],
          datasets: [
            {
              label: "Uso de funcionalidades",
              data: [notificacionesCount, inventariosCount, registrosCount, registrosConCategoria],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#F0F941"],
            },
          ],
        },
      };

      return res.status(200).json({ msg: "Se han encontrado resultados", data: chartData, status: "SUCCESSFUL" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ msg: "Error al obtener los datos del reporte", detail: error.message, status: "ERROR" });
    }
  },
};
