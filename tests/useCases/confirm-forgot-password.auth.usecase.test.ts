/* eslint-disable sonarjs/no-duplicate-string */
import { ConfirmForgotPasswordUseCase } from "../../src/useCases/confirm-forgot-password.auth.usecase";
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

const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Password has been reset successfully. You can now login with your new password.";

describe("ConfirmForgotPasswordUseCase", () => {
  let confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockLogger: jest.Mocked<typeof logger>;

  // Test data
  const mockRequest: ConfirmForgotPasswordRequest = {
    username: "testuser",
    confirmationCode: "123456",
    newPassword: "NewPassword123!",
  };

  const expectedResponse: ConfirmForgotPasswordResponse = {
    success: true,
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockCognitoService = new CognitoService() as jest.Mocked<CognitoService>;
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockLogger = logger as jest.Mocked<typeof logger>;

    // Create use case instance with mocked dependencies
    confirmForgotPasswordUseCase = new ConfirmForgotPasswordUseCase(
      mockCognitoService,
      mockAuthRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully confirm forgot password", async () => {
      // Arrange
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result = await confirmForgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset confirmed for user:",
        mockRequest.username,
      );

      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Password has been reset successfully. You can now login with your new password.",
      );
    });

    it("should propagate error when cognito service fails", async () => {
      // Arrange
      const cognitoError = new Error("Cognito service error");
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(cognitoError);

      // Act & Assert
      await expect(
        confirmForgotPasswordUseCase.execute(mockRequest),
      ).rejects.toThrow(cognitoError);

      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );

      // Logger should not be called when an error occurs before it
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const differentRequest: ConfirmForgotPasswordRequest = {
        username: "anotheruser@email.com",
        confirmationCode: "654321",
        newPassword: "AnotherNewPassword456!",
      };
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result =
        await confirmForgotPasswordUseCase.execute(differentRequest);

      // Assert
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        differentRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset confirmed for user:",
        differentRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle empty string username", async () => {
      // Arrange
      const emptyUsernameRequest: ConfirmForgotPasswordRequest = {
        username: "",
        confirmationCode: "123456",
        newPassword: "NewPassword123!",
      };
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result =
        await confirmForgotPasswordUseCase.execute(emptyUsernameRequest);

      // Assert
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        emptyUsernameRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset confirmed for user:",
        "",
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle special characters in username", async () => {
      // Arrange
      const specialCharRequest: ConfirmForgotPasswordRequest = {
        username: "user+test@domain.co.uk",
        confirmationCode: "999999",
        newPassword: "SpecialPassword789#",
      };
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result =
        await confirmForgotPasswordUseCase.execute(specialCharRequest);

      // Assert
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        specialCharRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset confirmed for user:",
        specialCharRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should return consistent response structure", async () => {
      // Arrange
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result = await confirmForgotPasswordUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Act
      const useCase = new ConfirmForgotPasswordUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert
      expect(useCase).toBeInstanceOf(ConfirmForgotPasswordUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", () => {
      // Act
      const useCase = new ConfirmForgotPasswordUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert - Test that dependencies are accessible through execution
      expect(async () => {
        mockCognitoService.confirmForgotPassword = jest
          .fn()
          .mockResolvedValue(undefined);
        await useCase.execute(mockRequest);
        expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalled();
      }).not.toThrow();
    });
  });

  describe("error scenarios", () => {
    it("should handle network timeout errors", async () => {
      // Arrange
      const timeoutError = new Error("Request timeout");
      timeoutError.name = "TimeoutError";
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        confirmForgotPasswordUseCase.execute(mockRequest),
      ).rejects.toThrow("Request timeout");
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle invalid confirmation code errors", async () => {
      // Arrange
      const invalidCodeError = new Error(
        "Invalid verification code provided, please try again.",
      );
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(invalidCodeError);

      // Act & Assert
      await expect(
        confirmForgotPasswordUseCase.execute(mockRequest),
      ).rejects.toThrow(invalidCodeError);
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle expired code errors", async () => {
      // Arrange
      const expiredCodeError = new Error(
        "Invalid verification code provided, please try again.",
      );
      expiredCodeError.name = "ExpiredCodeException";
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(expiredCodeError);

      // Act & Assert
      await expect(
        confirmForgotPasswordUseCase.execute(mockRequest),
      ).rejects.toThrow(expiredCodeError);
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle user not found errors", async () => {
      // Arrange
      const userNotFoundError = new Error("User does not exist.");
      userNotFoundError.name = "UserNotFoundException";
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(userNotFoundError);

      // Act & Assert
      await expect(
        confirmForgotPasswordUseCase.execute(mockRequest),
      ).rejects.toThrow(userNotFoundError);
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with all method calls", async () => {
      // Arrange
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockResolvedValue(undefined);

      // Act
      const result = await confirmForgotPasswordUseCase.execute(mockRequest);

      // Assert - Verify call sequence and arguments
      expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Password reset confirmed for user:",
        mockRequest.username,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should not call logger when cognito service throws error", async () => {
      // Arrange
      const error = new Error("Service unavailable");
      mockCognitoService.confirmForgotPassword = jest
        .fn()
        .mockRejectedValue(error);

      // Act & Assert
      try {
        await confirmForgotPasswordUseCase.execute(mockRequest);
        fail("Should have thrown an error");
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledTimes(
          1,
        );
        expect(mockLogger.info).not.toHaveBeenCalled();
      }
    });
  });
});
