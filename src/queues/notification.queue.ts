import { Queue, Worker, Job } from "bullmq";
import IORedis from 'ioredis';
import { logNotificationHelper } from "../helpers/log.notification.helper";
import { PerfilRepository } from "../repositories/perfil.repository";
import { FirebaseAdapter } from "../adapters/firebase.adapter";
import jwt from "jsonwebtoken";

const perfilRepository = new PerfilRepository();
const firebaseAdapter = new FirebaseAdapter();

const redisConnection = new IORedis({
	host: process.env.REDIS_URL || '127.0.0.1',
	port: Number(process.env.REDIS_PORT) || 6379,
	password: process.env.REDIS_PASSWORD || undefined,
	maxRetriesPerRequest: null
});

export const notificationQueue = new Queue('notificationQueue', { connection: redisConnection });

const worker = new Worker('notificationQueue', async (job: Job) => {
	logNotificationHelper('INFO', `Init JobId ${job.id}`, job.data, 'notificationQueue');
	const { notificacion } = job.data;
	const payload = `filter[idPerfil][eq]=${notificacion.idPerfil}&filter[include]=cuenta.usuario`;
	const perfil = await perfilRepository.findUnique(payload);
	const usuario = perfil.cuenta.usuario;
	const token = jwt.sign(
		{ notificacionId: notificacion.idNotificacion, configuracionNotificacionId: null }, // configuracionNotificacionId: .idConfiguracionNotificacion
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
}, { connection: redisConnection });

worker.on('completed', (job) => {
	logNotificationHelper('COMPLETED', `JobId ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
	logNotificationHelper('ERROR', `Job ${job?.id} failed with error: ${err.message}`, job?.data);
	logNotificationHelper('ERROR', `Stracktrace:`, err.stack);
});

logNotificationHelper('INFO', `Worker process started and listening for jobs...`);
