import { NextFunction, Request, Response } from "express";
import { CognitoService } from "../services/cognito.service";
import { AuthSchemas } from "../schemas/auth.schema";
import { UseCaseFactory } from "../factory/auth.factory";

export default class AuthController {
  private service: CognitoService;
  private schemas: AuthSchemas;
  private useCaseFactory: UseCaseFactory;

  constructor() {
    this.service = new CognitoService();
    this.useCaseFactory = new UseCaseFactory();

    this.login = this.login.bind(this);
    this.signin = this.signin.bind(this);
    this.confirmSignUp = this.confirmSignUp.bind(this);
    this.resendConfirmationCode = this.resendConfirmationCode.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.confirmForgotPassword = this.confirmForgotPassword.bind(this);
    this.logout = this.logout.bind(this);

    // Instanciar os schemas
    this.schemas = new AuthSchemas();
  }
  async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username, password } = req.body;

      // Validação com schema
      const parsed = this.schemas.signIn.safeParse({ username, password });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const loginUseCase = this.useCaseFactory.createLoginUseCase();
      const result = await loginUseCase.execute({ username, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async signin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username, password, email, phoneNumber, name } = req.body;

      // Validação com schema
      const parsed = this.schemas.signUp.safeParse({
        username,
        password,
        email,
        phoneNumber,
        name,
      });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const signUpUseCase = this.useCaseFactory.createSignUpUseCase();
      const result = await signUpUseCase.execute({
        username,
        password,
        email,
        phoneNumber,
        name,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  async confirmSignUp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username, confirmationCode } = req.body;

      // Validação com schema
      const parsed = this.schemas.confirmSignUp.safeParse({
        username,
        confirmationCode,
      });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const confirmSignUpUseCase =
        this.useCaseFactory.createConfirmSignUpUseCase();
      const result = await confirmSignUpUseCase.execute({
        username,
        confirmationCode,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async resendConfirmationCode(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username } = req.body;

      // Validação com schema
      const parsed = this.schemas.resendConfirmationCode.safeParse({
        username,
      });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const resendConfirmationCodeUseCase =
        this.useCaseFactory.createResendConfirmationCodeUseCase();
      const result = await resendConfirmationCodeUseCase.execute({ username });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username } = req.body;

      // Validação com schema
      const parsed = this.schemas.forgotPassword.safeParse({ username });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const forgotPasswordUseCase =
        this.useCaseFactory.createForgotPasswordUseCase();
      const result = await forgotPasswordUseCase.execute({ username });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async confirmForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response<unknown, Record<string, unknown>> | undefined> {
    try {
      const { username, confirmationCode, newPassword } = req.body;

      // Validação com schema
      const parsed = this.schemas.confirmForgotPassword.safeParse({
        username,
        confirmationCode,
        newPassword,
      });
      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
      }

      const confirmForgotPasswordUseCase =
        this.useCaseFactory.createConfirmForgotPasswordUseCase();
      const result = await confirmForgotPasswordUseCase.execute({
        username,
        confirmationCode,
        newPassword,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implement logout logic
      res.status(200).json({ message: "User logged out successfully." });
    } catch (error) {
      next(error);
    }
  }
}
