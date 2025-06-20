import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { PerfilRepository } from "../repositories/perfil.repository";

const prisma = new PrismaClient();
const perfilRepository = new PerfilRepository();

export const PerfilController = {

  getAll: async (req: Request, res: Response) => {
    try {
      const registros = await perfilRepository.findMany(decodeURIComponent(req.url));
      res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
    } catch (error: any) {
        res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
    }
  },

  // Crear un perfil
  create: async (req: Request, res: Response) => {
    const { principal, nombre, apellido, dni, genero, direccion, email, fechaNacimiento } = req.body;

    type ResultadoValidacion = {
      valido: boolean;
      mensaje: string;
    };

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
        return res.status(422).json({ msg: 'El apellido solo puede contener letras (mayúsculas y minúsculas), tildes y apóstrofes. No se permiten caracteres especiales como @, #, $, %, etc.' });
      }
    }

    if (!esEmailValido(email)) {
      return res.status(422).json({ msg: 'La dirección de correo no es válida.' });
    }

    if (fechaNacimiento.length > 0) {
      const resultado = validarFechaNacimiento(fechaNacimiento);
      if (!resultado.valido) {
        return res.status(422).json({ msg: resultado.mensaje });
      }
    }

    /*if (esVacio(genero)) {
      return res.status(422).json({ msg: 'Debe indicar un género.' });
    }*/

    /*if (!dni){
      if (esNumerico(dni)) {
        return res.status(422).json({ msg: 'Solo debe ingresar valores númericos en el campo dni.' });
      }
    }*/

    /* Funciones de validación */

    function esVacio(cadena: string) {
      return cadena.trim() === '';
    }

    function esEmailValido(mail: string) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(mail);
    }

    function validarNombreApellido(cadena: string) {
      const regex = /^[a-zA-ZÀ-ÿ\s'.-]{2,}(?:\s[a-zA-ZÀ-ÿ\s'.-]{2,})*$/;
      return regex.test(cadena);
    }

    function validarFechaNacimiento(fechaNacimiento: string): ResultadoValidacion {
      const fechaIngresada = new Date(fechaNacimiento);
      const fechaActual = new Date();
      // Verificar si la fecha ingresada es válida
      if (isNaN(fechaIngresada.getTime())) {
        return { valido: false, mensaje: 'La fecha ingresada no es válida.' };
      }
      // Comparar usando año, mes y día locales
      if (
        fechaIngresada.getFullYear() > fechaActual.getFullYear() ||
        (fechaIngresada.getFullYear() === fechaActual.getFullYear() && fechaIngresada.getMonth() > fechaActual.getMonth()) ||
        (fechaIngresada.getFullYear() === fechaActual.getFullYear() && fechaIngresada.getMonth() === fechaActual.getMonth() && fechaIngresada.getDate() > fechaActual.getDate())
      ) {
        return { valido: false, mensaje: 'La fecha de nacimiento no puede ser futura.' };
      }
      return { valido: true, mensaje: 'La fecha de nacimiento es válida.' };
    }
    const body = req.body;
    body.fechaNacimiento = new Date(req.body.fechaNacimiento);
    try {
      const newPerfil = await prisma.perfil.create({
        data: req.body,
      });

      res.status(200).json({ msg: 'Perfil creado correctamente' });
    } catch (error: any) {
      res.status(500).json({ msg: 'Error al crear el perfil.', detail: error.message });
    }
  },

  //Update Perfil
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    let { principal, nombre, apellido, dni, genero, direccion, email, fechaNacimiento, fechaBaja } = req.body;
    fechaNacimiento = new Date(fechaNacimiento);
    if (fechaBaja) fechaBaja = new Date(fechaBaja);
    try {
      const perfilActualizado = await prisma.perfil.update({
        where: { idPerfil: parseInt(id) },
        data: { principal, nombre, apellido, dni, genero, direccion, email, fechaNacimiento, fechaBaja },
      });
      res.status(200).json({msg: 'Perfil actualizado correctamente.' });
    } catch (error: any) {
      res.status(500).json({ msg: 'Error al actualizar el perfil.', detail: error.message });
    }
  },

  // Obtener perfiles de una cuenta (getById)
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        res.json({ msg: 'Se ha encontrado el registro', data: await perfilRepository.findById(Number(id), decodeURIComponent(req.url))});
    } catch (error: any) {
        res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
    }
  },
}
