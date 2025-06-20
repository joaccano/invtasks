import { BaseRepository } from "./base.repository";

export class NotificacionRepository extends BaseRepository {

  constructor() {
    super();
  }

  public async getNotificaciones(filtros: any) {
    //Obtenemos la cuenta en base al usuarioId
    const cuenta = await this.prisma.cuenta.findUnique({
      where: {
        idUsuario: filtros?.idUsuario,
      }
    });
    const idCuenta = cuenta?.idCuenta;
    // Obtenemos los perfiles asociados a la cuenta
    const perfiles = await this.prisma.perfil.findMany({
      where: {
        idCuenta: idCuenta,
      },
    });
    const estadoNotificacionDlt = await this.prisma.estadoNotificacion.findMany({
      where: {
        nombre: {
          contains: "Eliminado", // Busca que el nombre contenga el string pasado
        },
      },
    });
    const notificacionesPorPerfil = await Promise.all(
      perfiles.map(async (perfil: any) => {
        const notificaciones = await this.prisma.notificacion.findMany({
          where: {
            idPerfil: perfil.idPerfil,
            ...(filtros?.idTipoNotificacion ? { idTipoNotificacion: filtros?.idTipoNotificacion } : {}),
            AND: [
              ...(filtros?.fechaCreacionDesde ? [{ fechaDesde: { gte: filtros?.fechaCreacionDesde } }] : []),
              ...(filtros?.fechaCreacionHasta ? [{ fechaHasta: { lte: filtros?.fechaCreacionHasta } }] : []),
            ],
            notificacionEstadoList: {
              some: {
                fechaHasta: null,
                idEstadoNotificacion: {
                  not: estadoNotificacionDlt[0]?.idEstadoNotificacion ?? 2// Condición adicional en notificacionEstadoList
                },
                ...(filtros?.idEstadoNotificacion ? { idEstadoNotificacion: filtros?.idEstadoNotificacion } : {}),
              }
            }
          },
          include: {
            notificacionEstadoList: {
              where: {
                fechaHasta: null,
                idEstadoNotificacion: {
                  not: estadoNotificacionDlt[0]?.idEstadoNotificacion ?? 2 // Condición adicional en notificacionEstadoList
                },
                ...(filtros?.idEstadoNotificacion ? { idEstadoNotificacion: filtros?.idEstadoNotificacion } : {}),
              },
              orderBy: {
                idNotificacionEstado: 'desc' // Ordenar por idNotificacionEstado en orden descendente
              },
              take: 1, // Tomar solo el último estado
              include: {
                estadoNotificacion: true
              }
            },
            perfil: true
          }
        });

        return {
          notificaciones
        };
      })
    );
    const notificacionesConEstado = notificacionesPorPerfil.flatMap(({ notificaciones }) =>
      notificaciones.map((notificacion) => {
        const estadoActual =
          notificacion.notificacionEstadoList.length > 0
            ? notificacion.notificacionEstadoList[0].estadoNotificacion.nombre // Obtenemos el estado si está presente
            : 'Desconocido'; // Valor por defecto si no hay un estado asociado

        // Creamos un nuevo objeto con todos los campos de notificacion, pero sin notificacionEstadoList ni perfil
        const { notificacionEstadoList, perfil, ...notificacionData } = notificacion; // Desestructuramos los campos a omitir

        return {
          ...notificacionData, // Incluimos todos los campos de notificacion
          EstadoNotificacion: estadoActual, // Añadimos el campo EstadoNotificacion
        };
      })
    );
    return notificacionesConEstado;
  }

}