/* eslint-disable sonarjs/no-duplicate-string */
import { ResendConfirmationCodeUseCase } from "../../src/useCases/resend-confirmation-code.auth.usecase";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { CognitoService } from "../../src/services/cognito.service";
import AppError from "../../src/utils/error";

// Mock dependencies
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/infra/database/repositories/auth.repository");

describe("ResendConfirmationCodeUseCase", () => {
  let resendConfirmationCodeUseCase: ResendConfirmationCodeUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

  // Test data
  const mockRequest: ResendConfirmationCodeRequest = {
    username: "testuser",
  };

  const expectedResponse: ResendConfirmationCodeResponse = {
    success: true,
    message: "Confirmation code resent successfully. Please check your email.",
    deliveryMethod: "EMAIL",
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockCognitoService = new CognitoService() as jest.Mocked<CognitoService>;
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;

    // Create use case instance with mocked dependencies
    resendConfirmationCodeUseCase = new ResendConfirmationCodeUseCase(
      mockCognitoService,
      mockAuthRepository,
    );
  });

  describe("execute", () => {
    it("should successfully resend confirmation code", async () => {
      // Arrange
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
          Destination: "t***@example.com",
        },
        $response: {
          requestId: "12345",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        mockRequest,
      );
    });

    it("should propagate error when cognito service fails", async () => {
      // Arrange
      const error = new AppError("Cognito service error", 400);
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(error);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(error);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        mockRequest,
      );
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const customRequest = { username: "customuser@example.com" };
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
          Destination: "c***@example.com",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(customRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        customRequest,
      );
    });

    it("should handle empty string username", async () => {
      // Arrange
      const requestWithEmptyUsername = { username: "" };
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(
        requestWithEmptyUsername,
      );

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        requestWithEmptyUsername,
      );
    });

    it("should handle special characters in username", async () => {
      // Arrange
      const requestWithSpecialChars = { username: "test+user@domain.co.uk" };
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
          Destination: "t***@domain.co.uk",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(
        requestWithSpecialChars,
      );

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        requestWithSpecialChars,
      );
    });

    it("should return consistent response structure", async () => {
      // Arrange
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue({});

      // Act
      const result = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("deliveryMethod");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      expect(typeof result.deliveryMethod).toBe("string");
      expect(result.success).toBe(true);
      expect(result.deliveryMethod).toBe("EMAIL");
    });

    it("should always return EMAIL as delivery method", async () => {
      // Arrange - Even if Cognito returns different delivery method
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "SMS", // Different from expected
          Destination: "+***123",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(result.deliveryMethod).toBe("EMAIL");
      expect(result).toEqual(expectedResponse);
    });

    it("should handle cognito response without CodeDeliveryDetails", async () => {
      // Arrange
      const mockCognitoResponse = {
        $response: {
          requestId: "67890",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Arrange & Act
      const useCase = new ResendConfirmationCodeUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert
      expect(useCase).toBeInstanceOf(ResendConfirmationCodeUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", () => {
      // Arrange & Act
      const useCase = new ResendConfirmationCodeUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert
      expect(useCase["cognitoService"]).toBe(mockCognitoService);
      expect(useCase["authRepository"]).toBe(mockAuthRepository);
    });
  });

  describe("error scenarios", () => {
    it("should handle user not found errors", async () => {
      // Arrange
      const userNotFoundError = new AppError("UserNotFoundException", 404);
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(userNotFoundError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(userNotFoundError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle invalid parameter errors", async () => {
      // Arrange
      const invalidParameterError = new AppError(
        "InvalidParameterException",
        400,
      );
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(invalidParameterError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(invalidParameterError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle rate limiting errors", async () => {
      // Arrange
      const rateLimitError = new AppError("LimitExceededException", 429);
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(rateLimitError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle user already confirmed errors", async () => {
      // Arrange
      const alreadyConfirmedError = new AppError("AliasExistsException", 400);
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(alreadyConfirmedError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(alreadyConfirmedError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle network errors", async () => {
      // Arrange
      const networkError = new Error("Network timeout");
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(networkError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should handle generic errors", async () => {
      // Arrange
      const genericError = new Error("Unknown error occurred");
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockRejectedValue(genericError);

      // Act & Assert
      await expect(
        resendConfirmationCodeUseCase.execute(mockRequest),
      ).rejects.toThrow(genericError);

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with proper call sequence", async () => {
      // Arrange
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
          Destination: "t***@example.com",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert - Verify call sequence and result
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        1,
      );
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should not modify the request object", async () => {
      // Arrange
      const originalRequest = { ...mockRequest };
      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue({});

      // Act
      await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(mockRequest).toEqual(originalRequest);
    });

    it("should handle multiple consecutive calls correctly", async () => {
      // Arrange
      const mockCognitoResponse = {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
          Destination: "t***@example.com",
        },
      };

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);

      // Act
      const result1 = await resendConfirmationCodeUseCase.execute(mockRequest);
      const result2 = await resendConfirmationCodeUseCase.execute(mockRequest);

      // Assert
      expect(result1).toEqual(expectedResponse);
      expect(result2).toEqual(expectedResponse);
      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        2,
      );
    });

    it("should handle different request formats", async () => {
      // Arrange
      const requests = [
        { username: "user1" },
        { username: "user2@domain.com" },
        { username: "user-3_test" },
        { username: "123456789" },
      ];

      mockCognitoService.resendConfirmationCode = jest
        .fn()
        .mockResolvedValue({});

      // Act & Assert
      for (const request of requests) {
        const result = await resendConfirmationCodeUseCase.execute(request);
        expect(result).toEqual(expectedResponse);
      }

      expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledTimes(
        requests.length,
      );
    });
  });
});
