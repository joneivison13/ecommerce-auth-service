import express from "express";
import HelloWorldController from "../../controllers/helloWorld";
import AuthController from "../../controllers/auth.controller";
import HealthController from "../../controllers/health.controller";

const router = express.Router();

/* ----------- CONTROLLERS ----------- */
const helloWorld = new HelloWorldController();
const authController = new AuthController();
const healthController = new HealthController();

router.get("/", helloWorld.handle);
router.get("/health", healthController.handle);

router.post("/login", authController.login);
router.post("/signup", authController.signin);
router.post("/confirm-signup", authController.confirmSignUp);
router.post("/resend-confirmation-code", authController.resendConfirmationCode);
router.post("/forgot-password", authController.forgotPassword);
router.post("/confirm-forgot-password", authController.confirmForgotPassword);
router.post("/logout", authController.logout);

export { router };
