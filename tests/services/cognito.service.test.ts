/* eslint-disable sonarjs/no-duplicate-string */
import { CognitoService } from "../../src/services/cognito.service";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import * as crypto from "crypto";
import logger from "../../src/utils/logger";
import AppError from "../../src/utils/error";

// Test constants
const TEST_CLIENT_ID = "test-client-id";
const TEST_CLIENT_SECRET = "test-client-secret";
const TEST_HASH = "mocked-hash";
const TEST_USER_POOL_ID = "us-east-1_testpool";
const TEST_REGION = "us-east-1";
const TEST_EMAIL = "test@example.com";
const TEST_PHONE = "+5511999999999";
const TEST_USERNAME = "testuser";
const TEST_PASSWORD = "password123";
const CRYPTO_ALGORITHM = "sha256";
const TEST_USER_SUB = "user-sub-id";
const TEST_DESTINATION = "t***@example.com";
const TEST_ACCESS_TOKEN = "access-token";
const TEST_REFRESH_TOKEN = "refresh-token";
const TEST_ID_TOKEN = "id-token";
const TEST_CONFIRMATION_CODE = "123456";
const TEST_NEW_PASSWORD = "NewPassword123!";
const TEST_SESSION = "session-token";

// Mock all dependencies
jest.mock("aws-sdk");
jest.mock("crypto", () => ({
  createHmac: jest.fn(),
}));
jest.mock("../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock("../../src/config/cognito.config", () => ({
  cognitoConfig: {
    UserPoolId: "us-east-1_testpool",
    ClientId: "test-client-id",
    ClientSecret: "test-client-secret",
    region: "us-east-1",
  },
}));
jest.mock("../../src/utils/error");

const mockedCognitoIdentityServiceProvider =
  CognitoIdentityServiceProvider as jest.MockedClass<
    typeof CognitoIdentityServiceProvider
  >;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedLogger = logger as jest.Mocked<typeof logger>;
const MockedAppError = AppError as jest.MockedClass<typeof AppError>;

interface MockCognitoClient {
  initiateAuth: jest.Mock;
  signUp: jest.Mock;
  confirmSignUp: jest.Mock;
  resendConfirmationCode: jest.Mock;
  forgotPassword: jest.Mock;
  confirmForgotPassword: jest.Mock;
}

// Type assertion helper for accessing private members
interface CognitoServiceWithPrivates {
  UserPoolId: string;
  ClientId: string;
  ClientSecret?: string;
  region: string;
  generateSecretHash: (username: string) => string;
}

describe("CognitoService", () => {
  let cognitoService: CognitoService;
  let mockCognitoClient: MockCognitoClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Cognito client
    mockCognitoClient = {
      initiateAuth: jest.fn(),
      signUp: jest.fn(),
      confirmSignUp: jest.fn(),
      resendConfirmationCode: jest.fn(),
      forgotPassword: jest.fn(),
      confirmForgotPassword: jest.fn(),
    };

    // Mock the promise methods
    (Object.keys(mockCognitoClient) as Array<keyof MockCognitoClient>).forEach(
      key => {
        mockCognitoClient[key].mockReturnValue({
          promise: jest.fn(),
        });
      },
    );

    mockedCognitoIdentityServiceProvider.mockImplementation(
      () => mockCognitoClient as never,
    );

    // Setup crypto mock
    const mockHmac = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(TEST_HASH),
    };
    (mockedCrypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

    cognitoService = new CognitoService();
  });

  describe("Constructor", () => {
    it("should initialize with correct Cognito configuration", () => {
      expect(mockedCognitoIdentityServiceProvider).toHaveBeenCalledWith({
        region: TEST_REGION,
      });
    });

    it("should set up private properties from config", () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      expect(serviceWithPrivates.UserPoolId).toBe(TEST_USER_POOL_ID);
      expect(serviceWithPrivates.ClientId).toBe(TEST_CLIENT_ID);
      expect(serviceWithPrivates.ClientSecret).toBe(TEST_CLIENT_SECRET);
      expect(serviceWithPrivates.region).toBe(TEST_REGION);
    });
  });

  describe("generateSecretHash", () => {
    it("should generate correct secret hash", () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;

      const result = serviceWithPrivates.generateSecretHash(TEST_USERNAME);

      expect(mockedCrypto.createHmac).toHaveBeenCalledWith(
        CRYPTO_ALGORITHM,
        TEST_CLIENT_SECRET,
      );
      expect(result).toBe(TEST_HASH);
    });

    it("should throw error when ClientSecret is not configured", () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;

      expect(() => {
        serviceWithPrivates.generateSecretHash(TEST_USERNAME);
      }).toThrow("CLIENT_SECRET is required but not configured");
    });

    it("should handle different usernames correctly", () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      const usernames = ["user1", "user@example.com", "123456789"];

      usernames.forEach(username => {
        serviceWithPrivates.generateSecretHash(username);
        expect(mockedCrypto.createHmac).toHaveBeenCalledWith(
          CRYPTO_ALGORITHM,
          TEST_CLIENT_SECRET,
        );
      });
    });
  });

  describe("signIn", () => {
    const signInRequest = {
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    };

    it("should sign in user successfully with ClientSecret", async () => {
      const mockResponse = {
        AuthenticationResult: {
          AccessToken: TEST_ACCESS_TOKEN,
          RefreshToken: TEST_REFRESH_TOKEN,
          IdToken: TEST_ID_TOKEN,
        },
      };

      mockCognitoClient.initiateAuth().promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.signIn(signInRequest);

      expect(mockCognitoClient.initiateAuth).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: TEST_USERNAME,
          PASSWORD: TEST_PASSWORD,
          SECRET_HASH: TEST_HASH,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should sign in user successfully without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;

      const mockResponse = {
        AuthenticationResult: {
          AccessToken: TEST_ACCESS_TOKEN,
        },
      };

      mockCognitoClient.initiateAuth().promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.signIn(signInRequest);

      expect(mockCognitoClient.initiateAuth).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: TEST_USERNAME,
          PASSWORD: TEST_PASSWORD,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle NEW_PASSWORD_REQUIRED challenge", async () => {
      const mockResponse = {
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: TEST_SESSION,
      };

      mockCognitoClient.initiateAuth().promise.mockResolvedValue(mockResponse);
      MockedAppError.mockImplementation((message, statusCode) => {
        const error = Object.assign(new Error(message), { statusCode });
        return error as AppError;
      });

      await expect(cognitoService.signIn(signInRequest)).rejects.toThrow();
      expect(MockedAppError).toHaveBeenCalledWith("New password required", 403);
      expect(mockedLogger.info).toHaveBeenCalledWith("New password required.");
    });

    it("should handle other authentication challenges", async () => {
      const mockResponse = {
        ChallengeName: "MFA_REQUIRED",
        Session: TEST_SESSION,
      };

      mockCognitoClient.initiateAuth().promise.mockResolvedValue(mockResponse);
      MockedAppError.mockImplementation((message, statusCode) => {
        const error = Object.assign(new Error(message), { statusCode });
        return error as AppError;
      });

      await expect(cognitoService.signIn(signInRequest)).rejects.toThrow();
      expect(MockedAppError).toHaveBeenCalledWith(
        "Authentication failed: MFA_REQUIRED",
        401,
      );
    });

    it("should handle and propagate Cognito errors", async () => {
      const cognitoError = new Error("Invalid credentials");
      mockCognitoClient.initiateAuth().promise.mockRejectedValue(cognitoError);

      await expect(cognitoService.signIn(signInRequest)).rejects.toThrow(
        "Invalid credentials",
      );
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error signing in user:",
        cognitoError,
      );
    });
  });

  describe("signUpUser", () => {
    const signUpRequest = {
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      email: TEST_EMAIL,
      name: "Test User",
      phoneNumber: TEST_PHONE,
    };

    it("should sign up user with all attributes", async () => {
      const mockResponse = {
        UserSub: TEST_USER_SUB,
        CodeDeliveryDetails: {
          Destination: TEST_DESTINATION,
        },
      };

      mockCognitoClient.signUp().promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.signUpUser(signUpRequest);

      expect(mockCognitoClient.signUp).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        Password: TEST_PASSWORD,
        UserAttributes: [
          { Name: "email", Value: TEST_EMAIL },
          { Name: "name", Value: "Test User" },
          { Name: "phone_number", Value: TEST_PHONE },
        ],
        SecretHash: TEST_HASH,
      });
      expect(result).toEqual(mockResponse);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "User signed up:",
        TEST_USER_SUB,
      );
    });

    it("should sign up user without optional phone number", async () => {
      const requestWithoutPhone = {
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        email: TEST_EMAIL,
        name: "Test User",
      };

      const mockResponse = {
        UserSub: TEST_USER_SUB,
      };

      mockCognitoClient.signUp().promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.signUpUser(requestWithoutPhone);

      expect(mockCognitoClient.signUp).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        Password: TEST_PASSWORD,
        UserAttributes: [
          { Name: "email", Value: TEST_EMAIL },
          { Name: "name", Value: "Test User" },
        ],
        SecretHash: TEST_HASH,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should sign up user without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;

      const mockResponse = { UserSub: TEST_USER_SUB };
      mockCognitoClient.signUp().promise.mockResolvedValue(mockResponse);

      await cognitoService.signUpUser(signUpRequest);

      expect(mockCognitoClient.signUp).toHaveBeenCalledWith(
        expect.not.objectContaining({ SecretHash: expect.anything() }),
      );
    });

    it("should handle and propagate sign up errors", async () => {
      const signUpError = new Error("User already exists");
      mockCognitoClient.signUp().promise.mockRejectedValue(signUpError);

      await expect(cognitoService.signUpUser(signUpRequest)).rejects.toThrow(
        "User already exists",
      );
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error signing up user:",
        signUpError,
      );
    });
  });

  describe("confirmSignUp", () => {
    const confirmRequest = {
      username: TEST_USERNAME,
      confirmationCode: TEST_CONFIRMATION_CODE,
    };

    it("should confirm sign up successfully", async () => {
      mockCognitoClient.confirmSignUp().promise.mockResolvedValue({});

      const result = await cognitoService.confirmSignUp(confirmRequest);

      expect(mockCognitoClient.confirmSignUp).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        ConfirmationCode: TEST_CONFIRMATION_CODE,
        SecretHash: TEST_HASH,
      });
      expect(result).toBe(true);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "User confirmed successfully:",
        TEST_USERNAME,
      );
    });

    it("should confirm sign up without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;
      mockCognitoClient.confirmSignUp().promise.mockResolvedValue({});

      await cognitoService.confirmSignUp(confirmRequest);

      expect(mockCognitoClient.confirmSignUp).toHaveBeenCalledWith(
        expect.not.objectContaining({ SecretHash: expect.anything() }),
      );
    });

    it("should handle and propagate confirm sign up errors", async () => {
      const confirmError = new Error("Invalid confirmation code");
      mockCognitoClient.confirmSignUp().promise.mockRejectedValue(confirmError);

      await expect(
        cognitoService.confirmSignUp(confirmRequest),
      ).rejects.toThrow("Invalid confirmation code");
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error confirming sign up:",
        confirmError,
      );
    });
  });

  describe("resendConfirmationCode", () => {
    const resendRequest = {
      username: TEST_USERNAME,
    };

    it("should resend confirmation code successfully", async () => {
      const mockResponse = {
        CodeDeliveryDetails: {
          Destination: TEST_DESTINATION,
        },
      };

      mockCognitoClient
        .resendConfirmationCode()
        .promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.resendConfirmationCode(resendRequest);

      expect(mockCognitoClient.resendConfirmationCode).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        SecretHash: TEST_HASH,
      });
      expect(result).toEqual(mockResponse);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Confirmation code resent to:",
        TEST_USERNAME,
      );
    });

    it("should resend confirmation code without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;
      const mockResponse = { CodeDeliveryDetails: {} };
      mockCognitoClient
        .resendConfirmationCode()
        .promise.mockResolvedValue(mockResponse);

      await cognitoService.resendConfirmationCode(resendRequest);

      expect(mockCognitoClient.resendConfirmationCode).toHaveBeenCalledWith(
        expect.not.objectContaining({ SecretHash: expect.anything() }),
      );
    });

    it("should handle and propagate resend confirmation code errors", async () => {
      const resendError = new Error("User not found");
      mockCognitoClient
        .resendConfirmationCode()
        .promise.mockRejectedValue(resendError);

      await expect(
        cognitoService.resendConfirmationCode(resendRequest),
      ).rejects.toThrow("User not found");
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error resending confirmation code:",
        resendError,
      );
    });
  });

  describe("forgotPassword", () => {
    const forgotRequest = {
      username: TEST_USERNAME,
    };

    it("should initiate forgot password successfully", async () => {
      const mockResponse = {
        CodeDeliveryDetails: {
          Destination: TEST_DESTINATION,
        },
      };

      mockCognitoClient
        .forgotPassword()
        .promise.mockResolvedValue(mockResponse);

      const result = await cognitoService.forgotPassword(forgotRequest);

      expect(mockCognitoClient.forgotPassword).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        SecretHash: TEST_HASH,
      });
      expect(result).toEqual(mockResponse);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Password reset code sent to:",
        TEST_USERNAME,
      );
    });

    it("should initiate forgot password without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;
      const mockResponse = { CodeDeliveryDetails: {} };
      mockCognitoClient
        .forgotPassword()
        .promise.mockResolvedValue(mockResponse);

      await cognitoService.forgotPassword(forgotRequest);

      expect(mockCognitoClient.forgotPassword).toHaveBeenCalledWith(
        expect.not.objectContaining({ SecretHash: expect.anything() }),
      );
    });

    it("should handle and propagate forgot password errors", async () => {
      const forgotError = new Error("User not confirmed");
      mockCognitoClient.forgotPassword().promise.mockRejectedValue(forgotError);

      await expect(
        cognitoService.forgotPassword(forgotRequest),
      ).rejects.toThrow("User not confirmed");
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error initiating password reset:",
        forgotError,
      );
    });
  });

  describe("confirmForgotPassword", () => {
    const confirmForgotRequest = {
      username: TEST_USERNAME,
      confirmationCode: TEST_CONFIRMATION_CODE,
      newPassword: TEST_NEW_PASSWORD,
    };

    it("should confirm forgot password successfully", async () => {
      mockCognitoClient.confirmForgotPassword().promise.mockResolvedValue({});

      const result =
        await cognitoService.confirmForgotPassword(confirmForgotRequest);

      expect(mockCognitoClient.confirmForgotPassword).toHaveBeenCalledWith({
        ClientId: TEST_CLIENT_ID,
        Username: TEST_USERNAME,
        ConfirmationCode: TEST_CONFIRMATION_CODE,
        Password: TEST_NEW_PASSWORD,
        SecretHash: TEST_HASH,
      });
      expect(result).toBe(true);
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Password reset completed for:",
        TEST_USERNAME,
      );
    });

    it("should confirm forgot password without ClientSecret", async () => {
      const serviceWithPrivates =
        cognitoService as unknown as CognitoServiceWithPrivates;
      serviceWithPrivates.ClientSecret = undefined;
      mockCognitoClient.confirmForgotPassword().promise.mockResolvedValue({});

      await cognitoService.confirmForgotPassword(confirmForgotRequest);

      expect(mockCognitoClient.confirmForgotPassword).toHaveBeenCalledWith(
        expect.not.objectContaining({ SecretHash: expect.anything() }),
      );
    });

    it("should handle and propagate confirm forgot password errors", async () => {
      const confirmForgotError = new Error("Invalid confirmation code");
      mockCognitoClient
        .confirmForgotPassword()
        .promise.mockRejectedValue(confirmForgotError);

      await expect(
        cognitoService.confirmForgotPassword(confirmForgotRequest),
      ).rejects.toThrow("Invalid confirmation code");
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Error confirming password reset:",
        confirmForgotError,
      );
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle empty responses from Cognito", async () => {
      mockCognitoClient.signUp().promise.mockResolvedValue({});

      const result = await cognitoService.signUpUser({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        email: TEST_EMAIL,
        name: "Test User",
      });

      expect(result).toEqual({});
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "User signed up:",
        undefined,
      );
    });

    it("should handle authentication result without challenges", async () => {
      const mockResponse = {
        AuthenticationResult: null,
        ChallengeName: undefined,
      };

      mockCognitoClient.initiateAuth().promise.mockResolvedValue(mockResponse);

      await expect(
        cognitoService.signIn({
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow();
    });

    it("should handle network errors and AWS service errors", async () => {
      const networkError = new Error("Network timeout");
      networkError.name = "NetworkingError";

      mockCognitoClient.initiateAuth().promise.mockRejectedValue(networkError);

      await expect(
        cognitoService.signIn({
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow("Network timeout");
    });

    it("should handle different phone number formats", async () => {
      const phoneNumbers = ["+1234567890", TEST_PHONE, "+441234567890"];

      for (const phoneNumber of phoneNumbers) {
        mockCognitoClient
          .signUp()
          .promise.mockResolvedValue({ UserSub: "test" });

        await cognitoService.signUpUser({
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
          email: TEST_EMAIL,
          name: "Test User",
          phoneNumber,
        });

        const callArgs = mockCognitoClient.signUp.mock.calls.slice(-1)[0][0];
        const phoneAttribute = callArgs.UserAttributes.find(
          (attr: { Name: string; Value: string }) =>
            attr.Name === "phone_number",
        );
        expect(phoneAttribute.Value).toBe(phoneNumber);
      }
    });

    it("should handle special characters in usernames and passwords", async () => {
      const specialCases = [
        { username: "user@domain.com", password: "Pass@123!" },
        { username: "user.name+tag", password: "P@ssw0rd#" },
        { username: "123456789", password: "Temp$Password1" },
      ];

      for (const { username, password } of specialCases) {
        mockCognitoClient.initiateAuth().promise.mockResolvedValue({
          AuthenticationResult: { AccessToken: "token" },
        });

        await cognitoService.signIn({ username, password });

        const callArgs =
          mockCognitoClient.initiateAuth.mock.calls.slice(-1)[0][0];
        expect(callArgs.AuthParameters.USERNAME).toBe(username);
        expect(callArgs.AuthParameters.PASSWORD).toBe(password);
      }
    });

    it("should handle undefined or null values gracefully", async () => {
      const requestWithUndefined = {
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        email: TEST_EMAIL,
        name: "Test User",
        phoneNumber: undefined,
      };

      mockCognitoClient.signUp().promise.mockResolvedValue({ UserSub: "test" });

      await cognitoService.signUpUser(requestWithUndefined);

      const callArgs = mockCognitoClient.signUp.mock.calls.slice(-1)[0][0];
      const hasPhoneAttribute = callArgs.UserAttributes.some(
        (attr: { Name: string; Value: string }) => attr.Name === "phone_number",
      );
      expect(hasPhoneAttribute).toBe(false);
    });
  });
});
