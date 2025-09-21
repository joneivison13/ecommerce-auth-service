import { QueueService } from "./index";
import logger from "../../utils/logger";

export class QueueHelper {
  private static getQueueService(): QueueService {
    return QueueService.getInstance();
  }

  static async ensureInitialized(): Promise<void> {
    const queueService = this.getQueueService();
    if (!queueService.connectionStatus) {
      logger.info("Queue Service not connected, attempting to initialize...");
      try {
        await queueService.initialize();
        logger.info("Queue Service initialized successfully");
      } catch (error) {
        logger.error("Failed to initialize Queue Service:", error);
        throw new Error("Queue service is not available");
      }
    }
  }

  static async sendUserSignupMessage(payload: unknown): Promise<void> {
    try {
      await this.ensureInitialized();
      const queueService = this.getQueueService();
      return queueService.sendUserSignupMessage(payload);
    } catch (error) {
      logger.error("Failed to send user signup message:", error);
      // Em produção, você pode decidir se quer falhar silenciosamente ou relançar o erro
      throw error;
    }
  }

  static async sendUserLoginMessage(payload: unknown): Promise<void> {
    try {
      await this.ensureInitialized();
      const queueService = this.getQueueService();
      return queueService.sendUserLoginMessage(payload);
    } catch (error) {
      logger.error("Failed to send user login message:", error);
      // Em produção, você pode decidir se quer falhar silenciosamente ou relançar o erro
      throw error;
    }
  }

  static get isConnected(): boolean {
    const queueService = this.getQueueService();
    return queueService.connectionStatus;
  }
}
