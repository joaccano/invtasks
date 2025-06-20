import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const NotificacionTokenUsuario = {
    create: async (req: Request, res: Response) => {
        let { idUsuario, tokenNotificacion } = req.body;
        try {
            const usuarioUpdate = await prisma.usuario.update({
                where: { idUsuario: parseInt(idUsuario) },
                data: { tokenNotificacion: tokenNotificacion }
            });
            return res.status(200).json({msg: 'Se asocio el token al usuario'})
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al asociar el token_notificacion', detail: error.message });
        }
    }
}