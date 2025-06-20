import { Message } from "firebase-admin/lib/messaging/messaging-api";
import admin from "../config/firebase";
import { logNotificationHelper } from "../helpers/log.notification.helper";

export class FirebaseAdapter {

  public async sendMessage(notificacion: any, fcm: string) {
    try {
      const title = notificacion.titulo || "Título de la notificación";
      let body = notificacion.mensaje || "Este es el contenido de la notificación.";

      if (notificacion.configuracionNotificacion) {
        body += ` (Debes tomar ${notificacion.configuracionNotificacion.cantidadMedicamento} dosis de ${notificacion.configuracionNotificacion.medicamento.nombreFarmaco}-${notificacion.configuracionNotificacion.medicamento.nombreGenerico})`;
      }
      const message: Message = {
        token: fcm,  // El token del dispositivo al que enviarás la notificación
        notification: {
          title: title,
          body: body,
        },
        data: {
          title: title,
          message: body,
          tokennotification: notificacion.token || '',
          baseUrl: notificacion.baseUrl || ''
        }
      };
      if (message.data?.baseUrl && message.data?.baseUrl != '') {
        message['webpush'] = {
          notification: {
            // Contenido de la notificación
            title: title,
            body: body,
            icon: "https://example.com/icon.png",  // Icono de la notificación
            actions: [
              {
                action: 'accept', // Acción para el botón "Aceptar"
                title: 'Aceptar',
              },
              {
                action: 'reject', // Acción para el botón "Rechazar"
                title: 'Rechazar',
              }
            ]
          },
          data: {
            title: title,
            message: body,
            tokennotification: notificacion.token,
            baseUrl: notificacion.baseUrl
          }
        }
      }
      await admin.messaging().send(message);
    } catch (error: any) {
      console.log('ERRROROROROROROR ', error);
      logNotificationHelper('ERROR', `Firebase failed with error: ${error}`, error, 'FIREBASE');
    }
  }
}