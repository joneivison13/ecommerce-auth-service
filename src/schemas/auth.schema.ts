import { z, ZodSchema } from "zod";

const messages = {
  username: {
    min: "O nome de usuário deve ter pelo menos 3 caracteres",
    max: "O nome de usuário deve ter no máximo 30 caracteres",
  },
  password: {
    min: "A senha deve ter pelo menos 6 caracteres",
    max: "A senha deve ter no máximo 100 caracteres",
  },
  email: {
    invalid: "E-mail inválido",
  },
  phoneNumber: {
    invalid:
      "O telefone deve estar no formato internacional, ex: +5573999999999",
  },
  name: {
    min: "O nome deve ter pelo menos 2 caracteres",
    max: "O nome deve ter no máximo 50 caracteres",
    full: "O nome deve conter pelo menos nome e sobrenome",
  },
  confirmationCode: {
    length: "O código de confirmação deve ter 6 caracteres",
  },
  newPassword: {
    min: "A nova senha deve ter pelo menos 8 caracteres",
    max: "A nova senha deve ter no máximo 100 caracteres",
    pattern:
      "A nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
  },
};

export class AuthSchemas {
  public signIn: ZodSchema;
  public signUp: ZodSchema;
  public confirmSignUp: ZodSchema;
  public resendConfirmationCode: ZodSchema;
  public forgotPassword: ZodSchema;
  public confirmForgotPassword: ZodSchema;

  constructor() {
    this.signIn = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
      password: z
        .string()
        .min(6, { message: messages.password.min })
        .max(100, { message: messages.password.max }),
    });

    this.signUp = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
      password: z
        .string()
        .min(6, { message: messages.password.min })
        .max(100, { message: messages.password.max }),
      email: z.string().email({ message: messages.email.invalid }),
      phoneNumber: z
        .string()
        .regex(/^\+\d{10,15}$/, { message: messages.phoneNumber.invalid })
        .optional(),
      name: z
        .string()
        .min(2, { message: messages.name.min })
        .max(50, { message: messages.name.max })
        .refine(val => val.trim().split(/\s+/).length > 1, {
          message: messages.name.full,
        }),
    });

    this.confirmSignUp = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
      confirmationCode: z
        .string()
        .min(6, { message: messages.confirmationCode.length })
        .max(6, { message: messages.confirmationCode.length }),
    });

    this.resendConfirmationCode = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
    });

    this.forgotPassword = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
    });

    this.confirmForgotPassword = z.object({
      username: z
        .string()
        .min(3, { message: messages.username.min })
        .max(30, { message: messages.username.max }),
      confirmationCode: z
        .string()
        .min(6, { message: messages.confirmationCode.length })
        .max(6, { message: messages.confirmationCode.length }),
      newPassword: z
        .string()
        .min(8, { message: messages.newPassword.min })
        .max(100, { message: messages.newPassword.max })
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          { message: messages.newPassword.pattern },
        ),
    });
  }
}

// Tipos baseados nas instâncias dos esquemas
export type SignInSchemaType = z.infer<AuthSchemas["signIn"]>;
export type SignUpSchemaType = z.infer<AuthSchemas["signUp"]>;
export type ConfirmSignUpSchemaType = z.infer<AuthSchemas["confirmSignUp"]>;
export type ResendConfirmationCodeSchemaType = z.infer<
  AuthSchemas["resendConfirmationCode"]
>;
export type ForgotPasswordSchemaType = z.infer<AuthSchemas["forgotPassword"]>;
export type ConfirmForgotPasswordSchemaType = z.infer<
  AuthSchemas["confirmForgotPassword"]
>;
