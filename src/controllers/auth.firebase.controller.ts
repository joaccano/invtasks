import { Response } from "express";
import { PrismaClient, Usuario } from "@prisma/client";
import { CustomRequest } from "../middlewares/authFirebaseMiddleware";
const prisma = new PrismaClient();

export const createUser = async (req: CustomRequest, res: Response) => {
  try {
    const { email, firebaseId } = req.body as Usuario;
    if (!email || !firebaseId) {
      res.status(400).json({ msg: "Email y firebaseId son requeridos" });
    }
    const usuario = await prisma.usuario.findUnique({
      where: { firebaseId: firebaseId as string },
    });
    if (!usuario) {
      await prisma.usuario.create({
        data: {
          idRol: 1,
          nombreUsuario: "",
          contrasenia: "",
          email: email,
          firebaseId: firebaseId,
        },
      });
    }
    res.status(201).json({ msg: "User created successfully" });
  } catch (error: any) {
    console.log("error:", error);
    res.status(500).json({ msg: "Error en el servidor", detail: error.message });
  }
};

// Endpoint para loguearse
export const logIn = async (req: CustomRequest, res: Response) => {
  try {
    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { firebaseId: req.firebaseUID },
    });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualizar la fecha del último login
    await prisma.usuario.update({
      where: { firebaseId: req.firebaseUID },
      data: { fechaUltimoLogin: new Date() },
    });

    // Retornar el token o información de usuario
    return res.status(200).json({
      message: "Logueo exitoso",
      usuario: {
        id: usuario.idUsuario,
        email: usuario.email,
        firebaseUID: usuario.firebaseId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ msg: "Error en el servidor", detail: error.message });
  }
};
