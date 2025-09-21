import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { QueueHelper } from "../infra/queue";
import { CognitoService } from "../services/cognito.service";
import AppError from "../utils/error";

export class ConfirmSignUpUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(request: ConfirmSignUpRequest): Promise<ConfirmSignUpResponse> {
    const response = await this.cognitoService.confirmSignUp(request);

    if (response) {
      await QueueHelper.sendUserLoginMessage({
        username: request.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Atualizar status de confirmação do usuário no banco de dados local
      await this.authRepository.updateUserConfirmationStatus(
        request.username,
        true,
      );

      return {
        success: true,
        message: "User confirmed successfully",
      };
    } else {
      throw new AppError("Failed to confirm user.", 500);
    }
  }
}
