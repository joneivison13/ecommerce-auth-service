// Interfaces de entrada
interface SignInRequest {
  username: string;
  password: string;
}

interface SignUpRequest {
  username: string;
  password: string;
  email: string;
  phoneNumber?: string; // Opcional agora
  name: string;
}

interface ConfirmSignUpRequest {
  username: string;
  confirmationCode: string;
}

interface ResendConfirmationCodeRequest {
  username: string;
}

interface ForgotPasswordRequest {
  username: string;
}

interface ConfirmForgotPasswordRequest {
  username: string;
  confirmationCode: string;
  newPassword: string;
}

// Interfaces de saída
interface SignInResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

interface SignUpResponse {
  cognitoSub: string; // ID único do usuário no Cognito
  username: string; // Username usado
  userConfirmed: boolean; // Status de confirmação
  message: string; // Mensagem de sucesso
}

interface ConfirmSignUpResponse {
  success: boolean;
  message: string;
}

interface ResendConfirmationCodeResponse {
  success: boolean;
  message: string;
  deliveryMethod: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  deliveryMethod: string;
}

interface ConfirmForgotPasswordResponse {
  success: boolean;
  message: string;
}
