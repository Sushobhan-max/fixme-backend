import express from "express";
import { verifyPassword } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { verifyPasswordSchema } from "../validators/auth.validator";
import { verifyPassLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/", verifyPassLimiter, validate(verifyPasswordSchema), verifyPassword);
export default router;