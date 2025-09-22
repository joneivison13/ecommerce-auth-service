import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from "./infra/http/routes";
import morgan, { myStream } from "./infra/http/middlewares/morgan";
import errorsMiddleware from "./infra/http/middlewares/errors";

const app = express();

app.use(express.json());
app.use(morgan("DefaultFormat", { stream: myStream }));

app.use(
  helmet({
    crossOriginResourcePolicy: false, // ou ajuste conforme necessário
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // exemplo de configuração
    crossOriginEmbedderPolicy: false, // permite embedding cross-origin
  }),
);

app.use(
  cors({
    origin: process.env.CORS_URLS?.split(";"),
    credentials: true, // permite cookies e credenciais
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(router);
app.use("/file", express.static(process.env.UPLOADS_PATH as string));

app.use(errorsMiddleware.handle);

export { app };
