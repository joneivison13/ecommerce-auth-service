import { AmazonMQClient } from "./amazon-mq.client";
import { queueConfig } from "../../config/queue.config";
import logger from "../../utils/logger";
import crypto from "crypto";

export interface QueueMessage {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retryCount?: number;
}

export class QueueService {
  private static instance: QueueService;
  private mqClient: AmazonMQClient;
  private isInitialized: boolean = false;

  private constructor() {
    this.mqClient = new AmazonMQClient();
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info("Queue Service already initialized");
      return;
    }

    try {
      await this.mqClient.connect();
      this.isInitialized = true;
      logger.info("Queue Service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Queue Service:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isInitialized) {
      logger.info("Queue Service was not initialized");
      return;
    }

    try {
      await this.mqClient.disconnect();
      this.isInitialized = false;
      logger.info("Queue Service disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect Queue Service:", error);
      throw error;
    }
  }

  get connectionStatus(): boolean {
    return this.isInitialized && this.mqClient.connectionStatus;
  }

  async sendUserSignupMessage(payload: unknown): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(
        "Queue Service is not initialized. Call initialize() first.",
      );
    }

    const message: QueueMessage = {
      id: this.generateId(),
      type: "USER_SIGNUP",
      payload,
      timestamp: Date.now(),
    };

    await this.mqClient.sendMessage(queueConfig.queues.userSignup, message);

    logger.info("User signup message sent:", message.id);
  }

  async sendUserLoginMessage(payload: unknown): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(
        "Queue Service is not initialized. Call initialize() first.",
      );
    }

    const message: QueueMessage = {
      id: this.generateId(),
      type: "USER_LOGIN",
      payload,
      timestamp: Date.now(),
    };

    await this.mqClient.sendMessage(queueConfig.queues.userLogin, message);

    logger.info("User login message sent:", message.id);
  }

  private generateId(): string {
    return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  }
}

export { QueueHelper } from "./queue.helper";
