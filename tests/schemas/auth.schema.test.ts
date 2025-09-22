/* eslint-disable sonarjs/no-duplicate-string */
import { AuthSchemas } from "../../src/schemas/auth.schema";
import {
  SignInSchemaType,
  SignUpSchemaType,
  ConfirmSignUpSchemaType,
  ResendConfirmationCodeSchemaType,
  ForgotPasswordSchemaType,
  ConfirmForgotPasswordSchemaType,
} from "../../src/schemas/auth.schema";
import { ZodError } from "zod";

describe("AuthSchemas", () => {
  let authSchemas: AuthSchemas;

  beforeEach(() => {
    authSchemas = new AuthSchemas();
  });

  describe("Constructor", () => {
    it("should initialize all schemas", () => {
      expect(authSchemas.signIn).toBeDefined();
      expect(authSchemas.signUp).toBeDefined();
      expect(authSchemas.confirmSignUp).toBeDefined();
      expect(authSchemas.resendConfirmationCode).toBeDefined();
      expect(authSchemas.forgotPassword).toBeDefined();
      expect(authSchemas.confirmForgotPassword).toBeDefined();
    });

    it("should create schemas as Zod objects with parse methods", () => {
      expect(typeof authSchemas.signIn.parse).toBe("function");
      expect(typeof authSchemas.signUp.parse).toBe("function");
      expect(typeof authSchemas.confirmSignUp.parse).toBe("function");
      expect(typeof authSchemas.resendConfirmationCode.parse).toBe("function");
      expect(typeof authSchemas.forgotPassword.parse).toBe("function");
      expect(typeof authSchemas.confirmForgotPassword.parse).toBe("function");
    });
  });

  describe("signIn Schema", () => {
    it("should validate correct signIn data", () => {
      const validData = {
        username: "testuser",
        password: "password123",
      };

      const result = authSchemas.signIn.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject username shorter than 3 characters", () => {
      const invalidData = {
        username: "ab",
        password: "password123",
      };

      expect(() => authSchemas.signIn.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signIn.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O nome de usuário deve ter pelo menos 3 caracteres",
        );
      }
    });

    it("should reject username longer than 30 characters", () => {
      const invalidData = {
        username: "a".repeat(31),
        password: "password123",
      };

      expect(() => authSchemas.signIn.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signIn.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O nome de usuário deve ter no máximo 30 caracteres",
        );
      }
    });

    it("should reject password shorter than 6 characters", () => {
      const invalidData = {
        username: "testuser",
        password: "12345",
      };

      expect(() => authSchemas.signIn.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signIn.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A senha deve ter pelo menos 6 caracteres",
        );
      }
    });

    it("should reject password longer than 100 characters", () => {
      const invalidData = {
        username: "testuser",
        password: "a".repeat(101),
      };

      expect(() => authSchemas.signIn.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signIn.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A senha deve ter no máximo 100 caracteres",
        );
      }
    });

    it("should reject missing fields", () => {
      expect(() => authSchemas.signIn.parse({})).toThrow(ZodError);
      expect(() => authSchemas.signIn.parse({ username: "test" })).toThrow(
        ZodError,
      );
      expect(() => authSchemas.signIn.parse({ password: "password" })).toThrow(
        ZodError,
      );
    });
  });

  describe("signUp Schema", () => {
    const validSignUpData = {
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      name: "João Silva",
    };

    it("should validate correct signUp data", () => {
      const result = authSchemas.signUp.parse(validSignUpData);
      expect(result).toEqual(validSignUpData);
    });

    it("should validate signUp data with optional phone number", () => {
      const dataWithPhone = {
        ...validSignUpData,
        phoneNumber: "+5511999999999",
      };

      const result = authSchemas.signUp.parse(dataWithPhone);
      expect(result).toEqual(dataWithPhone);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        ...validSignUpData,
        email: "invalid-email",
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe("E-mail inválido");
      }
    });

    it("should reject invalid phone number format", () => {
      const invalidData = {
        ...validSignUpData,
        phoneNumber: "11999999999", // Missing +
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O telefone deve estar no formato internacional, ex: +5573999999999",
        );
      }
    });

    it("should reject phone number too short", () => {
      const invalidData = {
        ...validSignUpData,
        phoneNumber: "+123456789", // Only 9 digits after +
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject phone number too long", () => {
      const invalidData = {
        ...validSignUpData,
        phoneNumber: "+1234567890123456", // 16 digits after +
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidData = {
        ...validSignUpData,
        name: "A",
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O nome deve ter pelo menos 2 caracteres",
        );
      }
    });

    it("should reject name longer than 50 characters", () => {
      const invalidData = {
        ...validSignUpData,
        name: "A".repeat(51),
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O nome deve ter no máximo 50 caracteres",
        );
      }
    });

    it("should reject name without surname", () => {
      const invalidData = {
        ...validSignUpData,
        name: "João",
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);

      try {
        authSchemas.signUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O nome deve conter pelo menos nome e sobrenome",
        );
      }
    });

    it("should accept name with multiple spaces", () => {
      const validData = {
        ...validSignUpData,
        name: "João   Silva   Santos",
      };

      const result = authSchemas.signUp.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject name with only spaces", () => {
      const invalidData = {
        ...validSignUpData,
        name: "   João   ",
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe("confirmSignUp Schema", () => {
    it("should validate correct confirmSignUp data", () => {
      const validData = {
        username: "testuser",
        confirmationCode: "123456",
      };

      const result = authSchemas.confirmSignUp.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject confirmation code shorter than 6 characters", () => {
      const invalidData = {
        username: "testuser",
        confirmationCode: "12345",
      };

      expect(() => authSchemas.confirmSignUp.parse(invalidData)).toThrow(
        ZodError,
      );

      try {
        authSchemas.confirmSignUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O código de confirmação deve ter 6 caracteres",
        );
      }
    });

    it("should reject confirmation code longer than 6 characters", () => {
      const invalidData = {
        username: "testuser",
        confirmationCode: "1234567",
      };

      expect(() => authSchemas.confirmSignUp.parse(invalidData)).toThrow(
        ZodError,
      );

      try {
        authSchemas.confirmSignUp.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "O código de confirmação deve ter 6 caracteres",
        );
      }
    });

    it("should apply username validations to confirmSignUp", () => {
      const invalidData = {
        username: "ab", // Too short
        confirmationCode: "123456",
      };

      expect(() => authSchemas.confirmSignUp.parse(invalidData)).toThrow(
        ZodError,
      );
    });
  });

  describe("resendConfirmationCode Schema", () => {
    it("should validate correct resendConfirmationCode data", () => {
      const validData = {
        username: "testuser",
      };

      const result = authSchemas.resendConfirmationCode.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should apply username validations to resendConfirmationCode", () => {
      const invalidData = {
        username: "ab", // Too short
      };

      expect(() =>
        authSchemas.resendConfirmationCode.parse(invalidData),
      ).toThrow(ZodError);
    });

    it("should reject missing username", () => {
      expect(() => authSchemas.resendConfirmationCode.parse({})).toThrow(
        ZodError,
      );
    });
  });

  describe("forgotPassword Schema", () => {
    it("should validate correct forgotPassword data", () => {
      const validData = {
        username: "testuser",
      };

      const result = authSchemas.forgotPassword.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should apply username validations to forgotPassword", () => {
      const invalidData = {
        username: "a".repeat(31), // Too long
      };

      expect(() => authSchemas.forgotPassword.parse(invalidData)).toThrow(
        ZodError,
      );
    });

    it("should reject missing username", () => {
      expect(() => authSchemas.forgotPassword.parse({})).toThrow(ZodError);
    });
  });

  describe("confirmForgotPassword Schema", () => {
    const validConfirmForgotPasswordData = {
      username: "testuser",
      confirmationCode: "123456",
      newPassword: "NewPass123!",
    };

    it("should validate correct confirmForgotPassword data", () => {
      const result = authSchemas.confirmForgotPassword.parse(
        validConfirmForgotPasswordData,
      );
      expect(result).toEqual(validConfirmForgotPasswordData);
    });

    it("should reject new password shorter than 8 characters", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "Pass1!",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve ter pelo menos 8 caracteres",
        );
      }
    });

    it("should reject new password longer than 100 characters", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "A".repeat(101) + "1!",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve ter no máximo 100 caracteres",
        );
      }
    });

    it("should reject new password without lowercase letter", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "NEWPASS123!",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
        );
      }
    });

    it("should reject new password without uppercase letter", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "newpass123!",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
        );
      }
    });

    it("should reject new password without number", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "NewPassword!",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
        );
      }
    });

    it("should reject new password without special character", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        newPassword: "NewPassword123",
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);

      try {
        authSchemas.confirmForgotPassword.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).issues[0].message).toBe(
          "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
        );
      }
    });

    it("should accept different special characters", () => {
      const validPasswords = [
        "NewPass123@",
        "NewPass123$",
        "NewPass123!",
        "NewPass123%",
        "NewPass123*",
        "NewPass123?",
        "NewPass123&",
      ];

      validPasswords.forEach(password => {
        const validData = {
          ...validConfirmForgotPasswordData,
          newPassword: password,
        };

        expect(() =>
          authSchemas.confirmForgotPassword.parse(validData),
        ).not.toThrow();
      });
    });

    it("should apply confirmation code validations", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        confirmationCode: "12345", // Too short
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);
    });

    it("should apply username validations", () => {
      const invalidData = {
        ...validConfirmForgotPasswordData,
        username: "ab", // Too short
      };

      expect(() =>
        authSchemas.confirmForgotPassword.parse(invalidData),
      ).toThrow(ZodError);
    });
  });

  describe("Type Definitions", () => {
    it("should export correct TypeScript types", () => {
      // Test that types can be used (this is compile-time validation)
      const signInData: SignInSchemaType = {
        username: "test",
        password: "password",
      };

      const signUpData: SignUpSchemaType = {
        username: "test",
        password: "password",
        email: "test@example.com",
        name: "Test User",
      };

      const confirmSignUpData: ConfirmSignUpSchemaType = {
        username: "test",
        confirmationCode: "123456",
      };

      const resendData: ResendConfirmationCodeSchemaType = {
        username: "test",
      };

      const forgotData: ForgotPasswordSchemaType = {
        username: "test",
      };

      const confirmForgotData: ConfirmForgotPasswordSchemaType = {
        username: "test",
        confirmationCode: "123456",
        newPassword: "NewPass123!",
      };

      // Verify types are properly inferred
      expect(typeof signInData.username).toBe("string");
      expect(typeof signUpData.email).toBe("string");
      expect(typeof confirmSignUpData.confirmationCode).toBe("string");
      expect(typeof resendData.username).toBe("string");
      expect(typeof forgotData.username).toBe("string");
      expect(typeof confirmForgotData.newPassword).toBe("string");
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle multiple validation errors", () => {
      const invalidSignInData = {
        username: "ab", // Too short
        password: "123", // Too short
      };

      try {
        authSchemas.signIn.parse(invalidSignInData);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues).toHaveLength(2);
        expect(zodError.issues[0].message).toBe(
          "O nome de usuário deve ter pelo menos 3 caracteres",
        );
        expect(zodError.issues[1].message).toBe(
          "A senha deve ter pelo menos 6 caracteres",
        );
      }
    });

    it("should handle complex invalid signUp data", () => {
      const invalidData = {
        username: "ab",
        password: "123",
        email: "invalid",
        phoneNumber: "123",
        name: "A",
      };

      expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);
    });

    it("should validate phone number with different country codes", () => {
      const validPhoneNumbers = [
        "+5511999999999", // Brazil
        "+1234567890123", // Generic
        "+4471234567890", // UK format
      ];

      validPhoneNumbers.forEach(phoneNumber => {
        const validData = {
          username: "testuser",
          password: "password123",
          email: "test@example.com",
          name: "Test User",
          phoneNumber,
        };

        expect(() => authSchemas.signUp.parse(validData)).not.toThrow();
      });
    });

    it("should handle name edge cases", () => {
      const validNames = [
        "João Silva",
        "Maria José Santos",
        "A B", // Minimum valid
        "José   da    Silva", // Multiple spaces
      ];

      validNames.forEach(name => {
        const validData = {
          username: "testuser",
          password: "password123",
          email: "test@example.com",
          name,
        };

        expect(() => authSchemas.signUp.parse(validData)).not.toThrow();
      });
    });

    it("should reject invalid name patterns", () => {
      const invalidNames = [
        "João", // Single name
        "   ", // Only spaces
        "", // Empty
        "A", // Too short
        "João  ", // Single name with trailing spaces
      ];

      invalidNames.forEach(name => {
        const invalidData = {
          username: "testuser",
          password: "password123",
          email: "test@example.com",
          name,
        };

        expect(() => authSchemas.signUp.parse(invalidData)).toThrow(ZodError);
      });
    });

    it("should validate password complexity thoroughly", () => {
      const invalidPasswords = [
        "password", // No uppercase, no number, no special char
        "PASSWORD", // No lowercase, no number, no special char
        "Password", // No number, no special char
        "Password123", // No special char
        "password123!", // No uppercase
        "PASSWORD123!", // No lowercase
        "Passwor!", // No number
        "Pass1!", // Too short
      ];

      invalidPasswords.forEach(newPassword => {
        const invalidData = {
          username: "testuser",
          confirmationCode: "123456",
          newPassword,
        };

        expect(() =>
          authSchemas.confirmForgotPassword.parse(invalidData),
        ).toThrow(ZodError);
      });
    });

    it("should handle null and undefined values", () => {
      expect(() => authSchemas.signIn.parse(null)).toThrow(ZodError);
      expect(() => authSchemas.signIn.parse(undefined)).toThrow(ZodError);
      expect(() => authSchemas.signUp.parse({})).toThrow(ZodError);
    });
  });
});
