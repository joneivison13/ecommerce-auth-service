import { CognitoIdentityServiceProvider } from "aws-sdk";
import * as crypto from "crypto";
import logger from "../utils/logger";
import { cognitoConfig } from "../config/cognito.config";
import AppError from "../utils/error";

// Importar as interfaces do arquivo de tipos
/// <reference path="../@types/auth.controller.d.ts" />

export class CognitoService {
  private UserPoolId = cognitoConfig.UserPoolId;
  private ClientId = cognitoConfig.ClientId;
  private ClientSecret = cognitoConfig.ClientSecret;
  private region = cognitoConfig.region;

  private cognitoClient = new CognitoIdentityServiceProvider({
    region: this.region,
  });

  /**
   * Gera o SECRET_HASH necessário para clientes Cognito configurados com Client Secret
   */
  private generateSecretHash(username: string): string {
    if (!this.ClientSecret) {
      throw new Error("CLIENT_SECRET is required but not configured");
    }

    const message = username + this.ClientId;
    return crypto
      .createHmac("sha256", this.ClientSecret)
      .update(message)
      .digest("base64");
  }

  public async signIn(
    request: SignInRequest,
  ): Promise<CognitoIdentityServiceProvider.InitiateAuthResponse> {
    const { username, password } = request;

    const params: CognitoIdentityServiceProvider.InitiateAuthRequest = {
      ClientId: this.ClientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.AuthParameters!.SECRET_HASH = this.generateSecretHash(username);
    }

    try {
      const result = await this.cognitoClient.initiateAuth(params).promise();

      if (result.AuthenticationResult) {
        return result;
      } else {
        // Handle challenges (MFA, NEW_PASSWORD_REQUIRED, etc.)
        if (result.ChallengeName === "NEW_PASSWORD_REQUIRED") {
          logger.info("New password required.");
          throw new AppError("New password required", 403);
        }
        throw new AppError(
          "Authentication failed: " + result.ChallengeName,
          401,
        );
      }
    } catch (error) {
      logger.error("Error signing in user:", error);
      throw error;
    }
  }

  public async signUpUser(
    request: SignUpRequest,
  ): Promise<CognitoIdentityServiceProvider.SignUpResponse> {
    const { username, password, email, phoneNumber, name } = request;

    // Atributos básicos obrigatórios
    const userAttributes = [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "name",
        Value: name,
      },
    ];

    // Adiciona telefone apenas se fornecido
    if (phoneNumber) {
      userAttributes.push({
        Name: "phone_number",
        Value: phoneNumber,
      });
    }

    const params: CognitoIdentityServiceProvider.SignUpRequest = {
      ClientId: this.ClientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes,
    };

    // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.SecretHash = this.generateSecretHash(username);
    }

    try {
      const result = await this.cognitoClient.signUp(params).promise();

      logger.info("User signed up:", result.UserSub);

      return result;
    } catch (error) {
      logger.error("Error signing up user:", error);
      throw error;
    }
  }

  public async confirmSignUp(request: ConfirmSignUpRequest): Promise<boolean> {
    const { username, confirmationCode } = request;

    const params: CognitoIdentityServiceProvider.ConfirmSignUpRequest = {
      ClientId: this.ClientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    };

    // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.SecretHash = this.generateSecretHash(username);
    }

    try {
      await this.cognitoClient.confirmSignUp(params).promise();

      logger.info("User confirmed successfully:", username);

      return true;
    } catch (error) {
      logger.error("Error confirming sign up:", error);
      throw error;
    }
  }

  public async resendConfirmationCode(
    request: ResendConfirmationCodeRequest,
  ): Promise<CognitoIdentityServiceProvider.ResendConfirmationCodeResponse> {
    const { username } = request;

    const params: CognitoIdentityServiceProvider.ResendConfirmationCodeRequest =
      {
        ClientId: this.ClientId,
        Username: username,
      }; // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.SecretHash = this.generateSecretHash(username);
    }

    try {
      const result = await this.cognitoClient
        .resendConfirmationCode(params)
        .promise();

      logger.info("Confirmation code resent to:", username);

      return result;
    } catch (error) {
      logger.error("Error resending confirmation code:", error);
      throw error;
    }
  }

  public async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<CognitoIdentityServiceProvider.ForgotPasswordResponse> {
    const { username } = request;

    const params: CognitoIdentityServiceProvider.ForgotPasswordRequest = {
      ClientId: this.ClientId,
      Username: username,
    };

    // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.SecretHash = this.generateSecretHash(username);
    }

    try {
      const result = await this.cognitoClient.forgotPassword(params).promise();

      logger.info("Password reset code sent to:", username);

      return result;
    } catch (error) {
      logger.error("Error initiating password reset:", error);
      throw error;
    }
  }

  public async confirmForgotPassword(
    request: ConfirmForgotPasswordRequest,
  ): Promise<boolean> {
    const { username, confirmationCode, newPassword } = request;

    const params: CognitoIdentityServiceProvider.ConfirmForgotPasswordRequest =
      {
        ClientId: this.ClientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      };

    // Adiciona SECRET_HASH se ClientSecret estiver configurado
    if (this.ClientSecret) {
      params.SecretHash = this.generateSecretHash(username);
    }

    try {
      await this.cognitoClient.confirmForgotPassword(params).promise();

      logger.info("Password reset completed for:", username);

      return true;
    } catch (error) {
      logger.error("Error confirming password reset:", error);
      throw error;
    }
  }
}
