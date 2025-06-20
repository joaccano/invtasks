import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const ReporteMedicosMasVisitadosController = {
    getRanking: async (req: Request, res: Response) => {
        const { id } = req.params; // ID del usuario para el filtro de registros
        const { fechaDesde, fechaHasta, idEspecialidad } = req.query; // Fechas y especialidad para el filtro

        try {
            const idUsuarioInt = parseInt(id);
            const fechaInicio = fechaDesde ? new Date(fechaDesde as string) : new Date('2023-01-01');
            const fechaFin = fechaHasta ? new Date(fechaHasta as string) : new Date();

            if (fechaInicio && isNaN(fechaInicio.getTime())) {
                return res.status(400).json({ msg: 'La fechaDesde no es válida.' });
            }
            if (fechaFin && isNaN(fechaFin.getTime())) {
                return res.status(400).json({ msg: 'La fechaHasta no es válida.' });
            }

            // Obtener los perfiles asociados al usuario
            const perfiles = await prisma.perfil.findMany({
                where: {
                    cuenta: {
                        idUsuario: idUsuarioInt
                    }
                },
            });

            const perfilIds = perfiles.map((perfil) => perfil.idPerfil);

            // Obtener los médicos más visitados con filtro por especialidad
            const medicosVisitados = await prisma.registro.groupBy({
                by: ['idMedico'],
                where: {
                    idPerfil: {
                        in: perfilIds,
                    },
                    idMedico: {
                        not: null,
                    },
                    fechaReal: {
                        gte: fechaInicio || undefined,
                        lte: fechaFin || undefined,
                    },
                },
                _count: {
                    idRegistro: true,
                },
                orderBy: {
                    _count: {
                        idRegistro: 'desc',
                    },
                },
                take: 5,
            });

            // Obtener detalles de los médicos y filtrar por especialidad si se especifica
            const medicosDetalles = await prisma.medico.findMany({
                where: {
                    idMedico: {
                        in: medicosVisitados.map((medico) => medico.idMedico).filter((id) => id !== null),
                    },
                    ...(idEspecialidad
                        ? {
                              idEspecialidad: parseInt(idEspecialidad as string),
                          }
                        : {}),
                },
                include: {
                    especialidad: true, // Asegúrate de que esta relación exista si necesitas mostrarla
                },
            });
            
            // Verificar si se encontraron medicamentos
            if (medicosDetalles.length === 0) {
                return res.status(404).json({ msg: "No se han encontrado registros para los filtros ingresados." });
            }

            // Estructuración de los datos para Chart.js
            const labels = medicosVisitados
                .filter((medicoVisitado) =>
                    medicosDetalles.some((m) => m.idMedico === medicoVisitado.idMedico)
                )
                .map((medicoVisitado) => {
                    const medico = medicosDetalles.find(
                        (m) => m.idMedico === medicoVisitado.idMedico
                    );
                    return `${medico?.nombre} ${medico?.apellido}`; // Nombres de los médicos
                });

            const data = medicosVisitados
                .filter((medicoVisitado) =>
                    medicosDetalles.some((m) => m.idMedico === medicoVisitado.idMedico)
                )
                .map((medicoVisitado) => medicoVisitado._count.idRegistro); // Cantidad de visitas

            // Respuesta adaptada para Chart.js
            const chartData = {
                labels: labels, // Nombres de los médicos
                datasets: [
                    {
                        label: '', // Este es el atributo correcto reconocido por Chart.js
                        data: data, // Datos de visitas
                        borderColor: 'rgba(103, 173, 186, 1)', // Color del borde de las barras
                        backgroundColor: 'rgba(103, 173, 186, 0.2)', // Color de fondo de las barras
                        borderWidth: 1, // Grosor del borde
                    },
                ],
            };

            return res.status(200).json({
                msg: 'Ranking de médicos más visitados',
                data: chartData, // Enviar los datos en formato adecuado para Chart.js
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: 'Error al generar el reporte de médicos más visitados' });
        }
    },
};
