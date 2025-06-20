import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateDailyIntervalsBetweenDates, calculateDailyIntervalsRepetition } from "../helpers/time.helper";

const prisma = new PrismaClient();

export const TestController = {
    // Recuperar registros en base a filtros
    test: async (req: Request, res: Response) => {
        const { desde, repeticiones, valor } = req.body; // rangoFecha puede ser 'semana', 'mes' o 'año'

        try {
            let response;
            calculateDailyIntervalsRepetition(desde, repeticiones, valor);
            res.status(200).json({ msg: 'Se han encontrado registros', data: response});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
}