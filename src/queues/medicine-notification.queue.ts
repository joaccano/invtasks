import { Queue, Worker, Job } from "bullmq";
import IORedis from 'ioredis';
import { logNotificationHelper } from "../helpers/log.notification.helper";
import { PerfilRepository } from "../repositories/perfil.repository";
import { FirebaseAdapter } from "../adapters/firebase.adapter";
import jwt from "jsonwebtoken";
import { ConfiguracionNotificacionRepository } from "../repositories/configuracion-notificacion.repository";

const redisConnection = new IORedis({
  host: process.env.REDIS_URL || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null
});

const perfilRepository = new PerfilRepository();
const firebaseAdapter = new FirebaseAdapter();
const configuracionNotificacionRepository = new ConfiguracionNotificacionRepository();

export const medicineNotificationQueue = new Queue('medicineNotificationQueue', { connection: redisConnection } );

const worker = new Worker('medicineNotificationQueue', async (job: Job) => {
  logNotificationHelper('INFO', `Init JobId ${job.id}`, null, 'medicineNotificationQueue');
  const { notificacion } = job.data;
  const payload = `filter[idPerfil][eq]=${notificacion.idPerfil}&filter[include]=cuenta.usuario`;
  const perfil = await perfilRepository.findUnique(payload);
  const usuario = perfil.cuenta.usuario;
  const payload2 = `filter[idConfiguracionNotificacion][eq]=${notificacion.configuracionNotificacion.idConfiguracionNotificacion}`;
  const configuracionNotificacion = await configuracionNotificacionRepository.findUnique(payload2);
  if (configuracionNotificacion.fechaBaja) return;
  const token = jwt.sign(
    { notificacionId: notificacion.idNotificacion, configuracionNotificacionId: notificacion.configuracionNotificacion.idConfiguracionNotificacion },
		String(process.env.SECRET_KEY_JWT),
		{ expiresIn: String(process.env.EXPIRES_JWT) || "24h" }
	);
  notificacion['token'] = token;
	notificacion['baseUrl'] = notificacion.baseUrl;
  try {
		await firebaseAdapter.sendMessage(notificacion, usuario.tokenNotificacion);
	} catch (err) {
		console.log(' ERRRRROOOOOOOOOOOOOO    ', err);
	}
}, {connection: redisConnection} );

worker.on('completed', (job) => {
  logNotificationHelper('COMPLETED', `JobId ${job.id} completed successfully`, null, 'medicineNotificationQueue');
});

worker.on('failed', (job, err) => {
  logNotificationHelper('ERROR', `Job ${job?.id} failed with error: ${err.message}`, job?.data, 'medicineNotificationQueue');
  logNotificationHelper('ERROR', `Stracktrace:`, err.stack, 'medicineNotificationQueue');
});

logNotificationHelper('INFO', `Worker process started and listening for jobs...`, null, 'medicineNotificationQueue');
