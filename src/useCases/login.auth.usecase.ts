import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { QueueHelper } from "../infra/queue";
import { CognitoService } from "../services/cognito.service";
import logger from "../utils/logger";

export class LoginUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(request: SignInRequest): Promise<SignInResponse> {
    const response = await this.cognitoService.signIn(request);

    await QueueHelper.sendUserLoginMessage({
      username: request.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!response.AuthenticationResult) {
      throw new Error("AuthenticationResult is undefined.");
    }
    const accessToken = response.AuthenticationResult.AccessToken!;
    const idToken = response.AuthenticationResult.IdToken!;
    const refreshToken = response.AuthenticationResult.RefreshToken!;

    logger.info("User signed in successfully.");

    return {
      accessToken,
      idToken,
      refreshToken,
    };
  }
}
