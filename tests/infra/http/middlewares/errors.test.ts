import { Request, Response } from "express";
import errorsMiddleware from "../../../../src/infra/http/middlewares/errors";
import AppError from "../../../../src/utils/error";
import logger from "../../../../src/utils/logger";

// Mock do logger
jest.mock("../../../../src/utils/logger", () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("errorsMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe("Class Structure", () => {
    it("should be a class with static handle method", () => {
      expect(typeof errorsMiddleware).toBe("function");
      expect(typeof errorsMiddleware.handle).toBe("function");
    });

    it("should have handle as static method", () => {
      expect(errorsMiddleware.handle).toBeDefined();
      expect(typeof errorsMiddleware.handle).toBe("function");
    });
  });

  describe("handle method", () => {
    describe("Logger functionality", () => {
      it("should log error message using logger.error", () => {
        const error = new Error("Test error message");

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(logger.error).toHaveBeenCalledWith(
          JSON.stringify(error.message, null, 2),
        );
      });

      it("should log JSON stringified error message", () => {
        const error = new Error("Complex error");

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(logger.error).toHaveBeenCalledWith('"Complex error"');
      });

      it("should handle error without message in logging", () => {
        const error = new Error();
        error.message = "";

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(logger.error).toHaveBeenCalledWith('""');
      });
    });

    describe("JSON Error Message Parsing", () => {
      it("should parse JSON message when error message starts with {", () => {
        const jsonMessage = '{"type":"validation","field":"email"}';
        const error = new Error(jsonMessage);

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: { type: "validation", field: "email" },
        });
      });

      it("should attempt to parse JSON when error string representation starts with { but use message", () => {
        const error = {
          message: "regular message",
          toString: () => '{"error":"custom"}',
        } as Error;

        // This will actually cause an error because it tries to parse "regular message" as JSON
        // But since the condition checks String(error).startsWith("{"), it enters the JSON parsing block
        expect(() => {
          errorsMiddleware.handle(
            error,
            mockRequest as Request,
            mockResponse as Response,
          );
        }).toThrow();
      });

      it("should parse JSON array when error message starts with [", () => {
        const jsonArrayMessage = '["error1","error2"]';
        const error = new Error(jsonArrayMessage);

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: ["error1", "error2"],
        });
      });

      it("should attempt to parse JSON when error string representation starts with [ but use message", () => {
        const error = {
          message: "regular message",
          toString: () => '["validation error","format error"]',
        } as Error;

        // This will also cause an error because it tries to parse "regular message" as JSON
        expect(() => {
          errorsMiddleware.handle(
            error,
            mockRequest as Request,
            mockResponse as Response,
          );
        }).toThrow();
      });

      it("should throw when invalid JSON is encountered", () => {
        const invalidJson = '{"invalid": json}';
        const error = new Error(invalidJson);

        // The middleware doesn't handle invalid JSON gracefully - it throws
        expect(() => {
          errorsMiddleware.handle(
            error,
            mockRequest as Request,
            mockResponse as Response,
          );
        }).toThrow();
      });
    });

    describe("Non-JSON Error Message Handling", () => {
      it("should use error message when it exists and is not JSON", () => {
        const error = new Error("Simple error message");

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: "Simple error message",
        });
      });

      it("should use error object when no message exists", () => {
        const error = new Error();
        error.message = "";

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: error,
        });
      });

      it("should handle error when message is undefined", () => {
        const error = {
          name: "CustomError",
          toString: () => "CustomError: something happened",
        } as Error;

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: error,
        });
      });
    });

    describe("Status Code Handling", () => {
      it("should use statusCode from AppError when available", () => {
        const appError = new AppError("App error", 404);

        errorsMiddleware.handle(
          appError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          error: "App error",
        });
      });

      it("should use default status code 400 when statusCode is not provided", () => {
        const error = new Error("Regular error");

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(400);
      });

      it("should use statusCode from error object when available", () => {
        const error = new Error("Error with status") as Error & {
          statusCode: number;
        };
        error.statusCode = 500;

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(500);
      });

      it("should use statusCode 0 when provided (not consider it falsy)", () => {
        const error = new Error("Error with zero status") as Error & {
          statusCode: number;
        };
        error.statusCode = 0;

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        // The ?? operator only uses default for null/undefined, not 0
        expect(mockStatus).toHaveBeenCalledWith(0);
      });

      it("should handle various status codes", () => {
        const statusCodes = [401, 403, 422, 500, 503];

        statusCodes.forEach(code => {
          jest.clearAllMocks();
          const error = new AppError(`Error ${code}`, code);

          errorsMiddleware.handle(
            error,
            mockRequest as Request,
            mockResponse as Response,
          );

          expect(mockStatus).toHaveBeenCalledWith(code);
        });
      });
    });

    describe("Return Value", () => {
      it("should return the response object", () => {
        const error = new Error("Test error");

        const result = errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(result).toBe(mockResponse);
      });

      it("should return response after chaining status and json calls", () => {
        const error = new AppError("Chaining test", 422);

        const result = errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(422);
        expect(mockJson).toHaveBeenCalledWith({ error: "Chaining test" });
        expect(result).toBe(mockResponse);
      });
    });

    describe("Edge Cases and Complex Scenarios", () => {
      it("should handle nested JSON in error message", () => {
        const nestedJson = '{"outer":{"inner":"value"},"array":[1,2,3]}';
        const error = new Error(nestedJson);

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: {
            outer: { inner: "value" },
            array: [1, 2, 3],
          },
        });
      });

      it("should handle mixed object and array JSON detection", () => {
        const error1 = new Error('{"type":"object"}');
        const error2 = {
          message: '["array","items"]',
          toString: () => '["array","items"]',
        } as Error;

        errorsMiddleware.handle(
          error1,
          mockRequest as Request,
          mockResponse as Response,
        );
        expect(mockJson).toHaveBeenLastCalledWith({
          error: { type: "object" },
        });

        jest.clearAllMocks();
        errorsMiddleware.handle(
          error2,
          mockRequest as Request,
          mockResponse as Response,
        );
        expect(mockJson).toHaveBeenLastCalledWith({
          error: ["array", "items"],
        });
      });

      it("should handle error with both message and toString JSON", () => {
        const error = {
          message: '{"from":"message"}',
          toString: () => '{"from":"toString"}',
        } as Error;

        errorsMiddleware.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
        );

        // Should prioritize message over toString
        expect(mockJson).toHaveBeenCalledWith({
          error: { from: "message" },
        });
      });

      it("should handle AppError with JSON message", () => {
        const jsonMessage = '{"validation":["field1","field2"]}';
        const appError = new AppError(jsonMessage, 422);

        errorsMiddleware.handle(
          appError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(422);
        expect(mockJson).toHaveBeenCalledWith({
          error: {
            validation: ["field1", "field2"],
          },
        });
      });

      it("should handle error object with custom properties", () => {
        const customError = {
          name: "CustomError",
          message: "Custom error occurred",
          customProp: "customValue",
          statusCode: 418,
          toString: () => "CustomError: Custom error occurred",
        } as Error & { statusCode: number; customProp: string };

        errorsMiddleware.handle(
          customError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(418);
        expect(mockJson).toHaveBeenCalledWith({
          error: "Custom error occurred",
        });
      });
    });

    describe("Integration with AppError", () => {
      it("should work seamlessly with AppError instances", () => {
        const appError = new AppError("Authentication failed", 401);

        errorsMiddleware.handle(
          appError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(logger.error).toHaveBeenCalledWith('"Authentication failed"');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: "Authentication failed",
        });
      });

      it("should handle AppError with data property", () => {
        const appError = new AppError("Validation failed", 422, {
          field: "email",
        });

        errorsMiddleware.handle(
          appError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockStatus).toHaveBeenCalledWith(422);
        expect(mockJson).toHaveBeenCalledWith({
          error: "Validation failed",
        });
      });
    });

    describe("String Conversion and Parsing Logic", () => {
      it("should properly handle String() conversion for various error types", () => {
        const complexError = {
          toString: () => "CustomError: Something went wrong",
          message: "Different message",
        } as Error;

        errorsMiddleware.handle(
          complexError,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: "Different message",
        });
      });

      it("should handle null message gracefully", () => {
        const errorWithNullMessage = {
          message: null,
          toString: () => "Error occurred",
        } as unknown as Error;

        errorsMiddleware.handle(
          errorWithNullMessage,
          mockRequest as Request,
          mockResponse as Response,
        );

        expect(mockJson).toHaveBeenCalledWith({
          error: errorWithNullMessage,
        });
      });
    });
  });
});
