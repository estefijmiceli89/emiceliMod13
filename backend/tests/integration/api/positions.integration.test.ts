/**
 * Tests de Integración para Positions API
 * Prueban los endpoints completos usando mocks de base de datos
 */

import { Request, Response } from 'express';
import {
  getAllPositions,
  getCandidatesByPosition,
  getInterviewFlowByPosition,
} from '../../../src/presentation/controllers/positionController';
import {
  getAllPositionsService,
  getCandidatesByPositionService,
  getInterviewFlowByPositionService,
} from '../../../src/application/services/positionService';
import { createMockRequest, createMockResponse } from '../../helpers/testHelpers';
import {
  mockPositionsList,
} from '../../fixtures/positionFixtures';

jest.mock('../../../src/application/services/positionService');

describe('Positions API - Integration Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('GET /positions', () => {
    it('should retrieve all positions successfully', async () => {
      (getAllPositionsService as jest.Mock).mockResolvedValue(mockPositionsList);

      await getAllPositions(mockReq as Request, mockRes as Response);

      expect(getAllPositionsService).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockPositionsList);
    });
  });

  describe('GET /positions/:id/candidates', () => {
    it('should retrieve candidates for a position successfully', async () => {
      const mockCandidates = [
        {
          fullName: 'John Doe',
          currentInterviewStep: 'Initial Screening',
          candidateId: 1,
          applicationId: 1,
          averageScore: 85,
        },
      ];
      mockReq.params = { id: '1' };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue(mockCandidates);

      await getCandidatesByPosition(mockReq as Request, mockRes as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCandidates);
    });
  });

  describe('GET /positions/:id/interview-flow', () => {
    it('should retrieve interview flow for a position successfully', async () => {
      const mockInterviewFlow = {
        positionName: 'Software Engineer',
        interviewFlow: {
          id: 1,
          description: 'Standard interview process',
          interviewSteps: [],
        },
      };
      mockReq.params = { id: '1' };
      (getInterviewFlowByPositionService as jest.Mock).mockResolvedValue(mockInterviewFlow);

      await getInterviewFlowByPosition(mockReq as Request, mockRes as Response);

      expect(getInterviewFlowByPositionService).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ interviewFlow: mockInterviewFlow });
    });
  });
});

