/**
 * Tests Unitarios para PositionController
 * Prueban los controladores de manera aislada usando mocks de servicios
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
  mockApplicationWithRelations,
  mockPositionWithInterviewFlow,
} from '../../fixtures/positionFixtures';

jest.mock('../../../src/application/services/positionService');

describe('PositionController - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('getAllPositions', () => {
    it('should return 200 and all positions', async () => {
      (getAllPositionsService as jest.Mock).mockResolvedValue(mockPositionsList);

      await getAllPositions(mockReq as Request, mockRes as Response);

      expect(getAllPositionsService).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockPositionsList);
    });

    it('should return 500 on service error', async () => {
      (getAllPositionsService as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getAllPositions(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving positions',
        error: 'Database error',
      });
    });
  });

  describe('getCandidatesByPosition', () => {
    it('should return 200 and candidates for position', async () => {
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

    it('should return 500 on service error', async () => {
      mockReq.params = { id: '1' };
      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getCandidatesByPosition(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Database error',
      });
    });

    it('should handle non-numeric position ID', async () => {
      mockReq.params = { id: 'invalid' };
      (getCandidatesByPositionService as jest.Mock).mockResolvedValue([]);

      await getCandidatesByPosition(mockReq as Request, mockRes as Response);

      expect(getCandidatesByPositionService).toHaveBeenCalledWith(NaN);
    });
  });

  describe('getInterviewFlowByPosition', () => {
    it('should return 200 and interview flow for position', async () => {
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

    it('should return 404 when position not found', async () => {
      mockReq.params = { id: '999' };
      (getInterviewFlowByPositionService as jest.Mock).mockRejectedValue(new Error('Position not found'));

      await getInterviewFlowByPosition(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Position not found',
      });
    });

    it('should return 404 when error is Error instance with Position not found message', async () => {
      mockReq.params = { id: '1' };
      (getInterviewFlowByPositionService as jest.Mock).mockRejectedValue(new Error('Position not found'));

      await getInterviewFlowByPosition(mockReq as Request, mockRes as Response);

      // El controlador devuelve 404 cuando el error es una instancia de Error
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Position not found',
      });
    });

    it('should return 500 on non-Error server error', async () => {
      mockReq.params = { id: '1' };
      (getInterviewFlowByPositionService as jest.Mock).mockRejectedValue('String error');

      await getInterviewFlowByPosition(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'String error',
      });
    });
  });
});

