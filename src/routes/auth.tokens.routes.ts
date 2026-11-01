import express from "express";
import { refreshTokenFunc } from "../controllers/auth.controller";

const router = express.Router();

router.post("/", refreshTokenFunc);
export default router;