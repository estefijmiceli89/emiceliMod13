/**
 * Factory para crear mocks de Prisma Client
 * Facilita el mockeo de Prisma en tests
 */

import { PrismaClient } from '@prisma/client';

export const createPrismaMock = () => {
  return {
    candidate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    position: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    interview: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    interviewStep: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    interviewFlow: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;
};

