import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const ReporteRangosEdadController = {
  getPercentageByAgeRange: async (req: Request, res: Response) => {
    const { genero, fechaInicio, fechaFin } = req.query as {
      genero?: string;
      fechaInicio?: string;
      fechaFin?: string;
    };

    try {
      // 1. Interpretar el parámetro 'genero'
      //    '1' => M
      //    '2' => F
      //    '3' => null (solo quienes no tienen género)
      //    '0' o no presente => sin filtro de género
      let filtroGenero: string | null | undefined = undefined;

      if (genero === '1') filtroGenero = 'M';
      if (genero === '2') filtroGenero = 'F';
      if (genero === '3') filtroGenero = null; // Filtrará solo perfiles con genero = null

      // 2. Interpretar fechaInicio y fechaFin (si llegan en la query)
      const fechaDesde = fechaInicio ? new Date(fechaInicio) : undefined;
      const fechaHasta = fechaFin ? new Date(fechaFin) : undefined;

      // 3. Construir el objeto 'where' para filtrar
      const wherePerfil: any = {
        principal: true
      };

      // Filtrar por género si corresponde
      if (genero && genero !== '0') {
        wherePerfil.genero = filtroGenero;
        // - Si filtroGenero = null, buscará { genero: null }
        // - Si filtroGenero = 'M', buscará { genero: 'M' }
        // - etc.
      }

      // Filtrar por fechaCreacion del usuario (rango de fechas)
      //   - Perfil -> Cuenta -> Usuario (fechaCreacion)
      if (fechaDesde || fechaHasta) {
        wherePerfil.cuenta = {
          usuario: {
            fechaCreacion: {}
          }
        };

        if (fechaDesde) {
          wherePerfil.cuenta.usuario.fechaCreacion.gte = fechaDesde;
        }
        if (fechaHasta) {
          wherePerfil.cuenta.usuario.fechaCreacion.lte = fechaHasta;
        }
      }

      // 4. Buscar los perfiles principales que cumplan los filtros
      const perfilesPrincipales = await prisma.perfil.findMany({
        where: wherePerfil,
        select: {
          fechaNacimiento: true,
        },
      });

      // 5. Validar si se encontraron resultados
      if (!perfilesPrincipales.length) {
        const resultadoVacio = {
          labels: ["No se encontró información"],
          datasets: [
            {
              label: "Distribución por rango de edad",
              data: [1],
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(255, 159, 64, 0.5)",
                "rgba(255, 205, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(153, 102, 255, 0.5)",
              ],
            },
          ],
        };
        return res.status(200).json({
          msg: "No se encontraron resultados para los filtros ingresados.",
          data: resultadoVacio,
          status: "SUCCESSFUL",
        });
      }

      // 6. Calcular edades y agrupar en rangos
      const hoy = new Date();
      const rangosEdades = {
        menor18: 0,
        entre18y30: 0,
        entre30y40: 0,
        entre40y50: 0,
        entre50y60: 0,
        mayor60: 0,
      };

      perfilesPrincipales.forEach((perfil) => {
        const edad = hoy.getFullYear() - perfil.fechaNacimiento.getFullYear();

        if (edad < 18) {
          rangosEdades.menor18++;
        } else if (edad <= 30) {
          rangosEdades.entre18y30++;
        } else if (edad <= 40) {
          rangosEdades.entre30y40++;
        } else if (edad <= 50) {
          rangosEdades.entre40y50++;
        } else if (edad <= 60) {
          rangosEdades.entre50y60++;
        } else {
          rangosEdades.mayor60++;
        }
      });

      // 7. Calcular porcentajes
      const totalPerfiles = perfilesPrincipales.length;
      const porcentajes = Object.fromEntries(
        Object.entries(rangosEdades).map(([rango, cantidad]) => [
          rango,
          Math.round((cantidad as number / totalPerfiles) * 100),
        ])
      );

      // 8. Preparar la respuesta en formato Chart.js
      const resultado = {
        labels: [
          "Menor de 18 años",
          "18 - 30 años",
          "30 - 40 años",
          "40 - 50 años",
          "50 - 60 años",
          "Mayor de 60 años",
        ],
        datasets: [
          {
            label: "Distribución por rango de edad",
            data: [
              porcentajes.menor18,
              porcentajes.entre18y30,
              porcentajes.entre30y40,
              porcentajes.entre40y50,
              porcentajes.entre50y60,
              porcentajes.mayor60,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(255, 159, 64, 0.5)",
              "rgba(255, 205, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(153, 102, 255, 0.5)",
            ],
          },
        ],
        // Cantidades (ideal para gráfico de barras)
        counts: [
          rangosEdades.menor18,
          rangosEdades.entre18y30,
          rangosEdades.entre30y40,
          rangosEdades.entre40y50,
          rangosEdades.entre50y60,
          rangosEdades.mayor60,
        ],
        totalPerfiles,
      };
   

    // 9. Enviar la respuesta
    return res.status(200).json({
      msg: "Porcentaje y cantidades de usuarios por rango de edad y fecha de creación de usuario",
      data: resultado,
      status: "SUCCESSFUL",
    });
  } catch(error: any) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los rangos de edad",
      data: error.message,
      status: "ERROR",
    });
  }
},
};
