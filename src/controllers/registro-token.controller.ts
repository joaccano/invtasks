import { Request, Response } from "express";
import { RegistroRepository } from "../repositories/registro.repository";
import jwt from "jsonwebtoken";

const registroRepository = new RegistroRepository();

export const RegistroTokenController = {
    
    // Recuperar registro por ID desde el token
    getById: async (req: Request, res: Response) => {
        const { token } = req.params
        if (!token) {
            return res.status(403).json({ msg: "Token no proporcionado" });
        }
        
        try {
            // Verificamos y decodificamos el token
            const decoded = jwt.verify(token, String(process.env.SECRET_KEY_JWT)) as jwt.JwtPayload;
            const { idRegistro, params } = decoded;
            let parsedParams = params;

            // if (typeof params === "string") {
            //     console.log("Params se decodificó como string, intentando parsear...");
            //     parsedParams = JSON.parse(params);
            // } else if (typeof params !== "object" || params === null) {
            //     return res.status(400).json({ msg: "Objeto Params no es válido" });
            // }
            // Realizamos la consulta usando el ID y los filtros que vienen en el token
            const registro = await registroRepository.findById(Number(idRegistro), decodeURIComponent('?'+parsedParams.replace(/\s+/g, '')));

            if (!registro) {
                return res.status(404).json({ msg: "Registro no encontrado" });
            }

            res.json({ msg: "Se ha encontrado el registro", data: registro });
        } catch (error: any) {
            res.status(401).json({ msg: "Token no válido o ha expirado", detail: error.message });
        }
    },
};
