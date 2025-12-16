/**
 * Tests Unitarios para PositionService
 * Prueban la lógica de negocio de manera aislada usando mocks de Prisma
 * 
 * Nota: positionService usa una instancia global de PrismaClient.
 * Para tests más completos, usar tests de integración.
 */

// Mock Prisma Client ANTES de importar el servicio
const mockPrismaInstance = {
  position: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  application: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaInstance),
}));

// Ahora importar el servicio después del mock
import {
  getCandidatesByPositionService,
  getInterviewFlowByPositionService,
  getAllPositionsService,
} from '../../../src/application/services/positionService';
import {
  mockPositionsList,
  mockApplicationWithRelations,
  mockPositionWithInterviewFlow,
} from '../../fixtures/positionFixtures';

describe('PositionService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPositionsService', () => {
    it('should return all visible positions', async () => {
      (mockPrismaInstance.position.findMany as jest.Mock).mockResolvedValue(mockPositionsList);

      const result = await getAllPositionsService();

      expect(mockPrismaInstance.position.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
      });
      expect(result).toEqual(mockPositionsList);
    });

    it('should throw error when database query fails', async () => {
      (mockPrismaInstance.position.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getAllPositionsService()).rejects.toThrow('Error retrieving all positions');
    });

    it('should return empty array when no positions exist', async () => {
      (mockPrismaInstance.position.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllPositionsService();

      expect(result).toEqual([]);
    });
  });

  describe('getCandidatesByPositionService', () => {
    it('should return candidates for a position with calculated average scores', async () => {
      const applications = [mockApplicationWithRelations];
      (mockPrismaInstance.application.findMany as jest.Mock).mockResolvedValue(applications);

      const result = await getCandidatesByPositionService(1);

      expect(mockPrismaInstance.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('fullName');
      expect(result[0]).toHaveProperty('averageScore');
      expect(result[0].averageScore).toBe(85); // Score del mockInterview
    });

    it('should calculate average score as 0 when no interviews exist', async () => {
      const applicationWithoutInterviews = {
        ...mockApplicationWithRelations,
        interviews: [],
      };
      (mockPrismaInstance.application.findMany as jest.Mock).mockResolvedValue([applicationWithoutInterviews]);

      const result = await getCandidatesByPositionService(1);

      expect(result[0].averageScore).toBe(0);
    });

    it('should calculate average score correctly with multiple interviews', async () => {
      const applicationWithMultipleInterviews = {
        ...mockApplicationWithRelations,
        interviews: [
          { score: 80 },
          { score: 90 },
          { score: 85 },
        ],
      };
      (mockPrismaInstance.application.findMany as jest.Mock).mockResolvedValue([applicationWithMultipleInterviews]);

      const result = await getCandidatesByPositionService(1);

      expect(result[0].averageScore).toBe(85); // (80 + 90 + 85) / 3
    });

    it('should throw error when database query fails', async () => {
      (mockPrismaInstance.application.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getCandidatesByPositionService(1)).rejects.toThrow('Error retrieving candidates by position');
    });
  });

  describe('getInterviewFlowByPositionService', () => {
    it('should return interview flow for a position', async () => {
      (mockPrismaInstance.position.findUnique as jest.Mock).mockResolvedValue(mockPositionWithInterviewFlow);

      const result = await getInterviewFlowByPositionService(1);

      expect(mockPrismaInstance.position.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          interviewFlow: {
            include: {
              interviewSteps: true,
            },
          },
        },
      });
      expect(result).toHaveProperty('positionName');
      expect(result).toHaveProperty('interviewFlow');
      expect(result.interviewFlow).toHaveProperty('interviewSteps');
    });

    it('should throw error when position not found', async () => {
      (mockPrismaInstance.position.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getInterviewFlowByPositionService(999)).rejects.toThrow('Position not found');
    });

    it('should format interview steps correctly', async () => {
      (mockPrismaInstance.position.findUnique as jest.Mock).mockResolvedValue(mockPositionWithInterviewFlow);

      const result = await getInterviewFlowByPositionService(1);

      expect(result.interviewFlow.interviewSteps).toHaveLength(2);
      expect(result.interviewFlow.interviewSteps[0]).toHaveProperty('id');
      expect(result.interviewFlow.interviewSteps[0]).toHaveProperty('name');
      expect(result.interviewFlow.interviewSteps[0]).toHaveProperty('orderIndex');
    });
  });
});
