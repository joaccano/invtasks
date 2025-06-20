import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export interface CustomRequest extends Request {
  firebaseUID?: string;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUID = decodedToken.uid;
    next();
  } catch (error: any) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
