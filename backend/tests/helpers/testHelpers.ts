/**
 * Helpers para tests
 * Utilidades comunes para facilitar la escritura de tests
 */

import { Request, Response } from 'express';

/**
 * Crea un mock de Request de Express
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  } as Partial<Request>;
};

/**
 * Crea un mock de Response de Express
 */
export const createMockResponse = (): Partial<Response> => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Limpia todos los mocks de Jest
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

/**
 * Espera a que todas las promesas pendientes se resuelvan
 */
export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

