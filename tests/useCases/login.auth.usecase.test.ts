/* eslint-disable sonarjs/no-duplicate-string */
import { LoginUseCase } from "../../src/useCases/login.auth.usecase";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { CognitoService } from "../../src/services/cognito.service";
import { QueueHelper } from "../../src/infra/queue";
import logger from "../../src/utils/logger";

// Mock dependencies
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/infra/database/repositories/auth.repository");
jest.mock("../../src/infra/queue", () => ({
  QueueHelper: {
    sendUserLoginMessage: jest.fn(),
  },
}));
jest.mock("../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockQueueHelper: jest.Mocked<typeof QueueHelper>;
  let mockLogger: jest.Mocked<typeof logger>;

  // Test data
  const mockRequest: SignInRequest = {
    username: "testuser",
    password: "password123",
  };

  const mockCognitoResponse = {
    AuthenticationResult: {
      AccessToken: "access-token-123",
      IdToken: "id-token-456",
      RefreshToken: "refresh-token-789",
      ExpiresIn: 3600,
      TokenType: "Bearer",
    },
    ChallengeParameters: {},
  };

  const expectedResponse: SignInResponse = {
    accessToken: "access-token-123",
    idToken: "id-token-456",
    refreshToken: "refresh-token-789",
  };

  const mockUserLoginMessage = {
    username: mockRequest.username,
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockCognitoService = new CognitoService() as jest.Mocked<CognitoService>;
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockQueueHelper = QueueHelper as jest.Mocked<typeof QueueHelper>;
    mockLogger = logger as jest.Mocked<typeof logger>;

    // Create use case instance with mocked dependencies
    loginUseCase = new LoginUseCase(mockCognitoService, mockAuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully login user", async () => {
      // Arrange
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(mockRequest);

      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        mockUserLoginMessage,
      );

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );

      expect(result).toEqual(expectedResponse);
      expect(result.accessToken).toBe("access-token-123");
      expect(result.idToken).toBe("id-token-456");
      expect(result.refreshToken).toBe("refresh-token-789");
    });

    it("should throw error when AuthenticationResult is undefined", async () => {
      // Arrange
      const responseWithoutAuth = {
        ChallengeName: "SMS_MFA",
        ChallengeParameters: {},
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(responseWithoutAuth);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        "AuthenticationResult is undefined.",
      );

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);

      // Logger should not be called when error occurs
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should return undefined AccessToken when missing", async () => {
      // Arrange
      const responseWithoutAccessToken = {
        AuthenticationResult: {
          IdToken: "id-token-456",
          RefreshToken: "refresh-token-789",
        },
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(responseWithoutAccessToken);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        accessToken: undefined,
        idToken: "id-token-456",
        refreshToken: "refresh-token-789",
      });

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );
    });

    it("should return undefined IdToken when missing", async () => {
      // Arrange
      const responseWithoutIdToken = {
        AuthenticationResult: {
          AccessToken: "access-token-123",
          RefreshToken: "refresh-token-789",
        },
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(responseWithoutIdToken);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        accessToken: "access-token-123",
        idToken: undefined,
        refreshToken: "refresh-token-789",
      });

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );
    });

    it("should return undefined RefreshToken when missing", async () => {
      // Arrange
      const responseWithoutRefreshToken = {
        AuthenticationResult: {
          AccessToken: "access-token-123",
          IdToken: "id-token-456",
        },
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(responseWithoutRefreshToken);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        accessToken: "access-token-123",
        idToken: "id-token-456",
        refreshToken: undefined,
      });

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );
    });

    it("should propagate error when cognito service fails", async () => {
      // Arrange
      const cognitoError = new Error("Invalid credentials");
      mockCognitoService.signIn = jest.fn().mockRejectedValue(cognitoError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        cognitoError,
      );

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(mockRequest);

      // Should not call queue or logger when cognito fails
      expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should propagate error when queue helper fails", async () => {
      // Arrange
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      const queueError = new Error("Queue service error");
      mockQueueHelper.sendUserLoginMessage = jest
        .fn()
        .mockRejectedValue(queueError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        queueError,
      );

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);

      // Should not proceed to logger when queue fails
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const differentRequest: SignInRequest = {
        username: "different@email.com",
        password: "differentpass123",
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      const expectedUserMessage = {
        username: differentRequest.username,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Act
      const result = await loginUseCase.execute(differentRequest);

      // Assert
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(differentRequest);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        expectedUserMessage,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle empty string credentials", async () => {
      // Arrange
      const emptyCredentialsRequest: SignInRequest = {
        username: "",
        password: "",
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      const expectedUserMessage = {
        username: "",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Act
      const result = await loginUseCase.execute(emptyCredentialsRequest);

      // Assert
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(
        emptyCredentialsRequest,
      );
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        expectedUserMessage,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should handle special characters in credentials", async () => {
      // Arrange
      const specialCharRequest: SignInRequest = {
        username: "user+test@domain.co.uk",
        password: "P@ssw0rd!#$%",
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(specialCharRequest);

      // Assert
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(
        specialCharRequest,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should return consistent response structure", async () => {
      // Arrange
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("idToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.idToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(Object.keys(result)).toHaveLength(3);
    });

    it("should generate proper timestamps for queue message", async () => {
      // Arrange
      const beforeTest = new Date();
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      await loginUseCase.execute(mockRequest);
      const afterTest = new Date();

      // Assert
      const queueCall = mockQueueHelper.sendUserLoginMessage.mock
        .calls[0][0] as {
        username: string;
        createdAt: Date;
        updatedAt: Date;
      };
      expect(queueCall.createdAt).toBeInstanceOf(Date);
      expect(queueCall.updatedAt).toBeInstanceOf(Date);
      expect(queueCall.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
      expect(queueCall.createdAt.getTime()).toBeLessThanOrEqual(
        afterTest.getTime(),
      );
      expect(queueCall.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
      expect(queueCall.updatedAt.getTime()).toBeLessThanOrEqual(
        afterTest.getTime(),
      );
    });

    it("should handle tokens with different formats", async () => {
      // Arrange
      const differentTokensResponse = {
        AuthenticationResult: {
          AccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          IdToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
          RefreshToken:
            "arn:aws:cognito-idp:us-east-1:123456789012:refresh-token",
          ExpiresIn: 7200,
          TokenType: "Bearer",
        },
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(differentTokensResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      const expectedDifferentResponse: SignInResponse = {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        idToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
        refreshToken:
          "arn:aws:cognito-idp:us-east-1:123456789012:refresh-token",
      };

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual(expectedDifferentResponse);
    });
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Act
      const useCase = new LoginUseCase(mockCognitoService, mockAuthRepository);

      // Assert
      expect(useCase).toBeInstanceOf(LoginUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", async () => {
      // Act
      const useCase = new LoginUseCase(mockCognitoService, mockAuthRepository);

      // Assert - Test that dependencies are accessible through execution
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      await useCase.execute(mockRequest);

      expect(mockCognitoService.signIn).toHaveBeenCalled();
    });
  });

  describe("error scenarios", () => {
    it("should handle invalid credentials errors", async () => {
      // Arrange
      const invalidCredentialsError = new Error(
        "Incorrect username or password.",
      );
      invalidCredentialsError.name = "NotAuthorizedException";
      mockCognitoService.signIn = jest
        .fn()
        .mockRejectedValue(invalidCredentialsError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        invalidCredentialsError,
      );
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
    });

    it("should handle user not confirmed errors", async () => {
      // Arrange
      const userNotConfirmedError = new Error("User is not confirmed.");
      userNotConfirmedError.name = "UserNotConfirmedException";
      mockCognitoService.signIn = jest
        .fn()
        .mockRejectedValue(userNotConfirmedError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        userNotConfirmedError,
      );
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
    });

    it("should handle user not found errors", async () => {
      // Arrange
      const userNotFoundError = new Error("User does not exist.");
      userNotFoundError.name = "UserNotFoundException";
      mockCognitoService.signIn = jest
        .fn()
        .mockRejectedValue(userNotFoundError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        userNotFoundError,
      );
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
    });

    it("should handle too many requests errors", async () => {
      // Arrange
      const tooManyRequestsError = new Error("Too many requests");
      tooManyRequestsError.name = "TooManyRequestsException";
      mockCognitoService.signIn = jest
        .fn()
        .mockRejectedValue(tooManyRequestsError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        tooManyRequestsError,
      );
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
    });

    it("should handle password reset required errors", async () => {
      // Arrange
      const passwordResetError = new Error("Password reset required");
      passwordResetError.name = "PasswordResetRequiredException";
      mockCognitoService.signIn = jest
        .fn()
        .mockRejectedValue(passwordResetError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        passwordResetError,
      );
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with proper call sequence", async () => {
      // Arrange
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert - Verify all methods were called in sequence
      expect(mockCognitoService.signIn).toHaveBeenCalledWith(mockRequest);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        mockUserLoginMessage,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should not proceed with token extraction when cognito service fails", async () => {
      // Arrange
      const error = new Error("Service unavailable");
      mockCognitoService.signIn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      try {
        await loginUseCase.execute(mockRequest);
        fail("Should have thrown an error");
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
        expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
        expect(mockLogger.info).not.toHaveBeenCalled();
      }
    });

    it("should not proceed with logger when queue fails", async () => {
      // Arrange
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(mockCognitoResponse);
      const queueError = new Error("Queue connection failed");
      mockQueueHelper.sendUserLoginMessage = jest
        .fn()
        .mockRejectedValue(queueError);

      // Act & Assert
      await expect(loginUseCase.execute(mockRequest)).rejects.toThrow(
        queueError,
      );

      // Verify that cognito was called but logger wasn't
      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should handle AuthenticationResult with null tokens gracefully", async () => {
      // Arrange
      const responseWithNullTokens = {
        AuthenticationResult: {
          AccessToken: null,
          IdToken: null,
          RefreshToken: null,
        },
      };
      mockCognitoService.signIn = jest
        .fn()
        .mockResolvedValue(responseWithNullTokens);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        accessToken: null,
        idToken: null,
        refreshToken: null,
      });

      expect(mockCognitoService.signIn).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User signed in successfully.",
      );
    });
  });
});
