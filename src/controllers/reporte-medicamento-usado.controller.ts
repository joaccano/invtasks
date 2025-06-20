import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const ReporteMedicamentosUsadosController = {
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { fechaDesde, fechaHasta } = req.query;
        const idUsuarioInt = parseInt(id);

        try {
            // Validar y convertir parámetros
            const fechaInicio = fechaDesde ? new Date(fechaDesde as string) : new Date('2023-01-01');
            const fechaFin = fechaHasta ? new Date(fechaHasta as string) : new Date();
            let perfilIds: number[] | undefined;

            if (idUsuarioInt && idUsuarioInt !== 0) {
                // Buscar perfiles asociados al idCuenta
                const perfiles = await prisma.perfil.findMany({
                    where: {
                        cuenta: {
                            idUsuario: idUsuarioInt
                        }
                    },
                });

                perfilIds = perfiles.map((perfil) => perfil.idPerfil);

                // Verificar si no hay perfiles asociados
                if (perfilIds.length === 0) {
                    return res.status(404).json({ msg: "No se encontraron perfiles asociados al usuario" });
                }
            }

            // Validar que perfilIds esté definido y no vacío
            if (!perfilIds || perfilIds.length === 0) {
                return res.status(400).json({ msg: "Debe especificar un usuario con perfiles válidos" });
            }
            // Obtener medicamentos de inventario filtrados por perfil y fecha
            const inventarioMedicamentos = await prisma.medicamento.findMany({
                where: {
                    inventarioList: {
                        some: {
                            idPerfil: { in: perfilIds },
                            fechaCreacion: {
                                gte: fechaInicio,
                                lte: fechaFin,
                            },
                        },
                    },
                },
                include: {
                    inventarioList: {
                        where: {
                            idPerfil: { in: perfilIds },
                            fechaCreacion: {
                                gte: fechaInicio,
                                lte: fechaFin,
                            },
                        },  // Se aplica solo si el where tiene coincidencias
                    },
                },
            });

            // Obtener medicamentos de registroMedicamentoList filtrados por perfil y fecha
            const registroMedicamentos = await prisma.medicamento.findMany({
                where: {
                    registroMedicamentoList: {
                        some: {
                            registro: {
                                idPerfil: { in: perfilIds },
                            },
                            fechaDesde: { gte: fechaInicio },
                            OR: [
                                { fechaHasta: null },
                                { fechaHasta: { lte: fechaFin } },
                            ],
                        },
                    },
                },
                include: {
                    registroMedicamentoList: true,
                },
            });

            // Obtener medicamentos de configuracionNotificacionList filtrados por perfil y fecha
            const configuracionMedicamentos = await prisma.medicamento.findMany({
                where: {
                    configuracionNotificacionList: {
                        some: {
                            notificacion: {
                                idPerfil: { in: perfilIds },
                            },
                            fechaNotificacion: {
                                gte: fechaInicio,
                                lte: fechaFin,
                            },
                        },
                    },
                },
                include: {
                    configuracionNotificacionList: true,
                },
            });
            const medicamentosMap = new Map();

            // Función para agregar medicamentos
            const agregarMedicamentos = (medicamentos: any[], key: string) => {
                medicamentos.forEach((medicamento) => {
                    if (!medicamentosMap.has(medicamento.idMedicamento)) {
                        medicamentosMap.set(medicamento.idMedicamento, {
                            ...medicamento,
                            totalUsos: 0,
                        });
                    }
                    // Sumar al total de usos solo los del key correspondiente
                    medicamentosMap.get(medicamento.idMedicamento).totalUsos += medicamento[key]?.length || 0;
                });
            };

            // Agregar medicamentos de cada consulta
            agregarMedicamentos(inventarioMedicamentos, 'inventarioList');
            agregarMedicamentos(registroMedicamentos, 'registroMedicamentoList');
            agregarMedicamentos(configuracionMedicamentos, 'configuracionNotificacionList');

            // Convertir el mapa a un arreglo y ordenar
            const medicamentosOrdenados = Array.from(medicamentosMap.values())
                .sort((a, b) => b.totalUsos - a.totalUsos) // Ordenar por total de usos
                .slice(0, 5); // Tomar los primeros 5

            // Verificar si se encontraron medicamentos
            if (medicamentosOrdenados.length === 0) {
                return res.status(404).json({ msg: "No se encontraron medicamentos en el rango de fechas especificado" });
            }

            // Preparar los colores para los medicamentos
            const colores = [
                "rgba(255, 99, 132, 0.5)", // Rojo
                "rgba(255, 159, 64, 0.5)", // Naranja
                "rgba(255, 205, 86, 0.5)", // Amarillo
                "rgba(75, 192, 192, 0.5)", // Verde
                "rgba(54, 162, 235, 0.5)", // Azul
            ];

            // Preparar los datos para el gráfico
            const resultado = {
                labels: medicamentosOrdenados.map((medicamento) => medicamento.nombreFarmaco),
                datasets: [
                    {
                        label: "Cantidad de usos por Medicamento",
                        data: medicamentosOrdenados.map((medicamento) => medicamento.totalUsos),
                        backgroundColor: colores.slice(0, medicamentosOrdenados.length),
                    },
                ],
            };

            return res.status(200).json({ msg: "Se han encontrado registros", data: resultado });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener los medicamentos", data: error.message });
        }
    },

    getAll: async (req: Request, res: Response) => {
        const { fechaDesde, fechaHasta } = req.query;

        try {
            // Validar y convertir parámetros
            const fechaInicio = fechaDesde ? new Date(fechaDesde as string) : new Date();
            const fechaFin = fechaHasta ? new Date(fechaHasta as string) : new Date();
           
            // Obtener medicamentos de inventario filtrados por perfil y fecha
            const inventarioMedicamentos = await prisma.medicamento.findMany({
                where: {
                    inventarioList: {
                        some: {
                            fechaCreacion: {
                                gte: fechaInicio,
                                lte: fechaFin,
                            },
                        },
                    },
                },
                include: {
                    inventarioList: true,
                },
            });

            // Obtener medicamentos de registroMedicamentoList filtrados por perfil y fecha
            const registroMedicamentos = await prisma.medicamento.findMany({
                where: {
                    registroMedicamentoList: {
                        some: {
                            fechaDesde: { gte: fechaInicio },
                            OR: [
                                { fechaHasta: null },
                                { fechaHasta: { lte: fechaFin } },
                            ],
                        },
                    },
                },
                include: {
                    registroMedicamentoList: true,
                },
            });

            // Obtener medicamentos de configuracionNotificacionList filtrados por perfil y fecha
            const configuracionMedicamentos = await prisma.medicamento.findMany({
                where: {
                    configuracionNotificacionList: {
                        some: {
                            fechaNotificacion: {
                                gte: fechaInicio,
                                lte: fechaFin,
                            },
                        },
                    },
                },
                include: {
                    configuracionNotificacionList: true,
                },
            });
            const medicamentosMap = new Map();

            // Función para agregar medicamentos
            const agregarMedicamentos = (medicamentos: any[], key: string) => {
                medicamentos.forEach((medicamento) => {
                    if (!medicamentosMap.has(medicamento.idMedicamento)) {
                        medicamentosMap.set(medicamento.idMedicamento, {
                            ...medicamento,
                            totalUsos: 0,
                        });
                    }
                    // Sumar al total de usos solo los del key correspondiente
                    medicamentosMap.get(medicamento.idMedicamento).totalUsos += medicamento[key]?.length || 0;
                });
            };

            // Agregar medicamentos de cada consulta
            agregarMedicamentos(inventarioMedicamentos, 'inventarioList');
            agregarMedicamentos(registroMedicamentos, 'registroMedicamentoList');
            agregarMedicamentos(configuracionMedicamentos, 'configuracionNotificacionList');

            // Convertir el mapa a un arreglo y ordenar
            const medicamentosOrdenados = Array.from(medicamentosMap.values())
                .sort((a, b) => b.totalUsos - a.totalUsos) // Ordenar por total de usos
                .slice(0, 5); // Tomar los primeros 5

            const colores = [
                    "rgba(255, 99, 132, 0.5)", // Rojo
                    "rgba(255, 159, 64, 0.5)", // Naranja
                    "rgba(255, 205, 86, 0.5)", // Amarillo
                    "rgba(75, 192, 192, 0.5)", // Verde
                    "rgba(54, 162, 235, 0.5)", // Azul
            ];
            // Verificar si se encontraron medicamentos
            if (medicamentosOrdenados.length === 0) {
                const resultado = {
                    labels: ["No se encontró información"],
                    datasets: [
                        {
                            label: "Cantidad de usos por Medicamento",
                            data: [1],
                            backgroundColor: colores.slice(0, medicamentosOrdenados.length),
                        },
                    ],
                };
                return res.status(200).json({ msg: "No se encontraron medicamentos en el rango de fechas especificado", data: resultado, status: "SUCCESSFUL" });
            }

            // Preparar los colores para los medicamentos
           

            // Preparar los datos para el gráfico
            const resultado = {
                labels: medicamentosOrdenados.map((medicamento) => medicamento.nombreFarmaco),
                datasets: [
                    {
                        label: "Cantidad de usos por Medicamento",
                        data: medicamentosOrdenados.map((medicamento) => medicamento.totalUsos),
                        backgroundColor: colores.slice(0, medicamentosOrdenados.length),
                    },
                ],
            };

            return res.status(200).json({ msg: "Se han encontrado registros", data: resultado, status: "SUCCESSFUL" });
        } catch (error: any) {
            console.error(error);
            res.status(200).json({ msg: "Error al obtener los medicamentos", data: error.message, status: "ERROR" });
        }
    },
};

