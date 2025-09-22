// Setup global para os testes
import { jest } from "@jest/globals";

// Configurações globais para todos os testes
beforeAll(() => {
  // Mock de variáveis de ambiente para testes
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // Cleanup após todos os testes
});

beforeEach(() => {
  // Setup antes de cada teste
});

afterEach(() => {
  // Cleanup após cada teste
  jest.clearAllMocks();
});
