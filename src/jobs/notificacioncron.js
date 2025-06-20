const { CronJob } = require('cron');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const job = new CronJob('*/5 * * * *', async () => {

  try {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000; // Ajuste de desfase en milisegundos
    const localNow = new Date(now.getTime() - offsetMs); // Ajusta la fecha a la zona horaria local
    
    const startOfMinute = new Date(localNow.getTime());
    startOfMinute.setSeconds(0, 0); // Inicio del minuto
    
    const endOfMinute = new Date(localNow.getTime());
    endOfMinute.setSeconds(59, 999); // Final del minuto
  
    const estadoNotificacionActivo = await prisma.estadoNotificacion.findMany({
      where: {
        nombre: {
          equals: "Activo", // Busca que el nombre contenga el string pasado, puede ser contains
        },
      },
    });

    // Busco las configuraciones de las notificaciones activas
    const ultimasConfiguraciones = await prisma.configuracionNotificacion.findMany({
      where: {
        notificacion: {
          notificacionEstadoList: {
            some: {
              idEstadoNotificacion: estadoNotificacionActivo[0].idEstadoNotificacion,
              fechaHasta: null,
            },
          },
        },
        fechaNotificacion: {
          gte: startOfMinute,
          lt: endOfMinute,
        },
      },
      orderBy: {
        fechaNotificacion: 'desc',
      },
      distinct: ['idNotificacion'],
      include: {
        notificacion: {
          include: {
            perfil: true,  // Aquí ya no se incluye `usuario`
          },
        },
        tipoFrecuencia: true,
        medicamento: true,
      },
    });

    /* Creo las nuevas configuraciones si es que hace falta */
    for (const configuracion of ultimasConfiguraciones) {
      let minutos = (configuracion.tipoFrecuencia.valor * configuracion.cantidadFrecuencia) / 60;

      if (!isNaN(minutos)) {
        // Sumo la cantidad de frecuencia 
        const nuevaFechaNotificacion = new Date(configuracion.fechaNotificacion);
        nuevaFechaNotificacion.setMinutes(nuevaFechaNotificacion.getMinutes() + minutos); // Sumar los minutos calculados

        
        const tipoFrecuencia = await prisma.tipoFrecuencia.findMany({
          where: {
            nombre: {
              equals: "Única", // Busca que el nombre contenga el string pasado, puede ser contains
            },
          },
        });

        if (configuracion.idTipoFrecuencia !== tipoFrecuencia[0].idTipoFrecuencia ) {
          const nuevaConfiguracion = await prisma.configuracionNotificacion.create({
            data: {
              idTipoFrecuencia: configuracion.idTipoFrecuencia,
              idNotificacion: configuracion.idNotificacion,
              idMedicamento: configuracion.idMedicamento,
              cantidadFrecuencia: configuracion.cantidadFrecuencia,
              cantidadMedicamento: configuracion.cantidadMedicamento,
              fechaNotificacion: nuevaFechaNotificacion, // Usa la nueva fecha modificada
            },
          });
        }
      }
    }

  } catch (error) {
    console.error('Error al generar las notificaciones:', error.message);
  }
  console.log(`Tarea ejecutada a las ${new Date().toLocaleTimeString()}`);
});

// Iniciar la tarea
job.start();
module.exports = { job };
