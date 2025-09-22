/* eslint-disable sonarjs/no-duplicate-string */
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import AuthController from "../../src/controllers/auth.controller";

// Mock das dependências
const mockExecute = jest.fn() as jest.MockedFunction<any>;
const mockSafeParse = jest.fn();

jest.mock("../../src/services/cognito.service", () => ({
  CognitoService: jest.fn(),
}));

jest.mock("../../src/schemas/auth.schema", () => ({
  AuthSchemas: jest.fn().mockImplementation(() => ({
    signIn: { safeParse: mockSafeParse },
    signUp: { safeParse: mockSafeParse },
    confirmSignUp: { safeParse: mockSafeParse },
    resendConfirmationCode: { safeParse: mockSafeParse },
    forgotPassword: { safeParse: mockSafeParse },
    confirmForgotPassword: { safeParse: mockSafeParse },
  })),
}));

jest.mock("../../src/factory/auth.factory", () => ({
  UseCaseFactory: jest.fn().mockImplementation(() => ({
    createLoginUseCase: () => ({ execute: mockExecute }),
    createSignUpUseCase: () => ({ execute: mockExecute }),
    createConfirmSignUpUseCase: () => ({ execute: mockExecute }),
    createResendConfirmationCodeUseCase: () => ({ execute: mockExecute }),
    createForgotPasswordUseCase: () => ({ execute: mockExecute }),
    createConfirmForgotPasswordUseCase: () => ({ execute: mockExecute }),
  })),
}));

const test_email = "test@example.com";

describe("AuthController", () => {
  let authController: AuthController;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    jest.clearAllMocks();

    authController = new AuthController();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Constructor", () => {
    test("should create an instance of AuthController", () => {
      expect(authController).toBeInstanceOf(AuthController);
    });

    test("should have all required methods", () => {
      expect(typeof authController.login).toBe("function");
      expect(typeof authController.signin).toBe("function");
      expect(typeof authController.confirmSignUp).toBe("function");
      expect(typeof authController.resendConfirmationCode).toBe("function");
      expect(typeof authController.forgotPassword).toBe("function");
      expect(typeof authController.confirmForgotPassword).toBe("function");
      expect(typeof authController.logout).toBe("function");
    });
  });

  describe("login", () => {
    test("should login successfully with valid data", async () => {
      const loginData = {
        username: test_email,
        password: "password123",
      };
      const mockResponseData = {
        accessToken: "token",
        idToken: "idtoken",
        refreshToken: "refresh",
      };

      mockRequest.body = loginData;
      mockSafeParse.mockReturnValue({ success: true, data: loginData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.login(mockRequest, mockResponse, mockNext);

      expect(mockSafeParse).toHaveBeenCalledWith(loginData);
      expect(mockExecute).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = { username: "", password: "" };
      const validationErrors = [{ message: "Username is required" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.login(mockRequest, mockResponse, mockNext);

      expect(mockSafeParse).toHaveBeenCalledWith(invalidData);
      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Login failed");
      const loginData = {
        username: test_email,
        password: "password123",
      };

      mockRequest.body = loginData;
      mockSafeParse.mockReturnValue({ success: true, data: loginData });
      mockExecute.mockRejectedValue(error);

      await authController.login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("signin", () => {
    test("should signup successfully with valid data", async () => {
      const signUpData = {
        username: "newuser",
        password: "password123",
        email: test_email,
        phoneNumber: "+5511999999999",
        name: "Test User",
      };
      const mockResponseData = {
        cognitoSub: "sub-123",
        username: "newuser",
        userConfirmed: false,
        message: "User created",
      };

      mockRequest.body = signUpData;
      mockSafeParse.mockReturnValue({ success: true, data: signUpData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.signin(mockRequest, mockResponse, mockNext);

      expect(mockSafeParse).toHaveBeenCalledWith(signUpData);
      expect(mockExecute).toHaveBeenCalledWith(signUpData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = { username: "", email: "invalid" };
      const validationErrors = [{ message: "Invalid data" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.signin(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Signup failed");
      const signUpData = {
        username: "newuser",
        password: "password123",
        email: test_email,
        name: "Test",
      };

      mockRequest.body = signUpData;
      mockSafeParse.mockReturnValue({ success: true, data: signUpData });
      mockExecute.mockRejectedValue(error);

      await authController.signin(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("confirmSignUp", () => {
    test("should confirm signup successfully", async () => {
      const confirmData = { username: "testuser", confirmationCode: "123456" };
      const mockResponseData = { success: true, message: "Confirmed" };

      mockRequest.body = confirmData;
      mockSafeParse.mockReturnValue({ success: true, data: confirmData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.confirmSignUp(mockRequest, mockResponse, mockNext);

      expect(mockSafeParse).toHaveBeenCalledWith(confirmData);
      expect(mockExecute).toHaveBeenCalledWith(confirmData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = { username: "", confirmationCode: "" };
      const validationErrors = [{ message: "Code required" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.confirmSignUp(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Confirm failed");
      const confirmData = { username: "testuser", confirmationCode: "123456" };

      mockRequest.body = confirmData;
      mockSafeParse.mockReturnValue({ success: true, data: confirmData });
      mockExecute.mockRejectedValue(error);

      await authController.confirmSignUp(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("resendConfirmationCode", () => {
    test("should resend confirmation code successfully", async () => {
      const resendData = { username: "testuser" };
      const mockResponseData = {
        success: true,
        message: "Code sent",
        deliveryMethod: "EMAIL",
      };

      mockRequest.body = resendData;
      mockSafeParse.mockReturnValue({ success: true, data: resendData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.resendConfirmationCode(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockSafeParse).toHaveBeenCalledWith(resendData);
      expect(mockExecute).toHaveBeenCalledWith(resendData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = { username: "" };
      const validationErrors = [{ message: "Username required" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.resendConfirmationCode(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Resend failed");
      const resendData = { username: "testuser" };

      mockRequest.body = resendData;
      mockSafeParse.mockReturnValue({ success: true, data: resendData });
      mockExecute.mockRejectedValue(error);

      await authController.resendConfirmationCode(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("forgotPassword", () => {
    test("should initiate forgot password successfully", async () => {
      const forgotData = { username: "testuser" };
      const mockResponseData = {
        success: true,
        message: "Code sent",
        deliveryMethod: "EMAIL",
      };

      mockRequest.body = forgotData;
      mockSafeParse.mockReturnValue({ success: true, data: forgotData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.forgotPassword(mockRequest, mockResponse, mockNext);

      expect(mockSafeParse).toHaveBeenCalledWith(forgotData);
      expect(mockExecute).toHaveBeenCalledWith(forgotData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = { username: "" };
      const validationErrors = [{ message: "Username required" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.forgotPassword(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Forgot password failed");
      const forgotData = { username: "testuser" };

      mockRequest.body = forgotData;
      mockSafeParse.mockReturnValue({ success: true, data: forgotData });
      mockExecute.mockRejectedValue(error);

      await authController.forgotPassword(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("confirmForgotPassword", () => {
    test("should confirm forgot password successfully", async () => {
      const confirmForgotData = {
        username: "testuser",
        confirmationCode: "123456",
        newPassword: "newPassword123!",
      };
      const mockResponseData = { success: true, message: "Password reset" };

      mockRequest.body = confirmForgotData;
      mockSafeParse.mockReturnValue({ success: true, data: confirmForgotData });
      mockExecute.mockResolvedValue(mockResponseData);

      await authController.confirmForgotPassword(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockSafeParse).toHaveBeenCalledWith(confirmForgotData);
      expect(mockExecute).toHaveBeenCalledWith(confirmForgotData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    test("should return 400 when validation fails", async () => {
      const invalidData = {
        username: "",
        confirmationCode: "",
        newPassword: "weak",
      };
      const validationErrors = [{ message: "Password too weak" }];

      mockRequest.body = invalidData;
      mockSafeParse.mockReturnValue({
        success: false,
        error: { errors: validationErrors },
      });

      await authController.confirmForgotPassword(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: validationErrors,
      });
    });

    test("should call next with error when use case throws", async () => {
      const error = new Error("Confirm forgot password failed");
      const confirmForgotData = {
        username: "testuser",
        confirmationCode: "123456",
        newPassword: "newPassword123!",
      };

      mockRequest.body = confirmForgotData;
      mockSafeParse.mockReturnValue({ success: true, data: confirmForgotData });
      mockExecute.mockRejectedValue(error);

      await authController.confirmForgotPassword(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("logout", () => {
    test("should logout successfully", async () => {
      const expectedResponse = { message: "User logged out successfully." };

      await authController.logout(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    test("should call next with error when logout throws", async () => {
      const error = new Error("Logout failed");

      // Simular erro fazendo o response.json lançar exceção
      mockResponse.json.mockImplementation(() => {
        throw error;
      });

      await authController.logout(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
