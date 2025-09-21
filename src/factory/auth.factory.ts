import { CognitoService } from "../services/cognito.service";
import { AuthSchemas } from "../schemas/auth.schema";
import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { LoginUseCase } from "../useCases/login.auth.usecase";
import { SignUpUseCase } from "../useCases/signup.auth.usecase";
import { ConfirmSignUpUseCase } from "../useCases/confirm-signup.auth.usecase";
import { ResendConfirmationCodeUseCase } from "../useCases/resend-confirmation-code.auth.usecase";
import { ForgotPasswordUseCase } from "../useCases/forgot-password.auth.usecase";
import { ConfirmForgotPasswordUseCase } from "../useCases/confirm-forgot-password.auth.usecase";

export class UseCaseFactory {
  private cognitoService: CognitoService;
  private authRepository: AuthRepository;
  private schemas: AuthSchemas;

  constructor() {
    this.cognitoService = new CognitoService();
    this.authRepository = new AuthRepository();
    this.schemas = new AuthSchemas();
  }

  createLoginUseCase(): LoginUseCase {
    return new LoginUseCase(this.cognitoService, this.authRepository);
  }

  createSignUpUseCase(): SignUpUseCase {
    return new SignUpUseCase(this.cognitoService, this.authRepository);
  }

  createConfirmSignUpUseCase(): ConfirmSignUpUseCase {
    return new ConfirmSignUpUseCase(this.cognitoService, this.authRepository);
  }

  createResendConfirmationCodeUseCase(): ResendConfirmationCodeUseCase {
    return new ResendConfirmationCodeUseCase(
      this.cognitoService,
      this.authRepository,
    );
  }

  createForgotPasswordUseCase(): ForgotPasswordUseCase {
    return new ForgotPasswordUseCase(this.cognitoService, this.authRepository);
  }

  createConfirmForgotPasswordUseCase(): ConfirmForgotPasswordUseCase {
    return new ConfirmForgotPasswordUseCase(
      this.cognitoService,
      this.authRepository,
    );
  }
}
