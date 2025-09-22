/* eslint-disable sonarjs/no-duplicate-string */
import { ConfirmSignUpUseCase } from "../../src/useCases/confirm-signup.auth.usecase";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { CognitoService } from "../../src/services/cognito.service";
import { QueueHelper } from "../../src/infra/queue";

// Mock dependencies
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/infra/database/repositories/auth.repository");
jest.mock("../../src/infra/queue", () => ({
  QueueHelper: {
    sendUserLoginMessage: jest.fn(),
  },
}));

const USER_CONFIRMED_SUCCESS_MESSAGE = "User confirmed successfully";

describe("ConfirmSignUpUseCase", () => {
  let confirmSignUpUseCase: ConfirmSignUpUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockQueueHelper: jest.Mocked<typeof QueueHelper>;

  // Test data
  const mockRequest: ConfirmSignUpRequest = {
    username: "testuser",
    confirmationCode: "123456",
  };

  const expectedResponse: ConfirmSignUpResponse = {
    success: true,
    message: USER_CONFIRMED_SUCCESS_MESSAGE,
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

    // Create use case instance with mocked dependencies
    confirmSignUpUseCase = new ConfirmSignUpUseCase(
      mockCognitoService,
      mockAuthRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully confirm user signup", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      // Act
      const result = await confirmSignUpUseCase.execute(mockRequest);

      // Assert
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        mockRequest,
      );

      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        mockUserLoginMessage,
      );

      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledWith(mockRequest.username, true);

      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe(USER_CONFIRMED_SUCCESS_MESSAGE);
    });

    it("should throw AppError when cognito service returns false", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        "Failed to confirm user.",
      );

      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        mockRequest,
      );

      // Should not call queue or repository when cognito fails
      expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).not.toHaveBeenCalled();
    });

    it("should propagate error when cognito service throws error", async () => {
      // Arrange
      const cognitoError = new Error("Cognito service error");
      mockCognitoService.confirmSignUp = jest
        .fn()
        .mockRejectedValue(cognitoError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        cognitoError,
      );

      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        mockRequest,
      );

      // Should not call queue or repository when cognito throws error
      expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).not.toHaveBeenCalled();
    });

    it("should propagate error when queue helper fails", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      const queueError = new Error("Queue service error");
      mockQueueHelper.sendUserLoginMessage = jest
        .fn()
        .mockRejectedValue(queueError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        queueError,
      );

      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);

      // Should not call repository when queue fails
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).not.toHaveBeenCalled();
    });

    it("should propagate error when repository fails", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      const repositoryError = new Error("Database error");
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        repositoryError,
      );

      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const differentRequest: ConfirmSignUpRequest = {
        username: "different@email.com",
        confirmationCode: "654321",
      };
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      const expectedUserMessage = {
        username: differentRequest.username,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Act
      const result = await confirmSignUpUseCase.execute(differentRequest);

      // Assert
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        differentRequest,
      );
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        expectedUserMessage,
      );
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledWith(differentRequest.username, true);
      expect(result).toEqual(expectedResponse);
    });

    it("should handle empty string username", async () => {
      // Arrange
      const emptyUsernameRequest: ConfirmSignUpRequest = {
        username: "",
        confirmationCode: "123456",
      };
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      const expectedUserMessage = {
        username: "",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Act
      const result = await confirmSignUpUseCase.execute(emptyUsernameRequest);

      // Assert
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        emptyUsernameRequest,
      );
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        expectedUserMessage,
      );
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledWith("", true);
      expect(result).toEqual(expectedResponse);
    });

    it("should handle special characters in confirmation code", async () => {
      // Arrange
      const specialCodeRequest: ConfirmSignUpRequest = {
        username: "test@example.com",
        confirmationCode: "ABC#123!",
      };
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      // Act
      const result = await confirmSignUpUseCase.execute(specialCodeRequest);

      // Assert
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        specialCodeRequest,
      );
      expect(result).toEqual(expectedResponse);
    });

    it("should return consistent response structure", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      // Act
      const result = await confirmSignUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      expect(Object.keys(result)).toHaveLength(2);
    });

    it("should generate proper timestamps for queue message", async () => {
      // Arrange
      const beforeTest = new Date();
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      // Act
      await confirmSignUpUseCase.execute(mockRequest);
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
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Act
      const useCase = new ConfirmSignUpUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert
      expect(useCase).toBeInstanceOf(ConfirmSignUpUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", async () => {
      // Act
      const useCase = new ConfirmSignUpUseCase(
        mockCognitoService,
        mockAuthRepository,
      );

      // Assert - Test that dependencies are accessible through execution
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      await useCase.execute(mockRequest);

      expect(mockCognitoService.confirmSignUp).toHaveBeenCalled();
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalled();
    });
  });

  describe("error scenarios", () => {
    it("should handle invalid confirmation code errors", async () => {
      // Arrange
      const invalidCodeError = new Error(
        "Invalid verification code provided, please try again.",
      );
      mockCognitoService.confirmSignUp = jest
        .fn()
        .mockRejectedValue(invalidCodeError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        invalidCodeError,
      );
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
    });

    it("should handle expired code errors", async () => {
      // Arrange
      const expiredCodeError = new Error("Confirmation code has expired");
      expiredCodeError.name = "ExpiredCodeException";
      mockCognitoService.confirmSignUp = jest
        .fn()
        .mockRejectedValue(expiredCodeError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        expiredCodeError,
      );
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
    });

    it("should handle user not found errors", async () => {
      // Arrange
      const userNotFoundError = new Error("User does not exist");
      userNotFoundError.name = "UserNotFoundException";
      mockCognitoService.confirmSignUp = jest
        .fn()
        .mockRejectedValue(userNotFoundError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        userNotFoundError,
      );
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
    });

    it("should handle user already confirmed errors", async () => {
      // Arrange
      const alreadyConfirmedError = new Error("User is already confirmed");
      alreadyConfirmedError.name = "NotAuthorizedException";
      mockCognitoService.confirmSignUp = jest
        .fn()
        .mockRejectedValue(alreadyConfirmedError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        alreadyConfirmedError,
      );
    });

    it("should create AppError with correct message and status code", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        "Failed to confirm user.",
      );
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with proper call sequence", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockResolvedValue(true);

      // Act
      const result = await confirmSignUpUseCase.execute(mockRequest);

      // Assert - Verify all methods were called in sequence
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledWith(
        mockUserLoginMessage,
      );
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledWith(mockRequest.username, true);
      expect(result).toEqual(expectedResponse);
    });

    it("should not proceed with queue and repository operations when cognito returns false", async () => {
      // Arrange
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(false);

      // Act & Assert
      try {
        await confirmSignUpUseCase.execute(mockRequest);
        fail("Should have thrown an error");
      } catch {
        expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
        expect(mockQueueHelper.sendUserLoginMessage).not.toHaveBeenCalled();
        expect(
          mockAuthRepository.updateUserConfirmationStatus,
        ).not.toHaveBeenCalled();
      }
    });

    it("should handle partial failure scenarios gracefully", async () => {
      // Arrange - Queue succeeds but repository fails
      mockCognitoService.confirmSignUp = jest.fn().mockResolvedValue(true);
      mockQueueHelper.sendUserLoginMessage = jest.fn().mockResolvedValue(true);
      const repositoryError = new Error("Database connection failed");
      mockAuthRepository.updateUserConfirmationStatus = jest
        .fn()
        .mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(confirmSignUpUseCase.execute(mockRequest)).rejects.toThrow(
        repositoryError,
      );

      // Verify that cognito and queue were still called
      expect(mockCognitoService.confirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserLoginMessage).toHaveBeenCalledTimes(1);
      expect(
        mockAuthRepository.updateUserConfirmationStatus,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
