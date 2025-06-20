import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { MedicoRepository } from "../repositories/medico.repository";

const prisma = new PrismaClient();
const medicoRepository = new MedicoRepository();

export const MedicoController = {
    // Obtener todos los medicos
    getAll: async (req: Request, res: Response) => {
        try {
            const registros = await medicoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un medico por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await medicoRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Buscar médico por nombre o apellido o especialidad, cualquiera de los tres parámetros que coincida
    getMedicosByNombreApellidoOEspecialidad: async (req: Request, res: Response) => {
        const { nombre, apellido, especialidad, idPerfil } = req.body; // Recibe los parámetros de búsqueda desde la query string
        console.log('nombre:', nombre, 'apellido:', apellido, 'especialidad:', especialidad, 'idPerfil:', idPerfil);
        try {
            // Paso 1: Buscar el ID de la especialidad proporcionada
            const especialidadObj = await prisma.especialidad.findFirst({
                where: {
                    nombre: especialidad as string, // Filtra por el nombre exacto de la especialidad
                    fechaBaja: null // Nos aseguramos de que la especialidad esté activa
                },
                select: {
                    idEspecialidad: true, // Solo necesitamos el ID de la especialidad
                },
            });

            // Si no se encuentra la especialidad, devolvemos un error
            if (!especialidadObj) {
                return res.status(404).json({ error: `La especialidad "${especialidad}" no existe o está inactiva` });
            }

            // Paso 2: Construir el filtro para buscar por nombre, apellido y perfil
            const whereClause: {
                nombre?: { contains: string },
                apellido?: { contains: string },
                idEspecialidad: number,
                idPerfil?: number // Aseguramos que este campo sea parte del filtro
            } = { idEspecialidad: especialidadObj.idEspecialidad }; // Inicializamos con el ID de la especialidad

            // Si se proporciona el parámetro `nombre`, lo añadimos al filtro
            if (nombre) {
                whereClause.nombre = {
                    contains: nombre as string, // Filtra por nombres que contengan el valor proporcionado
                };
            }

            // Si se proporciona el parámetro `apellido`, lo añadimos al filtro
            if (apellido) {
                whereClause.apellido = {
                    contains: apellido as string, // Filtra por apellidos que contengan el valor proporcionado
                };
            }

            // Si se proporciona el parámetro `idPerfil`, añadimos el filtro
            if (idPerfil) {
                whereClause.idPerfil = Number(idPerfil); // Aseguramos que Prisma filtre por el ID de perfil proporcionado
            }

            // Paso 3: Buscar médicos que coincidan con la especialidad, nombre, apellido y perfil
            const medicos = await prisma.medico.findMany({
                where: whereClause, // Aplicamos el filtro dinámico aquí
                include: {
                    especialidad: true, // Incluir la relación con la especialidad del médico
                    perfil: true,       // Incluir la relación con el perfil del médico
                },
            });

            // Si no se encuentran médicos que coincidan con los filtros, devolvemos un error 404
            if (medicos.length === 0) {
                return res.status(404).json({ msg: 'No se encontraron médicos que coincidan con los criterios de búsqueda (nombre o apellido).' });
            }

            // Si se encuentran médicos, devolvemos los resultados en formato JSON
            res.status(200).json({ data: medicos });

        } catch (error: any) {
            // Si ocurre algún error durante la ejecución, lo capturamos y devolvemos un error 500
            console.error('Error al obtener los médicos:', error);
            res.status(500).json({ msg: 'Error al obtener los médicos', detail: error.message });
        }
    },

    // Crear un nuevo medico (create)
    create: async (req: Request, res: Response) => {
        let { nombre, apellido, direccion, telefonoContacto, email, fechaAlta, fechaBaja, idEspecialidad, idPerfil } = req.body;
        if (esVacio(nombre)) {
            return res.status(422).json({ msg: 'El nombre no puede estar vacío.' });
        } else {
            if (!validarNombreApellido(nombre)) {
                return res.status(422).json({ msg: 'El nombre solo puede contener letras (mayúsculas y minúsculas), tildes y apóstrofes. No se permiten caracteres especiales como @, #, $, %, etc.' });
            }
        }
        if (esVacio(apellido)) {
            return res.status(422).json({ msg: 'El apellido no puede estar vacío.' });
        } else {
            if (!validarNombreApellido(apellido)) {
                return res.status(422).json({ msg: "El apellido solo puede contener letras (mayúsculas y minúsculas), tildes y apóstrofes. No se permiten caracteres especiales como @, #, $, %, etc." });
            }
        }
        if (!esVacio(email)) {
            if (!esEmailValido(email)) {
                return res.status(422).json({ msg: 'La dirección de correo no es válida.' });
            }
        }
        // 🔴 Nueva validación: El teléfono solo puede contener números
        if (!/^\d+$/.test(telefonoContacto)) {
            return res.status(422).json({ msg: 'El teléfono solo debe contener números.' });
        }

        if (!idEspecialidad) {
            return res.status(422).json({ msg: 'Debe seleccionar una especialidad médica.' })
        }
        try {

            // Verificar duplicados en `direccion`, `telefonoContacto`, `email` considerando `idPerfil`
            const medicosDuplicados = await prisma.medico.findMany({
                where: {
                    idPerfil: idPerfil,
                    fechaBaja: null,
                    OR: [
                        { direccion: direccion },
                        { telefonoContacto: telefonoContacto },
                        { email: email }
                    ]
                }
            });

            if (medicosDuplicados.length > 0) {
                return res.status(409).json({ msg: 'Ya existe un médico registrado con la misma dirección, teléfono de contacto o correo electrónico para este perfil.' });
            }
            const data = { nombre, apellido, direccion, telefonoContacto, email, fechaAlta: (fechaAlta || new Date()), fechaBaja: fechaBaja || null, idEspecialidad, idPerfil };
            const medico = await medicoRepository.create(data);
            res.status(201).json({ msg: `${medico ? 'Se ha creado el medico' : 'No se ha creado el medico'}`, data: medico });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el medico', detail: error.message });
        }
    },

    // Actualizar un medico (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { nombre, apellido, direccion, telefonoContacto, email, fechaBaja, idEspecialidad, idPerfil } = req.body;
        let payload: any = { nombre, apellido, direccion, telefonoContacto, email };
        if (idPerfil) payload['idPerfil'] = idPerfil;
        if (idEspecialidad) payload['idEspecialidad'] = idEspecialidad;
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;

        if (esVacio(nombre)) {
            return res.status(422).json({ msg: 'El nombre no puede estar vacío.' });
        } else {
            if (!validarNombreApellido(nombre)) {
                return res.status(422).json({ msg: 'El nombre debe contener al menos 3 caracteres válidos (letras, espacios, apóstrofes o guiones). Ejemplo: Gonzalo' });
            }
        }

        if (esVacio(apellido)) {
            return res.status(422).json({ msg: 'El apellido no puede estar vacío.' });
        } else {
            if (!validarNombreApellido(apellido)) {
                return res.status(422).json({ msg: 'El apellido debe contener al menos 3 caracteres válidos (letras, espacios, apóstrofes o guiones). Ejemplo: Gonzales' });
            }
        }
        if (!esVacio(email)) {
            if (!esEmailValido(email)) {
                return res.status(422).json({ msg: 'La dirección de correo no es válida.' });
            }
        }
        if (!/^\d+$/.test(telefonoContacto)) {
            return res.status(422).json({ msg: 'El teléfono solo debe contener números.' });
        }

        try {
            res.status(200).json({ msg: 'Se ha actualizado el médico.', data: await medicoRepository.updateById(Number(id), payload) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el medico', detail: error.message });
        }
    },

    // Eliminar un medico (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const idMedico = parseInt(id);

            const medico = await prisma.medico.findUnique({
                where: { idMedico },
            });

            if (!medico) {
                return res.status(404).json({ msg: 'Médico no encontrado.' });
            }

            const fechaBaja = new Date();
            await prisma.medico.update({
                where: { idMedico },
                data: { fechaBaja },
            });

            // Eliminar la relación con los registros médicos
            await prisma.registro.updateMany({
                where: { idMedico },
                data: { idMedico: null },
            });

            return res.status(200).json({ msg: 'Se ha eliminado el médico.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: 'Error al eliminar el médico.' });
        }
    },
}

// Funciones de validación
function esVacio(cadena: string) {
    return cadena.trim() === '';
}

function validarNombreApellido(cadena: string) {
    const regex = /^[a-zA-ZÀ-ÿ\s'.-]{2,}(?:\s[a-zA-ZÀ-ÿ\s'.-]{2,})*$/;
    return regex.test(cadena);
}

function esEmailValido(mail: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(mail);
}