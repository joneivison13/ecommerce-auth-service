import { AuthRepository } from "../infra/database/repositories/auth.repository";
import { QueueHelper } from "../infra/queue";
import { CognitoService } from "../services/cognito.service";

export class SignUpUseCase {
  constructor(
    private cognitoService: CognitoService,
    private authRepository: AuthRepository,
  ) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    const response = await this.cognitoService.signUpUser(request);

    // Salvar usuário no banco de dados local
    await this.authRepository.create({
      username: request.username,
      email: request.email,
      phoneNumber: request.phoneNumber || null,
      name: request.name,
      cognitoSub: response.UserSub,
      userConfirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await QueueHelper.sendUserSignupMessage({
      username: request.username,
      email: request.email,
      phoneNumber: request.phoneNumber || null,
      name: request.name,
      cognitoSub: response.UserSub,
      userConfirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Retornar resposta
    return {
      cognitoSub: response.UserSub || "",
      username: request.username,
      userConfirmed: response.UserConfirmed || false,
      message:
        "User registered successfully. Please check your email for confirmation code.",
    };
  }
}
