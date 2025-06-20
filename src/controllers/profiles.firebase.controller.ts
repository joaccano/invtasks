import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest } from "../middlewares/authFirebaseMiddleware";
const prisma = new PrismaClient();

// Obtener todos los perfiles
export const getProfiles = async (req: CustomRequest, res: Response) => {
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { firebaseId: req.firebaseUID },
    });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const cuenta = await prisma.cuenta.findFirst({
      where: { idUsuario: usuario.idUsuario },
    });
    if (!cuenta) {
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    const profiles = await prisma.perfil.findMany({
      where: { idCuenta: cuenta.idCuenta },
    });
    res.status(200).json({ msg: "perfiles encontrados", profiles });
  } catch (error: any) {
    console.log("error:", error);
    res.status(500).json({ msg: "Error en el servidor", detail: error.message });
  }
};

// Agregar un nuevo perfil
export const addProfile = async (req: CustomRequest, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { firebaseId: req.firebaseUID as string },
    });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const { nombre, apellido, dni, genero, direccion, email, fechaNacimiento } =
      req.body;
    if (
      !nombre ||
      !apellido ||
      !dni ||
      !genero ||
      !direccion ||
      !fechaNacimiento
    ) {
      return res.status(400).json({ msg: "Faltan atributtos requeridos" });
    }

    let cuenta = await prisma.cuenta.findFirst({
      where: { idUsuario: usuario.idUsuario },
    });
    if (!cuenta) {
      cuenta = await prisma.cuenta.create({
        data: {
          idUsuario: usuario.idUsuario,
        },
      });
    }

    // principal?
    const profiles = await prisma.perfil.findMany({
      where: { idCuenta: cuenta.idCuenta },
    });
    let principal = true;
    if (profiles.length > 0) {
      principal = false;
    }

    const profile = await prisma.perfil.create({
      data: {
        idCuenta: cuenta.idCuenta,
        principal,
        nombre,
        apellido,
        dni: dni,
        genero,
        direccion,
        email,
        fechaNacimiento: new Date(fechaNacimiento),
      },
    });
    res.status(201).json({ message: "Perfil creado exitosamente", profile });
  } catch (error: any) {
    console.log("error:", error);
    res.status(500).json({ msg: "Error en el servidor", detail: error.message });
  }
};
