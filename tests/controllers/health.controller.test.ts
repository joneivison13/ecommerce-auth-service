import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import HealthController from "../../src/controllers/health.controller";

// Mock simples do QueueHelper
jest.mock("../../src/infra/queue", () => {
  const mockHelper = {
    isConnected: true,
  };
  return {
    QueueHelper: mockHelper,
  };
});

import { QueueHelper } from "../../src/infra/queue";

interface MockResponseData {
  status?: string;
  timestamp?: string;
  uptime?: number;
  services?: {
    queue?: {
      connected?: boolean;
      status?: string;
      error?: string;
    };
  };
}

describe("HealthController", () => {
  let healthController: HealthController;
  let mockRequest: Record<string, unknown>;
  let mockResponse: Record<string, jest.Mock>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    healthController = new HealthController();

    mockRequest = {};

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Reset QueueHelper mock
    (QueueHelper as unknown as Record<string, unknown>).isConnected = true;
  });

  describe("Constructor", () => {
    test("should create an instance of HealthController", () => {
      expect(healthController).toBeInstanceOf(HealthController);
    });

    test("should have handle method", () => {
      expect(typeof healthController.handle).toBe("function");
    });
  });

  describe("handle", () => {
    it("should return success response when queue is connected", async () => {
      (QueueHelper as unknown as Record<string, unknown>).isConnected = true;

      const result = await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "ok",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: {
          queue: {
            connected: true,
            status: "healthy",
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it("should return success response when queue is disconnected", async () => {
      (QueueHelper as unknown as Record<string, unknown>).isConnected = false;

      const result = await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "ok",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: {
          queue: {
            connected: false,
            status: "disconnected",
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it("should handle Error instance in catch block", async () => {
      // Force an error by making QueueHelper throw
      Object.defineProperty(QueueHelper, "isConnected", {
        get: () => {
          throw new Error("Connection failed");
        },
        configurable: true,
      });

      const result = await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: {
          queue: {
            connected: false,
            status: "error",
            error: "Connection failed",
          },
        },
      });
      expect(result).toBe(mockResponse);

      // Reset mock
      Object.defineProperty(QueueHelper, "isConnected", {
        value: true,
        configurable: true,
        writable: true,
      });
    });

    it("should handle unknown error in catch block", async () => {
      // Force an error by making QueueHelper throw non-Error
      Object.defineProperty(QueueHelper, "isConnected", {
        get: () => {
          throw "Unknown error";
        },
        configurable: true,
      });

      const result = await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: {
          queue: {
            connected: false,
            status: "error",
            error: "Unknown error",
          },
        },
      });
      expect(result).toBe(mockResponse);

      // Reset mock
      Object.defineProperty(QueueHelper, "isConnected", {
        value: true,
        configurable: true,
        writable: true,
      });
    });
  });

  describe("Response validation", () => {
    it("should return valid timestamp format", async () => {
      await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      const callArgs = mockJson.mock.calls[0][0] as MockResponseData;
      const timestamp = new Date(callArgs.timestamp!);

      expect(timestamp).toBeInstanceOf(Date);
      expect(callArgs.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should return valid uptime", async () => {
      await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      const callArgs = mockJson.mock.calls[0][0] as MockResponseData;
      expect(typeof callArgs.uptime).toBe("number");
      expect(callArgs.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should handle falsy queue status", async () => {
      (QueueHelper as unknown as Record<string, unknown>).isConnected =
        undefined;

      await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      const callArgs = mockJson.mock.calls[0][0] as MockResponseData;
      expect(callArgs.services?.queue?.connected).toBe(undefined);
      expect(callArgs.services?.queue?.status).toBe("disconnected");
    });

    it("should handle null queue status", async () => {
      (QueueHelper as unknown as Record<string, unknown>).isConnected = null;

      await healthController.handle(
        mockRequest as never,
        mockResponse as never,
      );

      const callArgs = mockJson.mock.calls[0][0] as MockResponseData;
      expect(callArgs.services?.queue?.connected).toBe(null);
      expect(callArgs.services?.queue?.status).toBe("disconnected");
    });
  });
});
