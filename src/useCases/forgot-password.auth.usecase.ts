import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { CognitoService } from "../services/cognito.service";
import logger from "../utils/logger";

export class ForgotPasswordUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    const response = await this.cognitoService.forgotPassword(request);

    logger.info("Password reset initiated for user:", request.username);

    return {
      success: true,
      message:
        "Password reset code sent successfully. Please check your email or phone.",
      deliveryMethod: response.CodeDeliveryDetails?.DeliveryMedium || "EMAIL",
    };
  }
}
