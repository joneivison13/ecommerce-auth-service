/* eslint-disable sonarjs/no-duplicate-string */
import { AmazonMQClient } from "../../../src/infra/queue/amazon-mq.client";
import * as amqp from "amqplib";
import { queueConfig } from "../../../src/config/queue.config";
import logger from "../../../src/utils/logger";
import crypto from "crypto";

// Mock all dependencies
jest.mock("amqplib");
jest.mock("../../../src/config/queue.config", () => ({
  queueConfig: {
    username: "test-username",
    password: "test-password",
    host: "test-host.amazonaws.com",
    port: 5671,
    virtualHost: "/test",
  },
}));
jest.mock("../../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock("crypto");

const mockedAmqp = amqp as jest.Mocked<typeof amqp>;
const mockedLogger = logger as jest.Mocked<typeof logger>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;

interface MockConnection {
  createChannel: jest.Mock;
  on: jest.Mock;
  close: jest.Mock;
}

interface MockChannel {
  assertQueue: jest.Mock;
  sendToQueue: jest.Mock;
  consume: jest.Mock;
  prefetch: jest.Mock;
  ack: jest.Mock;
  nack: jest.Mock;
  on: jest.Mock;
  close: jest.Mock;
}

describe("AmazonMQClient", () => {
  let amazonMQClient: AmazonMQClient;
  let mockConnection: MockConnection;
  let mockChannel: MockChannel;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock connection
    mockConnection = {
      createChannel: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    };

    // Setup mock channel
    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
      prefetch: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    };

    mockedAmqp.connect.mockResolvedValue(mockConnection as any);
    mockConnection.createChannel.mockResolvedValue(mockChannel as any);

    amazonMQClient = new AmazonMQClient();
  });

  describe("constructor", () => {
    it("should initialize with correct connection URL", () => {
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Amazon MQ Client initialized with URL:",
        {
          host: "test-host.amazonaws.com",
          port: 5671,
          username: "test-username",
          virtualHost: "/test",
        },
      );
    });

    it("should handle virtualHost as default '/' when not provided", () => {
      const originalVirtualHost = queueConfig.virtualHost;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (queueConfig as any).virtualHost = undefined;

      new AmazonMQClient();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Amazon MQ Client initialized with URL:",
        expect.objectContaining({
          virtualHost: "/",
        }),
      );

      // Restore original value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (queueConfig as any).virtualHost = originalVirtualHost;
    });

    it("should set initial connection status to false", () => {
      expect(amazonMQClient.connectionStatus).toBe(false);
    });
  });

  describe("connect", () => {
    it("should connect successfully to Amazon MQ", async () => {
      await amazonMQClient.connect();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "🔄 Connecting to Amazon MQ RabbitMQ...",
      );
      expect(mockedAmqp.connect).toHaveBeenCalledWith(
        "amqps://test-username:test-password@test-host.amazonaws.com:5671/test",
        {
          heartbeat: 60,
          timeout: 10000,
        },
      );
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "✅ Successfully connected to Amazon MQ RabbitMQ",
      );
      expect(amazonMQClient.connectionStatus).toBe(true);
    });

    it("should not reconnect if already connected", async () => {
      // First connection
      await amazonMQClient.connect();
      jest.clearAllMocks();

      // Second connection attempt
      await amazonMQClient.connect();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Already connected to Amazon MQ",
      );
      expect(mockedAmqp.connect).not.toHaveBeenCalled();
    });

    it("should handle connection errors", async () => {
      const error = new Error("Connection failed");
      mockedAmqp.connect.mockRejectedValue(error);

      await expect(amazonMQClient.connect()).rejects.toThrow(
        "Connection failed",
      );

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Failed to connect to Amazon MQ:",
        error,
      );
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should setup event handlers after successful connection", async () => {
      await amazonMQClient.connect();

      expect(mockConnection.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        "close",
        expect.any(Function),
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        "close",
        expect.any(Function),
      );
    });
  });

  describe("setupEventHandlers", () => {
    beforeEach(async () => {
      await amazonMQClient.connect();
    });

    it("should handle connection error events", () => {
      const errorHandler = mockConnection.on.mock.calls.find(
        (call: any) => call[0] === "error",
      )?.[1];
      const error = new Error("Connection error");

      errorHandler(error);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Amazon MQ connection error:",
        error,
      );
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should handle connection close events", () => {
      const closeHandler = mockConnection.on.mock.calls.find(
        (call: any) => call[0] === "close",
      )?.[1];

      closeHandler();

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "⚠️ Amazon MQ connection closed",
      );
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should handle channel error events", () => {
      const errorHandler = mockChannel.on.mock.calls.find(
        (call: any) => call[0] === "error",
      )?.[1];
      const error = new Error("Channel error");

      errorHandler(error);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Amazon MQ channel error:",
        error,
      );
    });

    it("should handle channel close events", () => {
      const closeHandler = mockChannel.on.mock.calls.find(
        (call: any) => call[0] === "close",
      )?.[1];

      closeHandler();

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "⚠️ Amazon MQ channel closed",
      );
    });
  });

  describe("sendMessage", () => {
    const testMessage = {
      id: "test-id",
      type: "TEST_TYPE",
      payload: { data: "test" },
      retryCount: 0,
    };

    beforeEach(async () => {
      await amazonMQClient.connect();
      mockChannel.sendToQueue.mockReturnValue(true);
      jest.clearAllMocks();
    });

    it("should send message successfully", async () => {
      await amazonMQClient.sendMessage("test-queue", testMessage);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", {
        durable: true,
      });
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        "test-queue",
        Buffer.from(JSON.stringify(testMessage)),
        {
          persistent: true,
          timestamp: expect.any(Number),
          messageId: "test-id",
          contentType: "application/json",
        },
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "📤 Message sent to queue: test-queue",
        {
          messageId: "test-id",
          messageType: "TEST_TYPE",
        },
      );
    });

    it("should generate messageId when not provided", async () => {
      const messageWithoutId: Omit<typeof testMessage, "id"> = {
        type: testMessage.type,
        payload: testMessage.payload,
        retryCount: testMessage.retryCount,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockedCrypto.randomBytes as any).mockReturnValue(
        Buffer.from([0x12, 0x34, 0x56, 0x78]),
      );
      const mockTimestamp = 1234567890000;
      jest.spyOn(Date, "now").mockReturnValue(mockTimestamp);

      await amazonMQClient.sendMessage("test-queue", messageWithoutId);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        "test-queue",
        expect.any(Buffer),
        expect.objectContaining({
          messageId: "msg-1234567890000-12345678",
        }),
      );
    });

    it("should throw error when not connected", async () => {
      const disconnectedClient = new AmazonMQClient();

      await expect(
        disconnectedClient.sendMessage("test-queue", testMessage),
      ).rejects.toThrow("Not connected to Amazon MQ");
    });

    it("should throw error when queue is full", async () => {
      mockChannel.sendToQueue.mockReturnValue(false);

      await expect(
        amazonMQClient.sendMessage("test-queue", testMessage),
      ).rejects.toThrow("Failed to send message - queue is full");
    });

    it("should handle sendToQueue errors", async () => {
      const error = new Error("Send error");
      mockChannel.assertQueue.mockRejectedValue(error);

      await expect(
        amazonMQClient.sendMessage("test-queue", testMessage),
      ).rejects.toThrow("Send error");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error sending message to Amazon MQ:",
        error,
      );
    });
  });

  describe("consumeMessages", () => {
    const mockCallback = jest.fn();

    beforeEach(async () => {
      await amazonMQClient.connect();
      jest.clearAllMocks();
    });

    it("should consume messages successfully", async () => {
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ type: "TEST", payload: "data" })),
        properties: { messageId: "msg-123" },
      };

      mockChannel.consume.mockImplementation(async (queue, consumer) => {
        await consumer(mockMessage);
      });

      await amazonMQClient.consumeMessages("test-queue", mockCallback);

      expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", {
        durable: true,
      });
      expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
      expect(mockCallback).toHaveBeenCalledWith({
        type: "TEST",
        payload: "data",
      });
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "📥 Processing message from queue: test-queue",
        { messageId: "msg-123" },
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "✅ Message processed successfully from queue: test-queue",
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "👂 Started consuming messages from queue: test-queue",
      );
    });

    it("should handle null messages", async () => {
      mockChannel.consume.mockImplementation(async (queue, consumer) => {
        await consumer(null);
      });

      await amazonMQClient.consumeMessages("test-queue", mockCallback);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it("should handle callback errors and nack messages", async () => {
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ type: "TEST", payload: "data" })),
        properties: { messageId: "msg-123" },
      };
      const callbackError = new Error("Callback error");
      mockCallback.mockRejectedValue(callbackError);

      mockChannel.consume.mockImplementation(async (queue, consumer) => {
        await consumer(mockMessage);
      });

      await amazonMQClient.consumeMessages("test-queue", mockCallback);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error processing message from queue: test-queue",
        callbackError,
      );
    });

    it("should handle JSON parse errors", async () => {
      const mockMessage = {
        content: Buffer.from("invalid json"),
        properties: { messageId: "msg-123" },
      };

      mockChannel.consume.mockImplementation(async (queue, consumer) => {
        await consumer(mockMessage);
      });

      await amazonMQClient.consumeMessages("test-queue", mockCallback);

      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error processing message from queue: test-queue",
        expect.any(Error),
      );
    });

    it("should throw error when not connected", async () => {
      const disconnectedClient = new AmazonMQClient();

      await expect(
        disconnectedClient.consumeMessages("test-queue", mockCallback),
      ).rejects.toThrow("Not connected to Amazon MQ");
    });

    it("should handle consumer setup errors", async () => {
      const error = new Error("Consumer error");
      mockChannel.assertQueue.mockRejectedValue(error);

      await expect(
        amazonMQClient.consumeMessages("test-queue", mockCallback),
      ).rejects.toThrow("Consumer error");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error setting up message consumer:",
        error,
      );
    });
  });

  describe("disconnect", () => {
    it("should disconnect successfully", async () => {
      await amazonMQClient.connect();

      await amazonMQClient.disconnect();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "✅ Amazon MQ channel closed",
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "✅ Amazon MQ connection closed",
      );
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should handle disconnection when not connected", async () => {
      await amazonMQClient.disconnect();

      expect(mockChannel.close).not.toHaveBeenCalled();
      expect(mockConnection.close).not.toHaveBeenCalled();
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should handle channel close errors", async () => {
      await amazonMQClient.connect();
      const error = new Error("Close error");
      mockChannel.close.mockRejectedValue(error);

      await expect(amazonMQClient.disconnect()).rejects.toThrow("Close error");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error closing Amazon MQ connection:",
        error,
      );
    });

    it("should handle connection close errors", async () => {
      await amazonMQClient.connect();
      const error = new Error("Close error");
      mockConnection.close.mockRejectedValue(error);

      await expect(amazonMQClient.disconnect()).rejects.toThrow("Close error");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "❌ Error closing Amazon MQ connection:",
        error,
      );
    });

    it("should handle partial disconnection scenarios", async () => {
      await amazonMQClient.connect();

      // Simulate channel already closed
      (amazonMQClient as any).channel = null;

      await amazonMQClient.disconnect();

      expect(mockChannel.close).not.toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
      expect(amazonMQClient.connectionStatus).toBe(false);
    });
  });

  describe("connectionStatus", () => {
    it("should return false initially", () => {
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should return true after successful connection", async () => {
      await amazonMQClient.connect();
      expect(amazonMQClient.connectionStatus).toBe(true);
    });

    it("should return false after disconnection", async () => {
      await amazonMQClient.connect();
      await amazonMQClient.disconnect();
      expect(amazonMQClient.connectionStatus).toBe(false);
    });

    it("should return false after connection error", async () => {
      const error = new Error("Connection failed");
      mockedAmqp.connect.mockRejectedValue(error);

      try {
        await amazonMQClient.connect();
      } catch {
        // Expected error
      }

      expect(amazonMQClient.connectionStatus).toBe(false);
    });
  });

  describe("edge cases and additional coverage", () => {
    it("should handle setupEventHandlers with null connection", async () => {
      const client = new AmazonMQClient();

      // Call setupEventHandlers directly with null connection/channel
      (client as any).setupEventHandlers();

      // Should not throw errors
      expect(mockedLogger.error).not.toHaveBeenCalled();
    });

    it("should handle setupEventHandlers with null channel", async () => {
      await amazonMQClient.connect();
      (amazonMQClient as any).channel = null;

      // Call setupEventHandlers directly
      (amazonMQClient as any).setupEventHandlers();

      // Should only setup connection handlers
      expect(mockConnection.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        "close",
        expect.any(Function),
      );
    });

    it("should handle message without retryCount property", async () => {
      await amazonMQClient.connect();
      mockChannel.sendToQueue.mockReturnValue(true);
      jest.clearAllMocks();

      const messageWithoutRetryCount = {
        id: "test-id",
        type: "TEST_TYPE",
        payload: { data: "test" },
      };

      await amazonMQClient.sendMessage("test-queue", messageWithoutRetryCount);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        "test-queue",
        Buffer.from(JSON.stringify(messageWithoutRetryCount)),
        expect.any(Object),
      );
    });

    it("should handle different payload types in sendMessage", async () => {
      await amazonMQClient.connect();
      mockChannel.sendToQueue.mockReturnValue(true);
      jest.clearAllMocks();

      const messageWithArrayPayload = {
        type: "TEST_TYPE",
        payload: [1, 2, 3],
      };

      await amazonMQClient.sendMessage("test-queue", messageWithArrayPayload);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        "test-queue",
        Buffer.from(JSON.stringify(messageWithArrayPayload)),
        expect.any(Object),
      );
    });
  });
});
