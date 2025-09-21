import logger from "./logger";

export default class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly data?: object;

  constructor(message: string, statusCode = 400, data?: object) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    if (statusCode >= 500) {
      logger.error(this.message);
    } else {
      logger.warn(this.message);
    }
  }
}
