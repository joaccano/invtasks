import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import admin from "../config/firebase";

export interface CustomRequest extends Request {
  user?: any;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No se encontró el token" });
  try {
    switch (process.env.TYPE_MIDDLEWARE) {
      case "0":
        await admin.auth().verifyIdToken(token);
        break;
      case "99":
        break;
      default:
        // jwt.verify(token, String(process.env.SECRET_KEY_JWT));
        const payload: any = jwt.decode(token);
        const expTime = new Date(payload.exp);
        const now = new Date();
        if(now.getTime() - expTime.getTime() < 0) return res.status(401).json({ message: "Token vencido" });
        jwt.verify(token, String(process.env.SECRET_KEY_JWT));
        req.user = payload;
    }

    // Despues hacelo como pinte, ahora vayamos rapido por jwt
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // console.log('decodedToken ', decodedToken);
    // req.user = decodedToken;

    next();
  } catch (error: any) {
    return res.status(403).json({ msg: "Token inválido", detail: error.message });
  }
};

export default authMiddleware;
