import * as amqp from "amqplib";
import { queueConfig } from "../../config/queue.config";
import logger from "../../utils/logger";
import crypto from "crypto";

export class AmazonMQClient {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;
  private connectionUrl: string;

  constructor() {
    // Construir URL de conexão para RabbitMQ (AMQP 0-9-1)
    this.connectionUrl = `amqps://${queueConfig.username}:${
      queueConfig.password
    }@${queueConfig.host}:${queueConfig.port}${queueConfig.virtualHost || "/"}`;

    logger.info("Amazon MQ Client initialized with URL:", {
      host: queueConfig.host,
      port: queueConfig.port,
      username: queueConfig.username,
      virtualHost: queueConfig.virtualHost || "/",
    });
  }

  async connect(): Promise<void> {
    try {
      if (this.isConnected && this.connection && this.channel) {
        logger.info("Already connected to Amazon MQ");
        return;
      }

      logger.info("🔄 Connecting to Amazon MQ RabbitMQ...");

      // Conectar ao RabbitMQ
      this.connection = await amqp.connect(this.connectionUrl, {
        heartbeat: 60,
        timeout: 10000,
      });

      // Criar canal
      this.channel = await this.connection.createChannel();

      // Configurar event listeners
      this.setupEventHandlers();

      this.isConnected = true;
      logger.info("✅ Successfully connected to Amazon MQ RabbitMQ");
    } catch (error) {
      this.isConnected = false;
      logger.error("❌ Failed to connect to Amazon MQ:", error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (this.connection) {
      this.connection.on("error", error => {
        this.isConnected = false;
        logger.error("❌ Amazon MQ connection error:", error);
      });

      this.connection.on("close", () => {
        this.isConnected = false;
        logger.warn("⚠️ Amazon MQ connection closed");
      });
    }

    if (this.channel) {
      this.channel.on("error", error => {
        logger.error("❌ Amazon MQ channel error:", error);
      });

      this.channel.on("close", () => {
        logger.warn("⚠️ Amazon MQ channel closed");
      });
    }
  }

  async sendMessage(
    queueName: string,
    message: {
      id?: string;
      type: string;
      payload: unknown;
      retryCount?: number;
    },
  ): Promise<void> {
    if (!this.isConnected || !this.channel) {
      throw new Error("Not connected to Amazon MQ");
    }

    try {
      // Garantir que a fila existe
      await this.channel.assertQueue(queueName, {
        durable: true, // Fila persistente
      });

      const messageBuffer = Buffer.from(JSON.stringify(message));

      // Enviar mensagem
      const sent = this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true, // Mensagem persistente
        timestamp: Date.now(),
        messageId:
          message.id ||
          `msg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        contentType: "application/json",
      });

      if (sent) {
        logger.info(`📤 Message sent to queue: ${queueName}`, {
          messageId: message.id,
          messageType: message.type,
        });
      } else {
        throw new Error("Failed to send message - queue is full");
      }
    } catch (error) {
      logger.error("❌ Error sending message to Amazon MQ:", error);
      throw error;
    }
  }

  async consumeMessages(
    queueName: string,
    callback: (message: unknown) => Promise<void>,
  ): Promise<void> {
    if (!this.isConnected || !this.channel) {
      throw new Error("Not connected to Amazon MQ");
    }

    try {
      // Garantir que a fila existe
      await this.channel.assertQueue(queueName, {
        durable: true,
      });

      // Configurar prefetch para processar uma mensagem por vez
      await this.channel.prefetch(1);

      // Consumir mensagens
      await this.channel.consume(queueName, async msg => {
        if (msg) {
          try {
            const messageContent = JSON.parse(msg.content.toString());

            logger.info(`📥 Processing message from queue: ${queueName}`, {
              messageId: msg.properties.messageId,
            });

            await callback(messageContent);

            // Acknowledge da mensagem após processamento bem-sucedido
            this.channel?.ack(msg);

            logger.info(
              `✅ Message processed successfully from queue: ${queueName}`,
            );
          } catch (error) {
            logger.error(
              `❌ Error processing message from queue: ${queueName}`,
              error,
            );

            // Rejeitar mensagem e não reenviar (dead letter)
            this.channel?.nack(msg, false, false);
          }
        }
      });

      logger.info(`👂 Started consuming messages from queue: ${queueName}`);
    } catch (error) {
      logger.error("❌ Error setting up message consumer:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
        logger.info("✅ Amazon MQ channel closed");
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
        logger.info("✅ Amazon MQ connection closed");
      }

      this.isConnected = false;
    } catch (error) {
      logger.error("❌ Error closing Amazon MQ connection:", error);
      throw error;
    }
  }

  get connectionStatus(): boolean {
    return this.isConnected;
  }
}
