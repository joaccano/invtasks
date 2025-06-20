import { Request, Response } from "express";
const QRCode = require('qrcode');

export const GeneradorQRController = {
    createQR: async (req: Request, res: Response) => {
        const { content } = req.body

        try {
            // Validar que el contenido sea una cadena no vacía
            if (typeof content !== 'string' || content.trim() === '') {
                return res.status(400).json({ msg: 'El contenido debe ser una cadena no vacía.' });
            }

            const qrCodeData = await QRCode.toDataURL(content); // Generar código en base64

            res.status(200).json({ msg: 'Se ha generado el QR', data: qrCodeData });

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al generar el código QR', detail: error.message });
        }
    }
}