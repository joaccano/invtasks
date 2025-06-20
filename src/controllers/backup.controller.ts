import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import archiver from 'archiver';
import { exec } from "child_process";
import * as unzipper from "unzipper";
const prisma = new PrismaClient();
import { BackupRepository } from "../repositories/backup.repository";

export const backupRepository = new BackupRepository();

export const BackupController = {
    getBackups: async (req: Request, res: Response) => {
        try {
            const data = await backupRepository.findMany("?");
            interface Backup {
                nombre: string;
                tipo: string;
                fechaAlta: Date;
            }

            const formattedData = data.sort((a: Backup, b: Backup) => new Date(b.fechaAlta).getTime() - new Date(a.fechaAlta).getTime())
            .map((backup: Backup) => ({
                nombre: backup.nombre,
                tipo: backup.tipo,
            }));

            return res.status(200).json({ data: formattedData, msg: "Backups obtenidos correctamente", status: "SUCCESSFULL" });
        } catch (error) {
            return res.status(200).json({ msg: "Error al obtener los backups", error, data: [],status: "ERROR" });
        }

    },
    createBackup: async (req: Request, res: Response) => {
        try {
            const { tipo } = req.body;
            if (!tipo || tipo !== "file" && tipo !== "db") {
                return res.status(400).json({ msg: "El tipo de backup es requerido" });
            }
            const now = new Date();
            const formattedDate = `${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
            const nombre = tipo === "file" ? `backup_archivos_${formattedDate}.zip` : `backup_database_${formattedDate}.sql`;

            if (tipo === "file") {
                // Ruta de la carpeta a comprimir
                const folderPath = path.join(__dirname, "../../uploads");
                // Ruta donde se guardará el archivo comprimido
                const outputPath = path.join(__dirname, "../../backups", nombre);

                // Crear archivo comprimido
                const output = fs.createWriteStream(outputPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Nivel de compresión
                });
                output.on('close', async () => {
                    // Crear registro en la base de datos después de comprimir
                    await backupRepository.create({ nombre, fechaAlta: new Date(), path:outputPath, tipo, estado: 1 });
                });
                archive.on('error', (error: Error) => {
                    return res.status(500).json({ msg: "Error al crear usuario", mensaje: "", detail: error.message, status: "ERROR" });
                });
                archive.pipe(output);
                archive.directory(folderPath, false);
                await archive.finalize();
                return res.status(200).json({ msg: "Ok", mensaje: "", detail: outputPath, status: "SUCCESSFULL" });
            } else if (tipo === "db") {
                // Ruta donde se guardará el archivo SQL
                const outputPath = path.join(__dirname, "../../backups", nombre);

                // Comando para generar el respaldo de la base de datos
                const dumpCommand = process.env.DATABASE_URL_BACKUP+` > ${outputPath}`;

                exec(dumpCommand, async (error, stdout, stderr) => {
                    if (error) {
                        return res.status(500).json({ msg: "Error al crear usuario", mensaje: "", detail: error.message, status: "ERROR" });
                    }
                    // Crear registro en la base de datos después de generar el respaldo
                   try {
                        const data = await backupRepository.create({ nombre, fechaAlta: new Date(), tipo, estado: 1, path:outputPath });
                        return res.status(200).json({ msg: "Backup creado satisfactoriamente", data, status: "SUCCESSFULL" });
                    } catch (dbError:any) {
                        console.error("Error al crear el registro en la base de datos:", dbError);
                        return res.status(500).json({ msg: "Error al crear el registro en la base de datos", mensaje: "", detail: dbError.message, status: "ERROR" });
                    }
                });
            }
        } catch (error: any) {
            console.log(error);
           return res.status(500).json({ msg: "Error al crear usuario", mensaje: "", detail: error.message, status: "ERROR" });
        }
    },
    restoreBackup: async (req: Request, res: Response) => {
        try {
            const { tipo, nombre } = req.body;
            const backupPath = path.join(__dirname, "../../backups", nombre);

            if (tipo === "file") {
                // Ruta donde se descomprimirá el archivo
                const restorePath = path.join(__dirname, "../../uploads");
                if (!fs.existsSync(backupPath)) {
                    return res.status(404).json({ msg: "El archivo de backup no existe" });
                }
                fs.createReadStream(backupPath)
                    .pipe(unzipper.Extract({ path: restorePath }))
                    .on('close', () => {
                       return res.status(200).json({ msg: "Backup restaurado satisfactoriamente", status: "SUCCESSFULL" });
                    })
                    .on('error', (error) => {
                        return res.status(500).json({ msg: "Error al restaurar backup", mensaje: "", detail: error.message, status: "ERROR" });
                    });

            } else if (tipo === "db") {
                // Comando para restaurar la base de datos
                const restoreCommand = process.env.DATABASE_URL_BACKUP+` < ${backupPath}`;

                exec(restoreCommand, (error, stdout, stderr) => {
                    if (error) {
                        return res.status(500).json({ msg: "Error al restaurar backup", mensaje: "", detail: error.message, status: "ERROR" });
                    }
                    return res.status(200).json({ msg: "Backup de base de datos restaurado satisfactoriamente", status: "SUCCESSFULL" });
                });
            }

        } catch (error: any) {
            return res.status(500).json({ msg: "Error al restaurar backup", mensaje: "", detail: error.message, status: "ERROR" });
        }
    }
   
}
