/**
 * Tests Unitarios para CandidateController
 * Prueban los controladores de manera aislada usando mocks de servicios
 */

import { Request, Response } from 'express';
import {
  addCandidateController,
  getCandidateById,
  updateCandidateStageController,
} from '../../../src/presentation/controllers/candidateController';
import {
  addCandidate,
  findCandidateById,
  updateCandidateStage,
} from '../../../src/application/services/candidateService';
import { createMockRequest, createMockResponse } from '../../helpers/testHelpers';
import {
  mockCandidateData,
  mockCandidateWithId,
} from '../../fixtures/candidateFixtures';

jest.mock('../../../src/application/services/candidateService');

describe('CandidateController - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('addCandidateController', () => {
    it('should return 201 and created candidate', async () => {
      mockReq.body = mockCandidateData;
      (addCandidate as jest.Mock).mockResolvedValue(mockCandidateWithId);

      await addCandidateController(mockReq as Request, mockRes as Response);

      expect(addCandidate).toHaveBeenCalledWith(mockCandidateData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: mockCandidateWithId,
      });
    });

    it('should return 400 on validation error', async () => {
      mockReq.body = { email: 'invalid' };
      (addCandidate as jest.Mock).mockRejectedValue(new Error('Invalid email'));

      await addCandidateController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Invalid email',
      });
    });

    it('should return 400 on duplicate email error', async () => {
      mockReq.body = mockCandidateData;
      (addCandidate as jest.Mock).mockRejectedValue(new Error('The email already exists in the database'));

      await addCandidateController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate when found', async () => {
      mockReq.params = { id: '1' };
      (findCandidateById as jest.Mock).mockResolvedValue(mockCandidateWithId);

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(findCandidateById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockCandidateWithId);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 404 when candidate not found', async () => {
      mockReq.params = { id: '999' };
      (findCandidateById as jest.Mock).mockResolvedValue(null);

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Candidate not found' });
    });

    it('should return 400 for invalid ID format', async () => {
      mockReq.params = { id: 'invalid' };

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid ID format' });
      expect(findCandidateById).not.toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      mockReq.params = { id: '1' };
      (findCandidateById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('updateCandidateStageController', () => {
    it('should return 200 and updated candidate stage', async () => {
      const mockUpdatedApplication = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        currentInterviewStep: 2,
      };
      mockReq.params = { id: '1' };
      mockReq.body = { applicationId: 1, currentInterviewStep: 2 };
      (updateCandidateStage as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(updateCandidateStage).toHaveBeenCalledWith(1, 1, 2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate stage updated successfully',
        data: mockUpdatedApplication,
      });
    });

    it('should return 404 when application not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { applicationId: 999, currentInterviewStep: 2 };
      // El controlador verifica error.message === 'Error: Application not found'
      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Error: Application not found'));

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application not found',
        error: 'Error: Application not found',
      });
    });

    it('should return 400 for invalid applicationId format', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { applicationId: 'invalid', currentInterviewStep: 2 };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
      expect(updateCandidateStage).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid currentInterviewStep format', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { applicationId: 1, currentInterviewStep: 'invalid' };

      await updateCandidateStageController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid currentInterviewStep format' });
      expect(updateCandidateStage).not.toHaveBeenCalled();
    });
  });
});

