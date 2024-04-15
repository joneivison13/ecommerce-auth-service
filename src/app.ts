import express from "express";
import cors from "cors";
import { router } from "./infra/http/routes";
import morgan, { myStream } from "./infra/http/middlewares/morgan";
import errorsMiddleware from "./infra/http/middlewares/errors";

const app = express();

app.use(express.json());
app.use(morgan("DefaultFormat", { stream: myStream }));
app.use(
  cors({
    origin: process.env.CORS_URLS?.split(";"),
  })
);
app.use(router);
app.use("/file", express.static(process.env.UPLOADS_PATH as string));

app.use(errorsMiddleware.handle);

export { app };
