import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { InventarioRepository } from "../repositories/inventario.repository";

const prisma = new PrismaClient();
const inventarioRepository = new InventarioRepository();

export const InventarioController = {
    // Obtener todos los inventarios
    getAll: async (req: Request, res: Response) => {
        try {
            const query = decodeURIComponent(req.url);
            const inventarios = await inventarioRepository.findMany(query);
    
            // Filtrar los inventarios activos sin necesidad de tipado explícito
            const inventariosActivos = inventarios.filter((inv: any) => inv.fechaBaja === null);
    
            res.status(200).json({
                msg: `${inventariosActivos.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`,
                data: inventariosActivos
            });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener los registros', detail: error.message });
        }
    },

    // Obtener un inventario por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await inventarioRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo inventario (create)
    create: async (req: Request, res: Response) => {
        // Extraer los datos del cuerpo de la solicitud
        let { stock, cantidadMinima, idPerfil, idMedicamento } = req.body;
        // 1. Validaciones: Verificar que todos los campos necesarios están presentes
        if (!stock || !cantidadMinima || !idPerfil || !idMedicamento) {
            console.log("Faltan campos obligatorios");
            return res.status(400).json({ msg: "Todos los campos son obligatorios (stock, cantidadMinima, idPerfil, idMedicamento)" });
        }
        // 2. Validación adicional: Verificar que los valores numéricos son válidos
        if (isNaN(stock) || isNaN(cantidadMinima) || isNaN(idPerfil) || isNaN(idMedicamento)) {
            return res.status(400).json({ msg: "Los campos stock, cantidadMinima, idPerfil y idMedicamento deben ser números válidos" });
        }

        // 3. Validación de cantidad de stock ingresada
        if (!stock || stock <= 0) {
            return res.status(400).json({ msg: "La cantidad de stock debe ser mayor a 0 y no puede estar vacía." });
        }

        // 4. Validación de cantidad de minima ingresada
        if (!cantidadMinima || cantidadMinima <= 0) {
            return res.status(400).json({ msg: "La cantidad mínima debe ser mayor a 0 y no puede estar vacía." });
        }

        try {
            // 3. Verificar si el perfil existe
            const perfilExiste = await prisma.perfil.findUnique({
                where: { idPerfil: Number(idPerfil) },
            });
            if (!perfilExiste) {
                return res.status(404).json({ msg: "El perfil especificado no existe" });
            }
            // 4. Verificar si el medicamento existe
            const medicamentoExiste = await prisma.medicamento.findUnique({
                where: { idMedicamento: Number(idMedicamento) },
            });
            if (!medicamentoExiste) {
                return res.status(404).json({ msg: "El medicamento especificado no existe" });
            }
            // 5. Verificar si ya existe un inventario para este perfil y medicamento
            const inventarioExistente = await prisma.inventario.findFirst({
                where: {
                    idPerfil: Number(idPerfil),
                    idMedicamento: Number(idMedicamento),
                },
            });
            // Si ya existe un inventario para el mismo medicamento en el mismo perfil, devolvemos un error
            if (inventarioExistente) {
                return res.status(409).json({ msg: "El inventario para este medicamento ya existe en este perfil" });
            }
            // 6. Crear el nuevo inventario si todas las validaciones pasan
            const nuevoInventario = await prisma.inventario.create({
                data: {
                    stock: Number(stock),
                    cantidadMinima: Number(cantidadMinima),
                    idPerfil: Number(idPerfil),
                    idMedicamento: Number(idMedicamento),
                },
                include: {
                    medicamento: true,
                    perfil: true
                }
            });
            if (!nuevoInventario) return res.status(404).json({ msg: "Problemas al crear inventario" });
            // 7. Si por alguna razón la creación falla
            if (!nuevoInventario) {
                return res.status(500).json({ msg: "Hubo un problema al crear el inventario" });
            }
            // 8. Respuesta exitosa
            res.status(201).json({ data: nuevoInventario });
        } catch (error: any) {
            console.error("Error al crear inventario:", error);
            res.status(500).json({ msg: 'Error interno del servidor al crear el inventario', detail: error.message });
        }
    },
    // Proceso de toma de medicamento
    takeMedicine: async (req: Request, res: Response) => {
        const { idInventario } = req.params;
        const { cantidad } = req.body;

        // Validación: Asegúrate de que idInventario es un número
        const inventarioId = Number(idInventario);
        if (isNaN(inventarioId)) {
            return res.status(400).json({ msg: "El ID del inventario debe ser un número válido" });
        }

        // Validación de cantidad
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).json({ msg: "La cantidad a decrementar debe ser un número positivo" });
        }

        try {
            // 1. Buscar el inventario por ID
            const inventario = await prisma.inventario.findUnique({
                where: { idInventario: inventarioId },  // Aquí usamos la variable convertida a número
            });

            // 2. Verificar si el inventario existe
            if (!inventario) {
                return res.status(404).json({ msg: "El inventario no existe" });
            }

            // 3. Decrementar el stock según la cantidad especificada
            const nuevoStock = inventario.stock - Number(cantidad);

            // 4. Si el stock es menor que 0, devolver un error
            if (nuevoStock < 0) {
                return res.status(400).json({ msg: "No queda suficiente stock para este medicamento" });
            }

            // 5. Actualizar el stock en la base de datos
            const inventarioActualizado = await prisma.inventario.update({
                where: { idInventario: inventarioId },
                data: { stock: nuevoStock }
            });

            // 6. Verificar si el stock es menor que la cantidad mínima, y si es así, enviar una notificación
            if (nuevoStock < inventario.cantidadMinima) {
                // Aquí va la lógica para enviar la notificación al usuario
                console.log("Enviar notificación: El stock es menor que la cantidad mínima. Necesitas comprar más.");
                // Lógica para enviar notificación al usuario...
            }

            // 7. Respuesta exitosa con el inventario actualizado
            res.status(200).json({ data: inventarioActualizado });

        } catch (error: any) {
            console.error("Error al tomar medicamento:", error);
            res.status(500).json({ msg: 'Error al procesar la solicitud de tomar medicamento', detail: error.message });
        }
    },

    // Obtener todos los inventarios a partir del perfil de un usuario
    getInventariosByPerfil: async (req: Request, res: Response) => {
        const { idPerfil } = req.params;

        try {
            // Validar que el idPerfil sea un número
            const perfilId = Number(idPerfil);
            if (isNaN(perfilId)) {
                return res.status(400).json({ msg: "El ID del perfil debe ser un número válido" });
            }

            // Verificar si el perfil existe
            const perfilExiste = await prisma.perfil.findUnique({
                where: { idPerfil: perfilId },
            });

            if (!perfilExiste) {
                return res.status(404).json({ msg: "El perfil no existe" });
            }

            // Obtener todos los inventarios asociados al perfil
            const inventarios = await prisma.inventario.findMany({
                where: { idPerfil: perfilId },
                include: {
                    medicamento: true, // Incluir los detalles del medicamento
                },
            });

            // Responder con los inventarios encontrados
            res.status(200).json({ data: inventarios });

        } catch (error: any) {
            console.error("Error al obtener los inventarios:", error);
            res.status(500).json({ msg: 'Error interno del servidor al obtener los inventarios', detail: error.message });
        }
    },

    // Actualizar un inventario (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { stock, cantidadMinima, idPerfil, idMedicamento } = req.body;
        let payload: any = { stock, cantidadMinima };
        if (idPerfil) payload['idPerfil'] = idPerfil;
        if (idMedicamento) payload['idMedicamento'] = idMedicamento;
        try {
            const inventarioActualizado = await prisma.inventario.update({
                where: { idInventario: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el inventario.', data: inventarioActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el inventario', detail: error.message });
        }
    },

    // Eliminar un inventario (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const inventario = await prisma.inventario.update({
                where: { idInventario: parseInt(id) },
                data: { fechaBaja: new Date() } // Seteamos la fecha de baja con la fecha actual
            });
            res.status(200).json({ msg: 'El inventario ha sido marcado como dado de baja.', inventario });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al dar de baja el inventario', detail: error.message });
        }
    },
}
