/**
 * Tests Unitarios para CandidateService
 * Prueban la lógica de negocio de manera aislada
 */

import { addCandidate, findCandidateById, updateCandidateStage } from '../../../src/application/services/candidateService';
import { Candidate } from '../../../src/domain/models/Candidate';
import { Application } from '../../../src/domain/models/Application';
import { validateCandidateData } from '../../../src/application/validator';
import {
  mockCandidateData,
  mockCandidateWithId,
  mockDuplicateEmailError,
} from '../../fixtures/candidateFixtures';
import { clearAllMocks } from '../../helpers/testHelpers';

jest.mock('../../../src/domain/models/Candidate');
jest.mock('../../../src/domain/models/Application');
jest.mock('../../../src/application/validator');

describe('CandidateService - Unit Tests', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('addCandidate', () => {
    it('should successfully add a candidate', async () => {
      const mockSavedCandidate = { id: 1, ...mockCandidateData };
      const mockCandidateInstance = {
        save: jest.fn().mockResolvedValue(mockSavedCandidate),
        educations: [],
        workExperiences: [],
        resumes: [],
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => {});
      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(() => mockCandidateInstance as any);

      const result = await addCandidate(mockCandidateData);

      expect(validateCandidateData).toHaveBeenCalledWith(mockCandidateData);
      expect(Candidate).toHaveBeenCalledWith(mockCandidateData);
      expect(mockCandidateInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedCandidate);
    });

    it('should throw error if validation fails', async () => {
      (validateCandidateData as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid email');
      });

      await expect(addCandidate(mockCandidateData)).rejects.toThrow('Invalid email');
      expect(Candidate).not.toHaveBeenCalled();
    });

    it('should handle duplicate email error', async () => {
      const mockCandidateInstance = {
        save: jest.fn().mockRejectedValue(mockDuplicateEmailError),
        educations: [],
        workExperiences: [],
        resumes: [],
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => {});
      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(() => mockCandidateInstance as any);

      await expect(addCandidate(mockCandidateData)).rejects.toThrow('The email already exists in the database');
    });

    it('should handle general database errors', async () => {
      const mockCandidateInstance = {
        save: jest.fn().mockRejectedValue(new Error('Database connection error')),
        educations: [],
        workExperiences: [],
        resumes: [],
      };

      (validateCandidateData as jest.Mock).mockImplementation(() => {});
      (Candidate as jest.MockedClass<typeof Candidate>).mockImplementation(() => mockCandidateInstance as any);

      await expect(addCandidate(mockCandidateData)).rejects.toThrow('Database connection error');
    });
  });

  describe('findCandidateById', () => {
    it('should return a candidate when found', async () => {
      const mockCandidate = new Candidate(mockCandidateWithId);
      (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);

      const result = await findCandidateById(1);

      expect(Candidate.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCandidate);
    });

    it('should return null when candidate not found', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(null);

      const result = await findCandidateById(999);

      expect(Candidate.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      (Candidate.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(findCandidateById(1)).rejects.toThrow('Error al recuperar el candidato');
    });
  });

  describe('updateCandidateStage', () => {
    it('should update the candidate stage and return the updated application', async () => {
      const mockApplicationData = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        currentInterviewStep: 1,
        applicationDate: new Date(),
        notes: null,
      };
      const mockApplication = new Application(mockApplicationData);
      mockApplication.save = jest.fn().mockResolvedValue({
        ...mockApplicationData,
        currentInterviewStep: 2,
      });

      (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplication);

      const result = await updateCandidateStage(1, 1, 2);

      expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(1, 1);
      expect(mockApplication.currentInterviewStep).toBe(2);
      expect(mockApplication.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        currentInterviewStep: 2,
      }));
    });

    it('should throw error if application not found', async () => {
      (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

      await expect(updateCandidateStage(1, 999, 2)).rejects.toThrow('Application not found');
    });

    it('should handle errors during update', async () => {
      const mockApplication = new Application({
        id: 1,
        positionId: 1,
        candidateId: 1,
        currentInterviewStep: 1,
        applicationDate: new Date(),
      });
      mockApplication.save = jest.fn().mockRejectedValue(new Error('Database error'));

      (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplication);

      await expect(updateCandidateStage(1, 1, 2)).rejects.toThrow();
    });
  });
});

