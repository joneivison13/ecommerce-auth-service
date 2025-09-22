import { UseCaseFactory } from "../../src/factory/auth.factory";
import { CognitoService } from "../../src/services/cognito.service";
import { AuthSchemas } from "../../src/schemas/auth.schema";
import { AuthRepository } from "../../src/infra/database/repositories/auth.repository";
import { LoginUseCase } from "../../src/useCases/login.auth.usecase";
import { SignUpUseCase } from "../../src/useCases/signup.auth.usecase";
import { ConfirmSignUpUseCase } from "../../src/useCases/confirm-signup.auth.usecase";
import { ResendConfirmationCodeUseCase } from "../../src/useCases/resend-confirmation-code.auth.usecase";
import { ForgotPasswordUseCase } from "../../src/useCases/forgot-password.auth.usecase";
import { ConfirmForgotPasswordUseCase } from "../../src/useCases/confirm-forgot-password.auth.usecase";

// Mock das dependências
jest.mock("../../src/services/cognito.service");
jest.mock("../../src/schemas/auth.schema");
jest.mock("../../src/infra/database/repositories/auth.repository");
jest.mock("../../src/useCases/login.auth.usecase");
jest.mock("../../src/useCases/signup.auth.usecase");
jest.mock("../../src/useCases/confirm-signup.auth.usecase");
jest.mock("../../src/useCases/resend-confirmation-code.auth.usecase");
jest.mock("../../src/useCases/forgot-password.auth.usecase");
jest.mock("../../src/useCases/confirm-forgot-password.auth.usecase");

describe("UseCaseFactory", () => {
  let factory: UseCaseFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    factory = new UseCaseFactory();
  });

  describe("Constructor", () => {
    it("should create an instance of UseCaseFactory", () => {
      expect(factory).toBeInstanceOf(UseCaseFactory);
    });

    it("should initialize all dependencies", () => {
      // Clear mocks and create a fresh factory to test initialization
      jest.clearAllMocks();
      const testFactory = new UseCaseFactory();

      expect(CognitoService).toHaveBeenCalledTimes(1);
      expect(AuthRepository).toHaveBeenCalledTimes(1);
      expect(AuthSchemas).toHaveBeenCalledTimes(1);
      expect(testFactory).toBeInstanceOf(UseCaseFactory);
    });
  });

  describe("createLoginUseCase", () => {
    it("should create and return a LoginUseCase instance", () => {
      const loginUseCase = factory.createLoginUseCase();

      expect(LoginUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(loginUseCase).toBeInstanceOf(LoginUseCase);
    });

    it("should call LoginUseCase constructor with correct dependencies", () => {
      factory.createLoginUseCase();

      expect(LoginUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("createSignUpUseCase", () => {
    it("should create and return a SignUpUseCase instance", () => {
      const signUpUseCase = factory.createSignUpUseCase();

      expect(SignUpUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(signUpUseCase).toBeInstanceOf(SignUpUseCase);
    });

    it("should call SignUpUseCase constructor with correct dependencies", () => {
      factory.createSignUpUseCase();

      expect(SignUpUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("createConfirmSignUpUseCase", () => {
    it("should create and return a ConfirmSignUpUseCase instance", () => {
      const confirmSignUpUseCase = factory.createConfirmSignUpUseCase();

      expect(ConfirmSignUpUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(confirmSignUpUseCase).toBeInstanceOf(ConfirmSignUpUseCase);
    });

    it("should call ConfirmSignUpUseCase constructor with correct dependencies", () => {
      factory.createConfirmSignUpUseCase();

      expect(ConfirmSignUpUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("createResendConfirmationCodeUseCase", () => {
    it("should create and return a ResendConfirmationCodeUseCase instance", () => {
      const resendConfirmationCodeUseCase =
        factory.createResendConfirmationCodeUseCase();

      expect(ResendConfirmationCodeUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(resendConfirmationCodeUseCase).toBeInstanceOf(
        ResendConfirmationCodeUseCase,
      );
    });

    it("should call ResendConfirmationCodeUseCase constructor with correct dependencies", () => {
      factory.createResendConfirmationCodeUseCase();

      expect(ResendConfirmationCodeUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("createForgotPasswordUseCase", () => {
    it("should create and return a ForgotPasswordUseCase instance", () => {
      const forgotPasswordUseCase = factory.createForgotPasswordUseCase();

      expect(ForgotPasswordUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(forgotPasswordUseCase).toBeInstanceOf(ForgotPasswordUseCase);
    });

    it("should call ForgotPasswordUseCase constructor with correct dependencies", () => {
      factory.createForgotPasswordUseCase();

      expect(ForgotPasswordUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("createConfirmForgotPasswordUseCase", () => {
    it("should create and return a ConfirmForgotPasswordUseCase instance", () => {
      const confirmForgotPasswordUseCase =
        factory.createConfirmForgotPasswordUseCase();

      expect(ConfirmForgotPasswordUseCase).toHaveBeenCalledWith(
        expect.any(CognitoService),
        expect.any(AuthRepository),
      );
      expect(confirmForgotPasswordUseCase).toBeInstanceOf(
        ConfirmForgotPasswordUseCase,
      );
    });

    it("should call ConfirmForgotPasswordUseCase constructor with correct dependencies", () => {
      factory.createConfirmForgotPasswordUseCase();

      expect(ConfirmForgotPasswordUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("Dependency injection consistency", () => {
    it("should use the same dependencies across multiple use case creations", () => {
      // Clear mocks to get accurate count for this specific test
      jest.clearAllMocks();
      const testFactory = new UseCaseFactory();

      testFactory.createLoginUseCase();
      testFactory.createSignUpUseCase();
      testFactory.createConfirmSignUpUseCase();

      // Each factory instance should create dependencies only once in constructor
      expect(CognitoService).toHaveBeenCalledTimes(1);
      expect(AuthRepository).toHaveBeenCalledTimes(1);
      expect(AuthSchemas).toHaveBeenCalledTimes(1);
    });

    it("should create multiple instances of the same use case when called multiple times", () => {
      factory.createLoginUseCase();
      factory.createLoginUseCase();
      factory.createLoginUseCase();

      expect(LoginUseCase).toHaveBeenCalledTimes(3);
    });
  });

  describe("Factory method return types", () => {
    it("should return different instances for different use cases", () => {
      const loginUseCase1 = factory.createLoginUseCase();
      const loginUseCase2 = factory.createLoginUseCase();
      const signUpUseCase = factory.createSignUpUseCase();

      // Cada chamada deve retornar uma nova instância
      expect(loginUseCase1).not.toBe(loginUseCase2);
      expect(loginUseCase1).not.toBe(signUpUseCase);
    });

    it("should return instances with correct types", () => {
      const loginUseCase = factory.createLoginUseCase();
      const signUpUseCase = factory.createSignUpUseCase();
      const confirmSignUpUseCase = factory.createConfirmSignUpUseCase();
      const resendConfirmationCodeUseCase =
        factory.createResendConfirmationCodeUseCase();
      const forgotPasswordUseCase = factory.createForgotPasswordUseCase();
      const confirmForgotPasswordUseCase =
        factory.createConfirmForgotPasswordUseCase();

      expect(loginUseCase).toBeInstanceOf(LoginUseCase);
      expect(signUpUseCase).toBeInstanceOf(SignUpUseCase);
      expect(confirmSignUpUseCase).toBeInstanceOf(ConfirmSignUpUseCase);
      expect(resendConfirmationCodeUseCase).toBeInstanceOf(
        ResendConfirmationCodeUseCase,
      );
      expect(forgotPasswordUseCase).toBeInstanceOf(ForgotPasswordUseCase);
      expect(confirmForgotPasswordUseCase).toBeInstanceOf(
        ConfirmForgotPasswordUseCase,
      );
    });
  });

  describe("Error handling", () => {
    it("should handle errors during dependency instantiation", () => {
      // Mock CognitoService constructor to throw error
      (CognitoService as jest.Mock).mockImplementationOnce(() => {
        throw new Error("CognitoService initialization failed");
      });

      expect(() => {
        new UseCaseFactory();
      }).toThrow("CognitoService initialization failed");
    });

    it("should handle errors during AuthRepository instantiation", () => {
      // Mock AuthRepository constructor to throw error
      (AuthRepository as jest.Mock).mockImplementationOnce(() => {
        throw new Error("AuthRepository initialization failed");
      });

      expect(() => {
        new UseCaseFactory();
      }).toThrow("AuthRepository initialization failed");
    });

    it("should handle errors during AuthSchemas instantiation", () => {
      // Mock AuthSchemas constructor to throw error
      (AuthSchemas as jest.Mock).mockImplementationOnce(() => {
        throw new Error("AuthSchemas initialization failed");
      });

      expect(() => {
        new UseCaseFactory();
      }).toThrow("AuthSchemas initialization failed");
    });
  });

  describe("All factory methods coverage", () => {
    it("should cover all factory methods in a single test", () => {
      const loginUseCase = factory.createLoginUseCase();
      const signUpUseCase = factory.createSignUpUseCase();
      const confirmSignUpUseCase = factory.createConfirmSignUpUseCase();
      const resendConfirmationCodeUseCase =
        factory.createResendConfirmationCodeUseCase();
      const forgotPasswordUseCase = factory.createForgotPasswordUseCase();
      const confirmForgotPasswordUseCase =
        factory.createConfirmForgotPasswordUseCase();

      expect(loginUseCase).toBeDefined();
      expect(signUpUseCase).toBeDefined();
      expect(confirmSignUpUseCase).toBeDefined();
      expect(resendConfirmationCodeUseCase).toBeDefined();
      expect(forgotPasswordUseCase).toBeDefined();
      expect(confirmForgotPasswordUseCase).toBeDefined();

      // Verify all use cases were called
      expect(LoginUseCase).toHaveBeenCalled();
      expect(SignUpUseCase).toHaveBeenCalled();
      expect(ConfirmSignUpUseCase).toHaveBeenCalled();
      expect(ResendConfirmationCodeUseCase).toHaveBeenCalled();
      expect(ForgotPasswordUseCase).toHaveBeenCalled();
      expect(ConfirmForgotPasswordUseCase).toHaveBeenCalled();
    });
  });
});
