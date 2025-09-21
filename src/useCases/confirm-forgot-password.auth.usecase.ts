import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { CognitoService } from "../services/cognito.service";
import logger from "../utils/logger";

export class ConfirmForgotPasswordUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    request: ConfirmForgotPasswordRequest,
  ): Promise<ConfirmForgotPasswordResponse> {
    await this.cognitoService.confirmForgotPassword(request);

    logger.info("Password reset confirmed for user:", request.username);

    return {
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    };
  }
}
