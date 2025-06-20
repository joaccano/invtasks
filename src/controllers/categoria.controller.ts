import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CategoriaRepository } from "../repositories/categoria.repository";

const prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']});
const categoriaRepository = new CategoriaRepository();

export const CategoriaController = {

    // Obtener todos las categorias
    getAll: async (req: Request, res: Response) => {
        try {
            const categorias = await categoriaRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${categorias.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: categorias});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los registros', detail: error.message });
        }
    },

    // Obtener un categoria por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await categoriaRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Obtener categorías
    getByName: async (req: Request, res: Response) => {
        const filtros = {
            nombre: req.query.nombre ? req.query.nombre as string : undefined,
            id: req.query.idPerfil ? Number(req.query.idPerfil) : undefined,
        }
        console.log(filtros)
        try {
            const categorias = await prisma.categoria.findMany({
                where: {
                    nombre: {
                        contains: filtros.nombre,
                    },
                    idPerfil: filtros.id
                },
                take: 10, // Limitar a los primeros 10 registros
            })
            if (categorias.length === 0) {
                return res.status(422).json({ msg: 'No se han encontrado categorías.' });
            } else {
                return res.status(200).json({ msg: 'Se han encontrado categorías', data: categorias })
            }
        } catch (error: any) {
            console.log(error)
            res.status(500).json({ msg: 'Error al obtener categorías.', detail: error.message });
        }
    },

    //Create Categoría
    create: async (req: Request, res: Response) => {
        const { idPerfil, nombre, descripcion } = req.body;

        if (esVacio(nombre)) {
            return res.status(422).json({ msg: 'El nombre no puede estar vacío.' });
        } else {
            if (!validarNombre(nombre)) {
                return res.status(422).json({ msg: 'El nombre de categoria solo pueden contener letras (mayúsculas y minúsculas), tildes y apóstrofes. No se permiten caracteres especiales como @, #, $, %, etc.' });
            }
        }
        try {
            res.status(200).json({ msg: 'Se ha creado la categoría.', data: await categoriaRepository.create({ nombre, descripcion, idPerfil, fechaCreacion: new Date() }) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la categoría.', detail: error.message });
        }

        // Funciones de validación

        function esVacio(cadena: string) {
            return cadena.trim() === '';
        }

        function validarNombre(cadena: string) {
            const regex = /^[a-zA-ZÀ-ÿ\s'.-]{3,}$/;
            return regex.test(cadena);
        }
    },

    //Update Categoría
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        try {
            res.status(200).json({ msg: 'Se ha actualizado la categoría.', data: await categoriaRepository.updateById(Number(id), {nombre, descripcion}) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar la categoría.', detail: error.message });
        }
    },

    // Eliminar una categoría (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await categoriaRepository.deleteById(Number(id));
            res.status(200).json({ msg: 'Se ha eliminado la categoría.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar la categoría.', detail: error.message });
        }
    }
}
