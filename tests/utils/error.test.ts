import { describe, test, expect } from "@jest/globals";
import AppError from "../../src/utils/error";

describe("AppError", () => {
  test("should create an AppError with default status code", () => {
    const message = "Test error message";
    const error = new AppError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(400);
    expect(error.data).toBeUndefined();
  });

  test("should create an AppError with custom status code", () => {
    const message = "Custom error";
    const statusCode = 500;
    const error = new AppError(message, statusCode);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  test("should create an AppError with data", () => {
    const message = "Error with data";
    const statusCode = 422;
    const data = { field: "username", reason: "required" };
    const error = new AppError(message, statusCode, data);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.data).toEqual(data);
  });

  test("should be instance of Error", () => {
    const error = new AppError("Test");
    expect(error instanceof Error).toBe(true);
  });
});
