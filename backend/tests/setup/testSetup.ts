/**
 * Configuración global para tests
 * Se ejecuta antes de cada test suite
 */

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Silenciar console.error durante los tests (el código real los usa pero no queremos verlos en los tests)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Limpiar mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
});

// Configuraciones adicionales si son necesarias
afterEach(() => {
  jest.restoreAllMocks();
});

