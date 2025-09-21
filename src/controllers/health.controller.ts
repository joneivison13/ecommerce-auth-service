import { Request, Response } from "express";
import { QueueHelper } from "../infra/queue";

export default class HealthController {
  constructor() {
    this.handle = this.handle.bind(this);
  }

  async handle(
    req: Request,
    res: Response,
  ): Promise<Response<unknown, Record<string, unknown>>> {
    try {
      const queueStatus = QueueHelper.isConnected;

      return res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          queue: {
            connected: queueStatus,
            status: queueStatus ? "healthy" : "disconnected",
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          queue: {
            connected: false,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });
    }
  }
}
