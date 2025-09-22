/* eslint-disable sonarjs/no-duplicate-string */
import { ForgotPasswordUseCase } from "../../src/useCases/forgot-password.auth.usecase";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { CognitoService } from "../../src/services/cognito.service";
import logger from "../../src/utils/logger";

// Mock dependencies
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/infra/database/repositories/auth.repository");
jest.mock("../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

const RESET_SUCCESS_MESSAGE =
  "Password reset code sent successfully. Please check your email or phone.";

describe("ForgotPasswordUseCase", () => {
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockLogger: jest.Mocked<typeof logger>;

  // Test data
  const mockRequest: ForgotPasswordRequest = {
    username: "testuser",
  };

  const mockCognitoResponse = {
    CodeDeliveryDetails: {
      AttributeName: "email",
      DeliveryMedium: "EMAIL",
      Destination: "t***@example.com",
    },
  };

  const expectedResponse: ForgotPasswordResponse = {
    success: true,
    message: RESET_SUCCESS_MESSAGE,
    deliveryMethod: "EMAIL",
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockCognitoService = new CognitoService() as jest.Mocked<CognitoService>;
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockLogger = logger as jest.Mocked<typeof logger>;

    // Create use case instance with mocked dependencies
    forgotPasswordUseCase = new ForgotPasswordUseCase(
      mockCognitoService,
      mockAuthRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully initiate password reset with email delivery", async () => {
      // Arrange
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset initiated for user:",
        mockRequest.username,
      );

      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe(RESET_SUCCESS_MESSAGE);
      expect(result.deliveryMethod).toBe("EMAIL");
    });

    it("should handle SMS delivery method", async () => {
      // Arrange
      const smsResponse = {
        CodeDeliveryDetails: {
          AttributeName: "phone_number",
          DeliveryMedium: "SMS",
          Destination: "+*******9999",
        },
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(smsResponse);

      const expectedSmsResponse: ForgotPasswordResponse = {
        success: true,
        message: RESET_SUCCESS_MESSAGE,
        deliveryMethod: "SMS",
      };

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result).toEqual(expectedSmsResponse);
      expect(result.deliveryMethod).toBe("SMS");
    });

    it("should use EMAIL as default delivery method when CodeDeliveryDetails is missing", async () => {
      // Arrange
      const responseWithoutDelivery = {};
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(responseWithoutDelivery);

      const expectedDefaultResponse: ForgotPasswordResponse = {
        success: true,
        message: RESET_SUCCESS_MESSAGE,
        deliveryMethod: "EMAIL",
      };

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual(expectedDefaultResponse);
      expect(result.deliveryMethod).toBe("EMAIL");
    });

    it("should use EMAIL as default when DeliveryMedium is undefined", async () => {
      // Arrange
      const responseWithoutMedium = {
        CodeDeliveryDetails: {
          AttributeName: "email",
          Destination: "t***@example.com",
        },
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(responseWithoutMedium);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result.deliveryMethod).toBe("EMAIL");
    });

    it("should propagate error when cognito service fails", async () => {
      // Arrange
      const cognitoError = new Error("Cognito service error");
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(cognitoError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        cognitoError,
      );

      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );

      // Logger should not be called when an error occurs before it
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const differentRequest: ForgotPasswordRequest = {
        username: "anotheruser@email.com",
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(differentRequest);

      // Assert
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        differentRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset initiated for user:",
        differentRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle empty string username", async () => {
      // Arrange
      const emptyUsernameRequest: ForgotPasswordRequest = {
        username: "",
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(emptyUsernameRequest);

      // Assert
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        emptyUsernameRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset initiated for user:",
        "",
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle special characters in username", async () => {
      // Arrange
      const specialCharRequest: ForgotPasswordRequest = {
        username: "user+test@domain.co.uk",
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(specialCharRequest);

      // Assert
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        specialCharRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset initiated for user:",
        specialCharRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should return consistent response structure", async () => {
      // Arrange
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("deliveryMethod");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      expect(typeof result.deliveryMethod).toBe("string");
      expect(Object.keys(result)).toHaveLength(3);
    });

    it("should handle complex CodeDeliveryDetails structure", async () => {
      // Arrange
      const complexResponse = {
        CodeDeliveryDetails: {
          AttributeName: "email",
          DeliveryMedium: "EMAIL",
          Destination: "test@example.com",
        },
        $response: {
          requestId: "test-request-id",
        },
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(complexResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result.deliveryMethod).toBe("EMAIL");
      expect(result.success).toBe(true);
      expect(result.message).toBe(RESET_SUCCESS_MESSAGE);
    });

    it("should handle null CodeDeliveryDetails", async () => {
      // Arrange
      const nullDeliveryResponse = {
        CodeDeliveryDetails: null,
      };
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(nullDeliveryResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result.deliveryMethod).toBe("EMAIL");
    });

    it("should handle undefined response from cognito", async () => {
      // Arrange
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(undefined as never);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        TypeError,
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Act
      const useCase = new ForgotPasswordUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert
      expect(useCase).toBeInstanceOf(ForgotPasswordUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", async () => {
      // Act
      const useCase = new ForgotPasswordUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert - Test that dependencies are accessible through execution
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      await useCase.execute(mockRequest);
      expect(mockCognitoService.forgotPassword).toHaveBeenCalled();
    });
  });

  describe("error scenarios", () => {
    it("should handle user not found errors", async () => {
      // Arrange
      const userNotFoundError = new Error("User does not exist.");
      userNotFoundError.name = "UserNotFoundException";
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(userNotFoundError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        userNotFoundError,
      );
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle invalid parameter errors", async () => {
      // Arrange
      const invalidParamError = new Error("Invalid parameter");
      invalidParamError.name = "InvalidParameterException";
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(invalidParamError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        invalidParamError,
      );
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle limit exceeded errors", async () => {
      // Arrange
      const limitError = new Error("Attempt limit exceeded");
      limitError.name = "LimitExceededException";
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(limitError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        limitError,
      );
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle network timeout errors", async () => {
      // Arrange
      const timeoutError = new Error("Request timeout");
      timeoutError.name = "TimeoutError";
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        "Request timeout",
      );
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle user not confirmed errors", async () => {
      // Arrange
      const notConfirmedError = new Error("User is not confirmed");
      notConfirmedError.name = "InvalidPasswordException";
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockRejectedValue(notConfirmedError);

      // Act & Assert
      await expect(forgotPasswordUseCase.execute(mockRequest)).rejects.toThrow(
        notConfirmedError,
      );
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with all method calls", async () => {
      // Arrange
      mockCognitoService.forgotPassword = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await forgotPasswordUseCase.execute(mockRequest);

      // Assert - Verify call sequence and arguments
      expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset initiated for user:",
        mockRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should not call logger when cognito service throws error", async () => {
      // Arrange
      const error = new Error("Service unavailable");
      mockCognitoService.forgotPassword = jest.fn().mockRejectedValue(error);

      // Act & Assert
      try {
        await forgotPasswordUseCase.execute(mockRequest);
        fail("Should have thrown an error");
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect(mockCognitoService.forgotPassword).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).not.toHaveBeenCalled();
      }
    });

    it("should handle various delivery medium values", async () => {
      // Arrange
      const testCases = [
        { medium: "EMAIL", expected: "EMAIL" },
        { medium: "SMS", expected: "SMS" },
        { medium: "VOICE", expected: "VOICE" },
        { medium: "", expected: "EMAIL" }, // Empty string falls back to EMAIL
        { medium: null, expected: "EMAIL" },
        { medium: undefined, expected: "EMAIL" },
      ];

      for (const testCase of testCases) {
        // Reset mocks for each test case
        jest.clearAllMocks();

        const response = {
          CodeDeliveryDetails: {
            DeliveryMedium: testCase.medium,
          },
        };

        mockCognitoService.forgotPassword = jest
          .fn()
          .mockResolvedValue(response);

        // Act
        const result = await forgotPasswordUseCase.execute(mockRequest);

        // Assert
        expect(result.deliveryMethod).toBe(testCase.expected);
      }
    });
  });
});
