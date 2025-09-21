import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { CognitoService } from "../services/cognito.service";

export class ResendConfirmationCodeUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(
    request: ResendConfirmationCodeRequest,
  ): Promise<ResendConfirmationCodeResponse> {
    await this.cognitoService.resendConfirmationCode(request);

    return {
      success: true,
      message:
        "Confirmation code resent successfully. Please check your email.",
      deliveryMethod: "EMAIL", // Sempre email conforme solicitado
    };
  }
}
