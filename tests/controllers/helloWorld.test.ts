/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import HelloWorldController from "../../src/controllers/helloWorld";

describe("HelloWorldController", () => {
  let helloWorldController: HelloWorldController;
  let mockRequest: any;
  let mockResponse: any;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    helloWorldController = new HelloWorldController();

    mockRequest = {};

    mockJson = jest.fn().mockReturnThis();

    mockResponse = {
      json: mockJson,
    };
  });

  describe("constructor", () => {
    test("should create an instance of HelloWorldController", () => {
      const controller = new HelloWorldController();
      expect(controller).toBeInstanceOf(HelloWorldController);
      expect(controller).toBeDefined();
    });

    test("should bind handle method to correct context", () => {
      const controller = new HelloWorldController();
      const handleMethod = controller.handle;

      expect(handleMethod).toBeDefined();
      expect(typeof handleMethod).toBe("function");
    });
  });

  describe("handle", () => {
    test("should return Hello World message", async () => {
      const result = await helloWorldController.handle(
        mockRequest,
        mockResponse,
      );

      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({ message: "Hello, World!" });
      expect(result).toBe(mockResponse);
    });

    test("should handle different request objects", async () => {
      const customRequest = { query: { test: "value" } };

      const result = await helloWorldController.handle(
        customRequest as never,
        mockResponse,
      );

      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({ message: "Hello, World!" });
      expect(result).toBe(mockResponse);
    });

    test("should return consistent response structure", async () => {
      await helloWorldController.handle(mockRequest, mockResponse);

      const calledWith = mockJson.mock.calls[0][0] as { message: string };
      expect(calledWith).toHaveProperty("message");
      expect(typeof calledWith.message).toBe("string");
      expect(calledWith.message).toBe("Hello, World!");
    });

    test("should work when method is bound", async () => {
      const { handle } = helloWorldController;

      const result = await handle(mockRequest, mockResponse);

      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({ message: "Hello, World!" });
      expect(result).toBe(mockResponse);
    });

    test("should return a Promise", () => {
      const result = helloWorldController.handle(mockRequest, mockResponse);
      expect(result).toBeInstanceOf(Promise);
    });

    test("should resolve Promise with response object", async () => {
      const promise = helloWorldController.handle(mockRequest, mockResponse);
      await expect(promise).resolves.toBe(mockResponse);
    });

    test("should handle multiple consecutive calls", async () => {
      const result1 = await helloWorldController.handle(
        mockRequest,
        mockResponse,
      );
      const result2 = await helloWorldController.handle(
        mockRequest,
        mockResponse,
      );

      expect(mockJson).toHaveBeenCalledTimes(2);
      expect(result1).toBe(mockResponse);
      expect(result2).toBe(mockResponse);

      mockJson.mock.calls.forEach(call => {
        expect(call[0]).toEqual({ message: "Hello, World!" });
      });
    });

    test("should call json method exactly once per invocation", async () => {
      await helloWorldController.handle(mockRequest, mockResponse);

      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson.mock.calls[0]).toEqual([{ message: "Hello, World!" }]);
    });

    test("should return the exact response object passed to it", async () => {
      const customResponse = {
        json: jest.fn().mockReturnThis(),
      };

      const result = await helloWorldController.handle(
        mockRequest,
        customResponse as never,
      );
      expect(result).toBe(customResponse);
    });
  });

  describe("error handling", () => {
    test("should handle json method throwing error", async () => {
      const errorMessage = "JSON serialization failed";
      mockJson.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(
        helloWorldController.handle(mockRequest, mockResponse),
      ).rejects.toThrow(errorMessage);
    });

    test("should handle response object being null", async () => {
      await expect(
        helloWorldController.handle(mockRequest, null as never),
      ).rejects.toThrow();
    });

    test("should handle response object being undefined", async () => {
      await expect(
        helloWorldController.handle(mockRequest, undefined as never),
      ).rejects.toThrow();
    });
  });
});
