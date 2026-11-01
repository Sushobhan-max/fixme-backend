import express from "express";
import { verifySignUp } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { verifySignUpSchema } from "../validators/auth.validator";
import { verifyOtpLimit } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/", verifyOtpLimit, validate(verifySignUpSchema), verifySignUp);

export default router;