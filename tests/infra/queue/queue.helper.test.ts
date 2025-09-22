/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable sonarjs/no-duplicate-string */
import { QueueHelper } from "../../../src/infra/queue/queue.helper";
import { QueueService } from "../../../src/infra/queue";
import logger from "../../../src/utils/logger";

// Mock all dependencies
jest.mock("../../../src/infra/queue", () => ({
  QueueService: {
    getInstance: jest.fn(),
  },
}));

jest.mock("../../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const mockedQueueService = QueueService as jest.Mocked<typeof QueueService>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("QueueHelper", () => {
  let mockQueueServiceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock QueueService instance
    mockQueueServiceInstance = {
      connectionStatus: false,
      initialize: jest.fn(),
      sendUserSignupMessage: jest.fn(),
      sendUserLoginMessage: jest.fn(),
    };

    mockedQueueService.getInstance.mockReturnValue(mockQueueServiceInstance);
  });

  describe("getQueueService", () => {
    it("should return QueueService instance", () => {
      // Access private method through public method for testing
      const result = (QueueHelper as any).getQueueService();

      expect(mockedQueueService.getInstance).toHaveBeenCalled();
      expect(result).toBe(mockQueueServiceInstance);
    });
  });

  describe("ensureInitialized", () => {
    it("should not initialize when already connected", async () => {
      mockQueueServiceInstance.connectionStatus = true;

      await QueueHelper.ensureInitialized();

      expect(mockQueueServiceInstance.initialize).not.toHaveBeenCalled();
      expect(mockedLogger.info).not.toHaveBeenCalled();
    });

    it("should initialize when not connected", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockResolvedValue(undefined);

      await QueueHelper.ensureInitialized();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Queue Service not connected, attempting to initialize...",
      );
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Queue Service initialized successfully",
      );
    });

    it("should handle initialization errors", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      const initError = new Error("Initialization failed");
      mockQueueServiceInstance.initialize.mockRejectedValue(initError);

      await expect(QueueHelper.ensureInitialized()).rejects.toThrow(
        "Queue service is not available",
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Queue Service not connected, attempting to initialize...",
      );
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to initialize Queue Service:",
        initError,
      );
    });

    it("should throw custom error message on initialization failure", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockRejectedValue(
        new Error("Some error"),
      );

      await expect(QueueHelper.ensureInitialized()).rejects.toThrow(
        "Queue service is not available",
      );
    });
  });

  describe("sendUserSignupMessage", () => {
    const testPayload = { userId: "123", email: "test@example.com" };

    it("should send signup message successfully", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      mockQueueServiceInstance.sendUserSignupMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserSignupMessage(testPayload);

      expect(
        mockQueueServiceInstance.sendUserSignupMessage,
      ).toHaveBeenCalledWith(testPayload);
    });

    it("should initialize service before sending message", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockResolvedValue(undefined);
      mockQueueServiceInstance.sendUserSignupMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserSignupMessage(testPayload);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Queue Service not connected, attempting to initialize...",
      );
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalled();
      expect(
        mockQueueServiceInstance.sendUserSignupMessage,
      ).toHaveBeenCalledWith(testPayload);
    });

    it("should handle initialization errors in sendUserSignupMessage", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      const initError = new Error("Init failed");
      mockQueueServiceInstance.initialize.mockRejectedValue(initError);

      await expect(
        QueueHelper.sendUserSignupMessage(testPayload),
      ).rejects.toThrow("Queue service is not available");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to send user signup message:",
        expect.any(Error),
      );
    });

    it("should handle send message errors and propagate them", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      const sendError = new Error("Send failed");
      mockQueueServiceInstance.sendUserSignupMessage.mockRejectedValue(
        sendError,
      );

      await expect(QueueHelper.sendUserSignupMessage(testPayload)).rejects.toBe(
        sendError,
      );
    });

    it("should propagate errors from sendUserSignupMessage", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      const originalError = new Error("Original error");
      mockQueueServiceInstance.sendUserSignupMessage.mockRejectedValue(
        originalError,
      );

      await expect(QueueHelper.sendUserSignupMessage(testPayload)).rejects.toBe(
        originalError,
      );
    });
  });

  describe("sendUserLoginMessage", () => {
    const testPayload = { userId: "456", sessionId: "sess-123" };

    it("should send login message successfully", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      mockQueueServiceInstance.sendUserLoginMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserLoginMessage(testPayload);

      expect(
        mockQueueServiceInstance.sendUserLoginMessage,
      ).toHaveBeenCalledWith(testPayload);
    });

    it("should initialize service before sending login message", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockResolvedValue(undefined);
      mockQueueServiceInstance.sendUserLoginMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserLoginMessage(testPayload);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Queue Service not connected, attempting to initialize...",
      );
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalled();
      expect(
        mockQueueServiceInstance.sendUserLoginMessage,
      ).toHaveBeenCalledWith(testPayload);
    });

    it("should handle initialization errors in sendUserLoginMessage", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      const initError = new Error("Init failed");
      mockQueueServiceInstance.initialize.mockRejectedValue(initError);

      await expect(
        QueueHelper.sendUserLoginMessage(testPayload),
      ).rejects.toThrow("Queue service is not available");

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Failed to send user login message:",
        expect.any(Error),
      );
    });

    it("should handle send login message errors and propagate them", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      const sendError = new Error("Login send failed");
      mockQueueServiceInstance.sendUserLoginMessage.mockRejectedValue(
        sendError,
      );

      await expect(QueueHelper.sendUserLoginMessage(testPayload)).rejects.toBe(
        sendError,
      );
    });

    it("should propagate errors from sendUserLoginMessage", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      const originalError = new Error("Original login error");
      mockQueueServiceInstance.sendUserLoginMessage.mockRejectedValue(
        originalError,
      );

      await expect(QueueHelper.sendUserLoginMessage(testPayload)).rejects.toBe(
        originalError,
      );
    });
  });

  describe("isConnected getter", () => {
    it("should return true when queue service is connected", () => {
      mockQueueServiceInstance.connectionStatus = true;

      const result = QueueHelper.isConnected;

      expect(mockedQueueService.getInstance).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false when queue service is not connected", () => {
      mockQueueServiceInstance.connectionStatus = false;

      const result = QueueHelper.isConnected;

      expect(mockedQueueService.getInstance).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it("should call getQueueService to get connection status", () => {
      QueueHelper.isConnected;

      expect(mockedQueueService.getInstance).toHaveBeenCalled();
    });
  });

  describe("edge cases and error scenarios", () => {
    it("should handle multiple ensureInitialized calls", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockResolvedValue(undefined);

      // First call should initialize
      await QueueHelper.ensureInitialized();
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalledTimes(1);

      // Set as connected for second call
      mockQueueServiceInstance.connectionStatus = true;

      // Second call should not initialize again
      await QueueHelper.ensureInitialized();
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalledTimes(1);
    });

    it("should handle null/undefined payloads in sendUserSignupMessage", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      mockQueueServiceInstance.sendUserSignupMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserSignupMessage(null);
      expect(
        mockQueueServiceInstance.sendUserSignupMessage,
      ).toHaveBeenCalledWith(null);

      await QueueHelper.sendUserSignupMessage(undefined);
      expect(
        mockQueueServiceInstance.sendUserSignupMessage,
      ).toHaveBeenCalledWith(undefined);
    });

    it("should handle null/undefined payloads in sendUserLoginMessage", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      mockQueueServiceInstance.sendUserLoginMessage.mockResolvedValue(
        undefined,
      );

      await QueueHelper.sendUserLoginMessage(null);
      expect(
        mockQueueServiceInstance.sendUserLoginMessage,
      ).toHaveBeenCalledWith(null);

      await QueueHelper.sendUserLoginMessage(undefined);
      expect(
        mockQueueServiceInstance.sendUserLoginMessage,
      ).toHaveBeenCalledWith(undefined);
    });

    it("should handle complex payload objects", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      mockQueueServiceInstance.sendUserSignupMessage.mockResolvedValue(
        undefined,
      );

      const complexPayload = {
        user: {
          id: "123",
          profile: { name: "Test", settings: { theme: "dark" } },
        },
        metadata: [1, 2, 3],
        timestamp: new Date(),
      };

      await QueueHelper.sendUserSignupMessage(complexPayload);
      expect(
        mockQueueServiceInstance.sendUserSignupMessage,
      ).toHaveBeenCalledWith(complexPayload);
    });

    it("should maintain singleton pattern for QueueService", () => {
      // Call multiple times to ensure singleton is maintained
      QueueHelper.isConnected;
      QueueHelper.isConnected;
      QueueHelper.isConnected;

      expect(mockedQueueService.getInstance).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent initialization attempts", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockResolvedValue(undefined);

      // Simulate concurrent calls
      const promises = [
        QueueHelper.ensureInitialized(),
        QueueHelper.ensureInitialized(),
        QueueHelper.ensureInitialized(),
      ];

      await Promise.all(promises);

      // Each call should attempt initialization since we're mocking the service fresh each time
      expect(mockQueueServiceInstance.initialize).toHaveBeenCalledTimes(3);
    });
  });

  describe("error message consistency", () => {
    it("should throw consistent error message format for initialization failures", async () => {
      mockQueueServiceInstance.connectionStatus = false;
      mockQueueServiceInstance.initialize.mockRejectedValue(
        new Error("Network timeout"),
      );

      try {
        await QueueHelper.ensureInitialized();
        fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Queue service is not available");
      }
    });

    it("should preserve original error types in message sending", async () => {
      mockQueueServiceInstance.connectionStatus = true;
      const customError = new TypeError("Invalid payload type");
      mockQueueServiceInstance.sendUserSignupMessage.mockRejectedValue(
        customError,
      );

      try {
        await QueueHelper.sendUserSignupMessage("test");
        fail("Should have thrown error");
      } catch (error) {
        expect(error).toBe(customError);
        expect(error).toBeInstanceOf(TypeError);
      }
    });
  });
});
