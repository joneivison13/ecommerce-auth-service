/* eslint-disable sonarjs/no-duplicate-string */
import { SignUpUseCase } from "../../src/useCases/signup.auth.usecase";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { CognitoService } from "../../src/services/cognito.service";
import { QueueHelper } from "../../src/infra/queue";
import AppError from "../../src/utils/error";

// Mock dependencies
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/infra/database/repositories/auth.repository");
jest.mock("../../src/infra/queue", () => ({
  QueueHelper: {
    sendUserSignupMessage: jest.fn(),
  },
}));

describe("SignUpUseCase", () => {
  let signUpUseCase: SignUpUseCase;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockQueueHelper: jest.Mocked<typeof QueueHelper>;

  // Test data
  const mockRequest: SignUpRequest = {
    username: "testuser",
    password: "password123",
    email: "test@example.com",
    phoneNumber: "+5511999999999",
    name: "Test User",
  };

  const mockCognitoResponse = {
    UserSub: "12345678-1234-1234-1234-123456789012",
    UserConfirmed: false,
    CodeDeliveryDetails: {
      DeliveryMedium: "EMAIL",
      Destination: "t***@example.com",
    },
    $response: {
      requestId: "test-request-id",
    },
  };

  const mockAuthUser = {
    id: "auth-user-id",
    username: mockRequest.username,
    email: mockRequest.email,
    phoneNumber: mockRequest.phoneNumber,
    name: mockRequest.name,
    cognitoSub: mockCognitoResponse.UserSub,
    userConfirmed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const expectedResponse: SignUpResponse = {
    cognitoSub: mockCognitoResponse.UserSub,
    username: mockRequest.username,
    userConfirmed: false,
    message:
      "User registered successfully. Please check your email for confirmation code.",
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock instances
    mockCognitoService = new CognitoService() as jest.Mocked<CognitoService>;
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    mockQueueHelper = QueueHelper as jest.Mocked<typeof QueueHelper>;

    // Create use case instance with mocked dependencies
    signUpUseCase = new SignUpUseCase(mockCognitoService, mockAuthRepository);

    // Setup default successful mocks
    mockCognitoService.signUpUser = jest
      .fn()
      .mockResolvedValue(mockCognitoResponse);
    mockAuthRepository.create = jest.fn().mockResolvedValue(mockAuthUser);
    mockQueueHelper.sendUserSignupMessage = jest.fn().mockResolvedValue(true);
  });

  describe("execute", () => {
    it("should successfully sign up user with phone number", async () => {
      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual(expectedResponse);

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
      expect(mockCognitoService.signUpUser).toHaveBeenCalledWith(mockRequest);

      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.create).toHaveBeenCalledWith({
        username: mockRequest.username,
        email: mockRequest.email,
        phoneNumber: mockRequest.phoneNumber,
        name: mockRequest.name,
        cognitoSub: mockCognitoResponse.UserSub,
        userConfirmed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledWith({
        username: mockRequest.username,
        email: mockRequest.email,
        phoneNumber: mockRequest.phoneNumber,
        name: mockRequest.name,
        cognitoSub: mockCognitoResponse.UserSub,
        userConfirmed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should successfully sign up user without phone number", async () => {
      // Arrange
      const requestWithoutPhone: SignUpRequest = {
        username: "testuser2",
        password: "password123",
        email: "test2@example.com",
        name: "Test User 2",
      };

      // Act
      const result = await signUpUseCase.execute(requestWithoutPhone);

      // Assert
      expect(result).toEqual({
        cognitoSub: mockCognitoResponse.UserSub,
        username: requestWithoutPhone.username,
        userConfirmed: false,
        message:
          "User registered successfully. Please check your email for confirmation code.",
      });

      expect(mockAuthRepository.create).toHaveBeenCalledWith({
        username: requestWithoutPhone.username,
        email: requestWithoutPhone.email,
        phoneNumber: null,
        name: requestWithoutPhone.name,
        cognitoSub: mockCognitoResponse.UserSub,
        userConfirmed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledWith({
        username: requestWithoutPhone.username,
        email: requestWithoutPhone.email,
        phoneNumber: null,
        name: requestWithoutPhone.name,
        cognitoSub: mockCognitoResponse.UserSub,
        userConfirmed: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should handle cognito response with confirmed user", async () => {
      // Arrange
      const confirmedResponse = {
        ...mockCognitoResponse,
        UserConfirmed: true,
      };
      mockCognitoService.signUpUser = jest
        .fn()
        .mockResolvedValue(confirmedResponse);

      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        cognitoSub: confirmedResponse.UserSub,
        username: mockRequest.username,
        userConfirmed: true,
        message:
          "User registered successfully. Please check your email for confirmation code.",
      });
    });

    it("should handle cognito response without UserSub", async () => {
      // Arrange
      const responseWithoutUserSub = {
        ...mockCognitoResponse,
        UserSub: undefined,
      };
      mockCognitoService.signUpUser = jest
        .fn()
        .mockResolvedValue(responseWithoutUserSub);

      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        cognitoSub: "",
        username: mockRequest.username,
        userConfirmed: false,
        message:
          "User registered successfully. Please check your email for confirmation code.",
      });
    });

    it("should handle cognito response without UserConfirmed", async () => {
      // Arrange
      const responseWithoutConfirmed = {
        ...mockCognitoResponse,
        UserConfirmed: undefined,
      };
      mockCognitoService.signUpUser = jest
        .fn()
        .mockResolvedValue(responseWithoutConfirmed);

      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toEqual({
        cognitoSub: mockCognitoResponse.UserSub,
        username: mockRequest.username,
        userConfirmed: false,
        message:
          "User registered successfully. Please check your email for confirmation code.",
      });
    });

    it("should propagate error when cognito service fails", async () => {
      // Arrange
      const cognitoError = new AppError("Username already exists", 400);
      mockCognitoService.signUpUser = jest.fn().mockRejectedValue(cognitoError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        cognitoError,
      );

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.create).not.toHaveBeenCalled();
      expect(mockQueueHelper.sendUserSignupMessage).not.toHaveBeenCalled();
    });

    it("should propagate error when auth repository fails", async () => {
      // Arrange
      const repositoryError = new AppError("Database connection failed", 500);
      mockAuthRepository.create = jest.fn().mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        repositoryError,
      );

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserSignupMessage).not.toHaveBeenCalled();
    });

    it("should propagate error when queue helper fails", async () => {
      // Arrange
      const queueError = new AppError("Queue service unavailable", 503);
      mockQueueHelper.sendUserSignupMessage = jest
        .fn()
        .mockRejectedValue(queueError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        queueError,
      );

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledTimes(1);
    });

    it("should handle different usernames correctly", async () => {
      // Arrange
      const customRequest = {
        ...mockRequest,
        username: "customuser@domain.com",
      };

      // Act
      const result = await signUpUseCase.execute(customRequest);

      // Assert
      expect(result.username).toBe(customRequest.username);
      expect(mockCognitoService.signUpUser).toHaveBeenCalledWith(customRequest);
    });

    it("should handle empty string phone number", async () => {
      // Arrange
      const requestWithEmptyPhone: SignUpRequest = {
        ...mockRequest,
        phoneNumber: "",
      };

      // Act
      const result = await signUpUseCase.execute(requestWithEmptyPhone);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockAuthRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: null,
        }),
      );
    });

    it("should handle special characters in user data", async () => {
      // Arrange
      const specialRequest: SignUpRequest = {
        username: "test+user@domain.co.uk",
        password: "P@ssw0rd!123",
        email: "test+tag@domain.co.uk",
        phoneNumber: "+55 (11) 99999-9999",
        name: "José da Silva-Santos",
      };

      // Act
      const result = await signUpUseCase.execute(specialRequest);

      // Assert
      expect(result.username).toBe(specialRequest.username);
      expect(mockCognitoService.signUpUser).toHaveBeenCalledWith(
        specialRequest,
      );
    });

    it("should return consistent response structure", async () => {
      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result).toHaveProperty("cognitoSub");
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("userConfirmed");
      expect(result).toHaveProperty("message");
      expect(typeof result.cognitoSub).toBe("string");
      expect(typeof result.username).toBe("string");
      expect(typeof result.userConfirmed).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("should generate proper timestamps for database and queue", async () => {
      // Arrange
      const beforeExecution = new Date();

      // Act
      await signUpUseCase.execute(mockRequest);
      const afterExecution = new Date();

      // Assert
      const databaseCall = mockAuthRepository.create.mock.calls[0][0];

      expect(databaseCall.createdAt).toBeInstanceOf(Date);
      expect(databaseCall.updatedAt).toBeInstanceOf(Date);
      expect(databaseCall.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeExecution.getTime(),
      );
      expect(databaseCall.createdAt.getTime()).toBeLessThanOrEqual(
        afterExecution.getTime(),
      );

      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe("constructor", () => {
    it("should create instance with provided dependencies", () => {
      // Arrange & Act
      const useCase = new SignUpUseCase(mockCognitoService, mockAuthRepository);

      // Assert
      expect(useCase).toBeInstanceOf(SignUpUseCase);
      expect(useCase).toBeDefined();
    });

    it("should store dependencies as private properties", () => {
      // Arrange & Act
      const useCase = new SignUpUseCase(mockCognitoService, mockAuthRepository);

      // Assert
      expect(useCase["cognitoService"]).toBe(mockCognitoService);
      expect(useCase["authRepository"]).toBe(mockAuthRepository);
    });
  });

  describe("error scenarios", () => {
    it("should handle username already exists errors", async () => {
      // Arrange
      const usernameExistsError = new AppError("UsernameExistsException", 400);
      mockCognitoService.signUpUser = jest
        .fn()
        .mockRejectedValue(usernameExistsError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        usernameExistsError,
      );

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid password errors", async () => {
      // Arrange
      const invalidPasswordError = new AppError(
        "InvalidPasswordException",
        400,
      );
      mockCognitoService.signUpUser = jest
        .fn()
        .mockRejectedValue(invalidPasswordError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        invalidPasswordError,
      );
    });

    it("should handle invalid parameter errors", async () => {
      // Arrange
      const invalidParameterError = new AppError(
        "InvalidParameterException",
        400,
      );
      mockCognitoService.signUpUser = jest
        .fn()
        .mockRejectedValue(invalidParameterError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        invalidParameterError,
      );
    });

    it("should handle database constraint violations", async () => {
      // Arrange
      const constraintError = new AppError("Unique constraint violation", 409);
      mockAuthRepository.create = jest.fn().mockRejectedValue(constraintError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        constraintError,
      );
    });

    it("should handle network errors", async () => {
      // Arrange
      const networkError = new Error("Network timeout");
      mockCognitoService.signUpUser = jest.fn().mockRejectedValue(networkError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        networkError,
      );
    });

    it("should handle generic errors", async () => {
      // Arrange
      const genericError = new Error("Unknown error occurred");
      mockQueueHelper.sendUserSignupMessage = jest
        .fn()
        .mockRejectedValue(genericError);

      // Act & Assert
      await expect(signUpUseCase.execute(mockRequest)).rejects.toThrow(
        genericError,
      );
    });
  });

  describe("integration scenarios", () => {
    it("should execute complete flow successfully with proper call sequence", async () => {
      // Act
      const result = await signUpUseCase.execute(mockRequest);

      // Assert - Verify call sequence
      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(1);
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledTimes(1);

      // Verify call order - cognito first, then repository, then queue
      const cognitoCall =
        mockCognitoService.signUpUser.mock.invocationCallOrder[0];
      const repositoryCall =
        mockAuthRepository.create.mock.invocationCallOrder[0];
      const queueCall =
        mockQueueHelper.sendUserSignupMessage.mock.invocationCallOrder[0];

      expect(cognitoCall).toBeLessThan(repositoryCall);
      expect(repositoryCall).toBeLessThan(queueCall);

      expect(result).toEqual(expectedResponse);
    });

    it("should not modify the request object", async () => {
      // Arrange
      const originalRequest = { ...mockRequest };

      // Act
      await signUpUseCase.execute(mockRequest);

      // Assert
      expect(mockRequest).toEqual(originalRequest);
    });

    it("should handle multiple consecutive calls correctly", async () => {
      // Act
      const result1 = await signUpUseCase.execute(mockRequest);
      const result2 = await signUpUseCase.execute(mockRequest);

      // Assert
      expect(result1).toEqual(expectedResponse);
      expect(result2).toEqual(expectedResponse);
      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(2);
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(2);
      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledTimes(2);
    });

    it("should handle different request formats", async () => {
      // Arrange
      const requests: SignUpRequest[] = [
        {
          username: "user1",
          password: "pass1",
          email: "user1@domain.com",
          name: "User One",
        },
        {
          username: "user2@domain.com",
          password: "pass2",
          email: "user2@domain.com",
          phoneNumber: "+5511999999999",
          name: "User Two",
        },
        {
          username: "user-3_test",
          password: "pass3",
          email: "user3@domain.com",
          phoneNumber: "",
          name: "User Three",
        },
      ];

      // Act & Assert
      for (const request of requests) {
        const result = await signUpUseCase.execute(request);
        expect(result.username).toBe(request.username);
        expect(result).toHaveProperty("cognitoSub");
        expect(result).toHaveProperty("userConfirmed");
        expect(result).toHaveProperty("message");
      }

      expect(mockCognitoService.signUpUser).toHaveBeenCalledTimes(
        requests.length,
      );
    });

    it("should handle data consistency between repository and queue", async () => {
      // Act
      await signUpUseCase.execute(mockRequest);

      // Assert
      const repositoryData = mockAuthRepository.create.mock.calls[0][0];

      // Verify repository received correct data
      expect(repositoryData.username).toBe(mockRequest.username);
      expect(repositoryData.email).toBe(mockRequest.email);
      expect(repositoryData.phoneNumber).toBe(mockRequest.phoneNumber);
      expect(repositoryData.name).toBe(mockRequest.name);
      expect(repositoryData.cognitoSub).toBe(mockCognitoResponse.UserSub);
      expect(repositoryData.userConfirmed).toBe(false);

      // Verify queue received correct data
      expect(mockQueueHelper.sendUserSignupMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          username: mockRequest.username,
          email: mockRequest.email,
          phoneNumber: mockRequest.phoneNumber,
          name: mockRequest.name,
          cognitoSub: mockCognitoResponse.UserSub,
          userConfirmed: false,
        }),
      );
    });
  });
});
