/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable sonarjs/no-duplicate-string */
import { AuthRepository } from "../../../../src/infra/database/repositories/auth.repository";
import { PrismaClient, AuthUser } from "@prisma/client";

// Mock do Prisma Client
const mockAuthUser = {
  create: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaClient = {
  authUser: mockAuthUser,
} as unknown as PrismaClient;

// Mock do PrismaClient constructor
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

// Helper para criar AuthUser completo
const createAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "123",
  cognitoSub: "cognito-sub-123",
  username: "testuser",
  email: "test@example.com",
  phoneNumber: null,
  name: "Test User",
  userConfirmed: false,
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
  ...overrides,
});

// Helper para criar dados de criação
const createUserData = (
  overrides: Partial<Omit<AuthUser, "id">> = {},
): Omit<AuthUser, "id"> => ({
  cognitoSub: "cognito-sub-123",
  username: "testuser",
  email: "test@example.com",
  phoneNumber: null,
  name: "Test User",
  userConfirmed: false,
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("AuthRepository", () => {
  let authRepository: AuthRepository;
  let prismaClientSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaClientSpy = jest.spyOn(require("@prisma/client"), "PrismaClient");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Constructor", () => {
    it("should create repository with provided PrismaClient instance", () => {
      const customPrisma = mockPrismaClient;
      authRepository = new AuthRepository(customPrisma);

      expect(authRepository["prisma"]).toBe(customPrisma);
      expect(prismaClientSpy).not.toHaveBeenCalled();
    });

    it("should create repository with new PrismaClient instance when none provided", () => {
      authRepository = new AuthRepository();

      expect(prismaClientSpy).toHaveBeenCalled();
      expect(authRepository["prisma"]).toBeDefined();
    });

    it("should handle undefined prisma parameter", () => {
      authRepository = new AuthRepository(undefined);

      expect(prismaClientSpy).toHaveBeenCalled();
      expect(authRepository["prisma"]).toBeDefined();
    });
  });

  describe("create", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should create a new auth user successfully", async () => {
      const userData = createUserData({
        username: "newuser",
        email: "new@example.com",
      });

      const expectedUser = createAuthUser({
        id: "1",
        username: "newuser",
        email: "new@example.com",
      });

      mockAuthUser.create.mockResolvedValue(expectedUser);

      const result = await authRepository.create(userData);

      expect(mockAuthUser.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(expectedUser);
    });

    it("should handle create errors", async () => {
      const userData = createUserData();
      const error = new Error("Database connection failed");
      mockAuthUser.create.mockRejectedValue(error);

      await expect(authRepository.create(userData)).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockAuthUser.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it("should create user with minimal required data", async () => {
      const userData = createUserData({
        username: "minimaluser",
        email: "minimal@example.com",
        name: "Minimal",
        userConfirmed: true,
      });

      const expectedUser = createAuthUser({
        id: "2",
        username: "minimaluser",
        email: "minimal@example.com",
        name: "Minimal",
        userConfirmed: true,
      });

      mockAuthUser.create.mockResolvedValue(expectedUser);

      const result = await authRepository.create(userData);

      expect(result).toEqual(expectedUser);
      expect(mockAuthUser.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should find user by id successfully", async () => {
      const userId = "123";
      const expectedUser = createAuthUser({
        id: userId,
        username: "founduser",
        userConfirmed: true,
      });

      mockAuthUser.findUnique.mockResolvedValue(expectedUser);

      const result = await authRepository.findById(userId);

      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it("should return null when user not found", async () => {
      const userId = "nonexistent";
      mockAuthUser.findUnique.mockResolvedValue(null);

      const result = await authRepository.findById(userId);

      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBeNull();
    });

    it("should handle findById errors", async () => {
      const userId = "123";
      const error = new Error("Database query failed");
      mockAuthUser.findUnique.mockRejectedValue(error);

      await expect(authRepository.findById(userId)).rejects.toThrow(
        "Database query failed",
      );
      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe("findByUsername", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should find user by username successfully", async () => {
      const username = "testuser";
      const expectedUser = createAuthUser({
        username: username,
        userConfirmed: false,
      });

      mockAuthUser.findUnique.mockResolvedValue(expectedUser);

      const result = await authRepository.findByUsername(username);

      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(expectedUser);
    });

    it("should return null when user not found by username", async () => {
      const username = "nonexistent";
      mockAuthUser.findUnique.mockResolvedValue(null);

      const result = await authRepository.findByUsername(username);

      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toBeNull();
    });

    it("should handle findByUsername errors", async () => {
      const username = "testuser";
      const error = new Error("Database connection timeout");
      mockAuthUser.findUnique.mockRejectedValue(error);

      await expect(authRepository.findByUsername(username)).rejects.toThrow(
        "Database connection timeout",
      );
      expect(mockAuthUser.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe("update", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should update user successfully", async () => {
      const userId = "123";
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const expectedUser = createAuthUser({
        id: userId,
        name: "Updated Name",
        email: "updated@example.com",
        userConfirmed: true,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.update(userId, updateData);

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(expectedUser);
    });

    it("should update user with single field", async () => {
      const userId = "456";
      const updateData = { userConfirmed: true };

      const expectedUser = createAuthUser({
        id: userId,
        username: "testuser2",
        email: "test2@example.com",
        name: "Test User 2",
        userConfirmed: true,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.update(userId, updateData);

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(expectedUser);
    });

    it("should handle update errors", async () => {
      const userId = "123";
      const updateData = { name: "Updated Name" };
      const error = new Error("Record not found");
      mockAuthUser.update.mockRejectedValue(error);

      await expect(authRepository.update(userId, updateData)).rejects.toThrow(
        "Record not found",
      );
      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it("should update with empty data object", async () => {
      const userId = "789";
      const updateData = {};

      const expectedUser = createAuthUser({
        id: userId,
        username: "testuser3",
        email: "test3@example.com",
        name: "Test User 3",
        userConfirmed: false,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.update(userId, updateData);

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe("delete", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should delete user successfully", async () => {
      const userId = "123";
      const deletedUser = createAuthUser({
        id: userId,
        userConfirmed: true,
      });

      mockAuthUser.delete.mockResolvedValue(deletedUser);

      const result = await authRepository.delete(userId);

      expect(mockAuthUser.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(deletedUser);
    });

    it("should handle delete errors", async () => {
      const userId = "nonexistent";
      const error = new Error("Record to delete does not exist");
      mockAuthUser.delete.mockRejectedValue(error);

      await expect(authRepository.delete(userId)).rejects.toThrow(
        "Record to delete does not exist",
      );
      expect(mockAuthUser.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should delete user and return correct user data", async () => {
      const userId = "456";
      const deletedUser = createAuthUser({
        id: userId,
        username: "deleteduser",
        email: "deleted@example.com",
        name: "Deleted User",
        userConfirmed: false,
      });

      mockAuthUser.delete.mockResolvedValue(deletedUser);

      const result = await authRepository.delete(userId);

      expect(result.id).toBe(userId);
      expect(result.username).toBe("deleteduser");
      expect(mockAuthUser.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateUserConfirmationStatus", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should update user confirmation status to true", async () => {
      const username = "testuser";
      const userConfirmed = true;

      const expectedUser = createAuthUser({
        username: username,
        userConfirmed: true,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.updateUserConfirmationStatus(
        username,
        userConfirmed,
      );

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { username },
        data: { userConfirmed },
      });
      expect(result).toEqual(expectedUser);
      expect(result.userConfirmed).toBe(true);
    });

    it("should update user confirmation status to false", async () => {
      const username = "testuser2";
      const userConfirmed = false;

      const expectedUser = createAuthUser({
        id: "456",
        username: username,
        email: "test2@example.com",
        name: "Test User 2",
        userConfirmed: false,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.updateUserConfirmationStatus(
        username,
        userConfirmed,
      );

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { username },
        data: { userConfirmed },
      });
      expect(result).toEqual(expectedUser);
      expect(result.userConfirmed).toBe(false);
    });

    it("should handle updateUserConfirmationStatus errors", async () => {
      const username = "nonexistent";
      const userConfirmed = true;
      const error = new Error("User not found");
      mockAuthUser.update.mockRejectedValue(error);

      await expect(
        authRepository.updateUserConfirmationStatus(username, userConfirmed),
      ).rejects.toThrow("User not found");

      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { username },
        data: { userConfirmed },
      });
    });

    it("should handle confirmation status update with special characters in username", async () => {
      const username = "test@user.com";
      const userConfirmed = true;

      const expectedUser = createAuthUser({
        id: "789",
        username: username,
        email: "test@user.com",
        name: "Test User Special",
        userConfirmed: true,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.updateUserConfirmationStatus(
        username,
        userConfirmed,
      );

      expect(result.username).toBe("test@user.com");
      expect(result.userConfirmed).toBe(true);
      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { username },
        data: { userConfirmed },
      });
    });
  });

  describe("Integration Tests", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should handle multiple operations on same repository instance", async () => {
      const userData = createUserData({
        username: "integrationuser",
        email: "integration@example.com",
        name: "Integration User",
        userConfirmed: false,
      });

      const createdUser = createAuthUser({
        id: "999",
        username: "integrationuser",
        email: "integration@example.com",
        name: "Integration User",
        userConfirmed: false,
      });

      const updatedUser = createAuthUser({
        ...createdUser,
        userConfirmed: true,
      });

      // Mock create
      mockAuthUser.create.mockResolvedValue(createdUser);
      // Mock findById
      mockAuthUser.findUnique.mockResolvedValue(createdUser);
      // Mock update
      mockAuthUser.update.mockResolvedValue(updatedUser);

      // Execute operations
      const created = await authRepository.create(userData);
      const found = await authRepository.findById(created.id);
      const updated = await authRepository.updateUserConfirmationStatus(
        created.username,
        true,
      );

      expect(created).toEqual(createdUser);
      expect(found).toEqual(createdUser);
      expect(updated.userConfirmed).toBe(true);
      expect(mockAuthUser.create).toHaveBeenCalledTimes(1);
      expect(mockAuthUser.findUnique).toHaveBeenCalledTimes(1);
      expect(mockAuthUser.update).toHaveBeenCalledTimes(1);
    });

    it("should maintain prisma client reference across operations", async () => {
      const prismaInstance = mockPrismaClient;
      const repo = new AuthRepository(prismaInstance);

      expect(repo["prisma"]).toBe(prismaInstance);

      // Execute multiple operations
      mockAuthUser.findUnique.mockResolvedValue(null);
      mockAuthUser.create.mockResolvedValue(
        createAuthUser({
          id: "1",
          username: "test",
          email: "test@test.com",
          name: "Test",
          userConfirmed: false,
        }),
      );

      await repo.findById("1");
      await repo.create(
        createUserData({
          username: "test",
          email: "test@test.com",
          name: "Test",
          userConfirmed: false,
        }),
      );

      // Verify same instance is used
      expect(repo["prisma"]).toBe(prismaInstance);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      authRepository = new AuthRepository(mockPrismaClient);
    });

    it("should handle null phoneNumber in create", async () => {
      const userData = createUserData({
        phoneNumber: null,
      });

      const expectedUser = createAuthUser({
        phoneNumber: null,
      });

      mockAuthUser.create.mockResolvedValue(expectedUser);

      const result = await authRepository.create(userData);

      expect(result.phoneNumber).toBeNull();
      expect(mockAuthUser.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it("should handle empty string name in update", async () => {
      const userId = "123";
      const updateData = { name: "" };

      const expectedUser = createAuthUser({
        id: userId,
        name: "",
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.update(userId, updateData);

      expect(result.name).toBe("");
      expect(mockAuthUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it("should handle boolean userConfirmed in update", async () => {
      const userId = "123";
      const updateData = { userConfirmed: false };

      const expectedUser = createAuthUser({
        id: userId,
        userConfirmed: false,
      });

      mockAuthUser.update.mockResolvedValue(expectedUser);

      const result = await authRepository.update(userId, updateData);

      expect(result.userConfirmed).toBe(false);
    });
  });
});
