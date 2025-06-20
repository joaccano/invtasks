import express from "express";
import authMiddleware from "../middlewares/authFirebaseMiddleware";
import { createUser, logIn } from "../controllers/auth.firebase.controller";
import {
  addProfile,
  getProfiles,
} from "../controllers/profiles.firebase.controller";

const router = express.Router();

// auth
router.post("/auth/create-user", [authMiddleware], createUser);
router.post("/auth/login-user", [authMiddleware], logIn);

// profiles
router.get("/user/profiles", [authMiddleware], getProfiles);
router.post("/user/profiles", [authMiddleware], addProfile);

export default router;
