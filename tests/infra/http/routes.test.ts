/* eslint-disable sonarjs/no-duplicate-string */
import request from "supertest";
import express from "express";

// Mock dos controllers com funções mock
const mockHelloWorldHandle = jest.fn();
const mockHealthHandle = jest.fn();
const mockAuthLogin = jest.fn();
const mockAuthSignin = jest.fn();
const mockAuthConfirmSignUp = jest.fn();
const mockAuthResendConfirmationCode = jest.fn();
const mockAuthForgotPassword = jest.fn();
const mockAuthConfirmForgotPassword = jest.fn();
const mockAuthLogout = jest.fn();

// Mock do HelloWorldController
jest.mock("../../../src/controllers/helloWorld", () => {
  return jest.fn().mockImplementation(() => ({
    handle: mockHelloWorldHandle,
  }));
});

// Mock do AuthController
jest.mock("../../../src/controllers/auth.controller", () => {
  return jest.fn().mockImplementation(() => ({
    login: mockAuthLogin,
    signin: mockAuthSignin,
    confirmSignUp: mockAuthConfirmSignUp,
    resendConfirmationCode: mockAuthResendConfirmationCode,
    forgotPassword: mockAuthForgotPassword,
    confirmForgotPassword: mockAuthConfirmForgotPassword,
    logout: mockAuthLogout,
  }));
});

// Mock do HealthController
jest.mock("../../../src/controllers/health.controller", () => {
  return jest.fn().mockImplementation(() => ({
    handle: mockHealthHandle,
  }));
});

// Import do router após os mocks
import { router } from "../../../src/infra/http/routes";

describe("Routes", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementations
    mockHelloWorldHandle.mockImplementation((req, res) => {
      res.status(200).json({ message: "Hello World" });
    });
    mockHealthHandle.mockImplementation((req, res) => {
      res.status(200).json({ status: "healthy" });
    });
    mockAuthLogin.mockImplementation((req, res) => {
      res.status(200).json({ message: "Login successful" });
    });
    mockAuthSignin.mockImplementation((req, res) => {
      res.status(201).json({ message: "Signup successful" });
    });
    mockAuthConfirmSignUp.mockImplementation((req, res) => {
      res.status(200).json({ message: "Confirmation successful" });
    });
    mockAuthResendConfirmationCode.mockImplementation((req, res) => {
      res.status(200).json({ message: "Code resent" });
    });
    mockAuthForgotPassword.mockImplementation((req, res) => {
      res.status(200).json({ message: "Password reset initiated" });
    });
    mockAuthConfirmForgotPassword.mockImplementation((req, res) => {
      res.status(200).json({ message: "Password reset confirmed" });
    });
    mockAuthLogout.mockImplementation((req, res) => {
      res.status(200).json({ message: "Logout successful" });
    });
  });

  describe("Router Export", () => {
    it("should export router correctly", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
    });

    it("should be an Express Router instance", () => {
      expect(router.constructor.name).toBe("Function");
      expect(router.toString()).toContain("router");
    });
  });

  describe("Controller Instantiation", () => {
    it("should instantiate controllers when router is imported", () => {
      // Controllers are instantiated when the router module is loaded
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
    });

    it("should have all required controller methods available", () => {
      // Verify that all mock functions are available
      expect(mockHelloWorldHandle).toBeDefined();
      expect(mockHealthHandle).toBeDefined();
      expect(mockAuthLogin).toBeDefined();
      expect(mockAuthSignin).toBeDefined();
      expect(mockAuthConfirmSignUp).toBeDefined();
      expect(mockAuthResendConfirmationCode).toBeDefined();
      expect(mockAuthForgotPassword).toBeDefined();
      expect(mockAuthConfirmForgotPassword).toBeDefined();
      expect(mockAuthLogout).toBeDefined();
    });
  });

  describe("GET Routes", () => {
    describe("GET /", () => {
      it("should call helloWorld.handle", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Hello World" });
        expect(mockHelloWorldHandle).toHaveBeenCalledTimes(1);
      });

      it("should pass request and response objects to helloWorld.handle", async () => {
        await request(app).get("/");

        expect(mockHelloWorldHandle).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "GET",
            path: "/",
          }),
          expect.objectContaining({
            status: expect.any(Function),
            json: expect.any(Function),
          }),
          expect.any(Function),
        );
      });
    });

    describe("GET /health", () => {
      it("should call healthController.handle", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "healthy" });
        expect(mockHealthHandle).toHaveBeenCalledTimes(1);
      });

      it("should pass request and response objects to healthController.handle", async () => {
        await request(app).get("/health");

        expect(mockHealthHandle).toHaveBeenCalledWith(
          expect.objectContaining({
            method: "GET",
            path: "/health",
          }),
          expect.objectContaining({
            status: expect.any(Function),
            json: expect.any(Function),
          }),
          expect.any(Function),
        );
      });
    });
  });

  describe("POST Routes - Authentication", () => {
    describe("POST /login", () => {
      it("should call authController.login", async () => {
        const loginData = { username: "testuser", password: "password123" };
        const response = await request(app).post("/login").send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Login successful" });
        expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.login", async () => {
        const loginData = { username: "testuser", password: "password123" };
        await request(app).post("/login").send(loginData);

        expect(mockAuthLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            body: loginData,
            method: "POST",
            path: "/login",
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });

      it("should handle empty body in login request", async () => {
        await request(app).post("/login").send({});

        expect(mockAuthLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            body: {},
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /signup", () => {
      it("should call authController.signin", async () => {
        const signupData = {
          username: "newuser",
          password: "password123",
          email: "test@example.com",
        };
        const response = await request(app).post("/signup").send(signupData);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: "Signup successful" });
        expect(mockAuthSignin).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.signin", async () => {
        const signupData = {
          username: "newuser",
          password: "password123",
          email: "test@example.com",
        };
        await request(app).post("/signup").send(signupData);

        expect(mockAuthSignin).toHaveBeenCalledWith(
          expect.objectContaining({
            body: signupData,
            method: "POST",
            path: "/signup",
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /confirm-signup", () => {
      it("should call authController.confirmSignUp", async () => {
        const confirmData = {
          username: "testuser",
          confirmationCode: "123456",
        };
        const response = await request(app)
          .post("/confirm-signup")
          .send(confirmData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Confirmation successful" });
        expect(mockAuthConfirmSignUp).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.confirmSignUp", async () => {
        const confirmData = {
          username: "testuser",
          confirmationCode: "123456",
        };
        await request(app).post("/confirm-signup").send(confirmData);

        expect(mockAuthConfirmSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            body: confirmData,
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /resend-confirmation-code", () => {
      it("should call authController.resendConfirmationCode", async () => {
        const resendData = { username: "testuser" };
        const response = await request(app)
          .post("/resend-confirmation-code")
          .send(resendData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Code resent" });
        expect(mockAuthResendConfirmationCode).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.resendConfirmationCode", async () => {
        const resendData = { username: "testuser" };
        await request(app).post("/resend-confirmation-code").send(resendData);

        expect(mockAuthResendConfirmationCode).toHaveBeenCalledWith(
          expect.objectContaining({
            body: resendData,
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /forgot-password", () => {
      it("should call authController.forgotPassword", async () => {
        const forgotData = { username: "testuser" };
        const response = await request(app)
          .post("/forgot-password")
          .send(forgotData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Password reset initiated" });
        expect(mockAuthForgotPassword).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.forgotPassword", async () => {
        const forgotData = { username: "testuser" };
        await request(app).post("/forgot-password").send(forgotData);

        expect(mockAuthForgotPassword).toHaveBeenCalledWith(
          expect.objectContaining({
            body: forgotData,
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /confirm-forgot-password", () => {
      it("should call authController.confirmForgotPassword", async () => {
        const confirmForgotData = {
          username: "testuser",
          confirmationCode: "123456",
          newPassword: "newpassword123",
        };
        const response = await request(app)
          .post("/confirm-forgot-password")
          .send(confirmForgotData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Password reset confirmed" });
        expect(mockAuthConfirmForgotPassword).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.confirmForgotPassword", async () => {
        const confirmForgotData = {
          username: "testuser",
          confirmationCode: "123456",
          newPassword: "newpassword123",
        };
        await request(app)
          .post("/confirm-forgot-password")
          .send(confirmForgotData);

        expect(mockAuthConfirmForgotPassword).toHaveBeenCalledWith(
          expect.objectContaining({
            body: confirmForgotData,
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });

    describe("POST /logout", () => {
      it("should call authController.logout", async () => {
        const logoutData = { accessToken: "token123" };
        const response = await request(app).post("/logout").send(logoutData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Logout successful" });
        expect(mockAuthLogout).toHaveBeenCalledTimes(1);
      });

      it("should pass request body to authController.logout", async () => {
        const logoutData = { accessToken: "token123" };
        await request(app).post("/logout").send(logoutData);

        expect(mockAuthLogout).toHaveBeenCalledWith(
          expect.objectContaining({
            body: logoutData,
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });

      it("should handle logout without token", async () => {
        await request(app).post("/logout").send({});

        expect(mockAuthLogout).toHaveBeenCalledWith(
          expect.objectContaining({
            body: {},
          }),
          expect.any(Object),
          expect.any(Function),
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle controller errors in GET routes", async () => {
      mockHelloWorldHandle.mockImplementation(() => {
        throw new Error("Controller error");
      });

      await request(app).get("/").expect(500);
      expect(mockHelloWorldHandle).toHaveBeenCalledTimes(1);
    });

    it("should handle controller errors in POST routes", async () => {
      mockAuthLogin.mockImplementation(() => {
        throw new Error("Auth error");
      });

      await request(app).post("/login").send({}).expect(500);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
    });

    it("should handle health controller errors", async () => {
      mockHealthHandle.mockImplementation((req, res) => {
        res.status(500).json({ error: "Health check failed" });
      });

      const response = await request(app).get("/health");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Health check failed" });
    });
  });

  describe("HTTP Methods", () => {
    it("should only accept GET for root path", async () => {
      await request(app).post("/").expect(404);
      await request(app).put("/").expect(404);
      await request(app).delete("/").expect(404);
      await request(app).patch("/").expect(404);
    });

    it("should only accept GET for health path", async () => {
      await request(app).post("/health").expect(404);
      await request(app).put("/health").expect(404);
      await request(app).delete("/health").expect(404);
      await request(app).patch("/health").expect(404);
    });

    it("should only accept POST for auth routes", async () => {
      const authRoutes = [
        "/login",
        "/signup",
        "/confirm-signup",
        "/resend-confirmation-code",
        "/forgot-password",
        "/confirm-forgot-password",
        "/logout",
      ];

      for (const route of authRoutes) {
        await request(app).get(route).expect(404);
        await request(app).put(route).expect(404);
        await request(app).delete(route).expect(404);
        await request(app).patch(route).expect(404);
      }
    });
  });

  describe("Content Type Handling", () => {
    it("should handle JSON content type", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send('{"username":"test","password":"123"}');

      expect(response.status).toBe(200);
      expect(mockAuthLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { username: "test", password: "123" },
        }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send('{"username":"test","password":}');

      expect(response.status).toBe(400);
    });
  });

  describe("Route Parameters and Query Strings", () => {
    it("should handle query parameters in GET routes", async () => {
      await request(app).get("/?test=value");

      expect(mockHelloWorldHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { test: "value" },
        }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("should handle multiple query parameters", async () => {
      await request(app).get("/health?status=check&timeout=5000");

      expect(mockHealthHandle).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { status: "check", timeout: "5000" },
        }),
        expect.any(Object),
        expect.any(Function),
      );
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete authentication flow", async () => {
      // Signup
      await request(app).post("/signup").send({
        username: "testuser",
        password: "pass123",
        email: "test@test.com",
      });

      // Confirm signup
      await request(app)
        .post("/confirm-signup")
        .send({ username: "testuser", confirmationCode: "123456" });

      // Login
      await request(app)
        .post("/login")
        .send({ username: "testuser", password: "pass123" });

      // Logout
      await request(app).post("/logout").send({ accessToken: "token123" });

      expect(mockAuthSignin).toHaveBeenCalledTimes(1);
      expect(mockAuthConfirmSignUp).toHaveBeenCalledTimes(1);
      expect(mockAuthLogin).toHaveBeenCalledTimes(1);
      expect(mockAuthLogout).toHaveBeenCalledTimes(1);
    });

    it("should handle password reset flow", async () => {
      // Forgot password
      await request(app)
        .post("/forgot-password")
        .send({ username: "testuser" });

      // Confirm forgot password
      await request(app).post("/confirm-forgot-password").send({
        username: "testuser",
        confirmationCode: "123456",
        newPassword: "newpass123",
      });

      expect(mockAuthForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockAuthConfirmForgotPassword).toHaveBeenCalledTimes(1);
    });
  });
});
