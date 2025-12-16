/**
 * Tests de Integración para Candidates API
 * Prueban los endpoints completos usando mocks de base de datos
 * Nota: Estos tests usan mocks pero están estructurados como tests de integración
 * Para tests reales de integración, se necesitaría una base de datos de prueba
 */

import { Request, Response } from 'express';
import {
  addCandidateController,
  getCandidateById,
  updateCandidateStageController,
} from '../../../src/presentation/controllers/candidateController';
import { addCandidate, findCandidateById, updateCandidateStage } from '../../../src/application/services/candidateService';
import { createMockRequest, createMockResponse } from '../../helpers/testHelpers';
import {
  mockCandidateData,
  mockCandidateWithId,
} from '../../fixtures/candidateFixtures';

// Mock de servicios
jest.mock('../../../src/application/services/candidateService');

describe('Candidates API - Integration Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('POST /candidates', () => {
    it('should create a candidate successfully through full stack', async () => {
      // Arrange
      mockReq.body = mockCandidateData;
      (addCandidate as jest.Mock).mockResolvedValue(mockCandidateWithId);

      // Act
      await addCandidateController(mockReq as Request, mockRes as Response);

      // Assert
      expect(addCandidate).toHaveBeenCalledWith(mockCandidateData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: mockCandidateWithId,
      });
    });

    it('should return 400 when validation fails', async () => {
      mockReq.body = { email: 'invalid-email' };
      (addCandidate as jest.Mock).mockRejectedValue(new Error('Invalid email'));

      await addCandidateController(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Invalid email',
      });
    });
  });

  describe('GET /candidates/:id', () => {
    it('should retrieve a candidate by ID successfully', async () => {
      mockReq.params = { id: '1' };
      (findCandidateById as jest.Mock).mockResolvedValue(mockCandidateWithId);

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(findCandidateById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockCandidateWithId);
    });

    it('should return 404 when candidate does not exist', async () => {
      mockReq.params = { id: '999' };
      (findCandidateById as jest.Mock).mockResolvedValue(null);

      await getCandidateById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Candidate not found' });
    });
  });

  describe('PUT /candidates/:id/stage', () => {
    it('should update candidate stage successfully', async () => {
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
  });
});

