import { Request, Response } from "express";
import AppError from "../../../utils/error";
import logger from "../../../utils/logger";

export default class errorsMiddleware {
  static handle(
    error: Error & Partial<AppError>,
    req: Request,
    res: Response,
  ): Response {
    logger.error(JSON.stringify(error.message, null, 2));

    let errorMessage;
    if (
      String(error).startsWith("{") ||
      error.message?.startsWith("{") ||
      String(error).startsWith("[") ||
      error.message?.startsWith("[")
    ) {
      errorMessage = JSON.parse(error.message);
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = error;
    }

    return res.status(error.statusCode ?? 400).json({
      error: errorMessage,
    });
  }
}
