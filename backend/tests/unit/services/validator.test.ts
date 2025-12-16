/**
 * Tests Unitarios para Validator
 * Prueban las funciones de validación de datos
 */

import { validateCandidateData } from '../../../src/application/validator';
import {
  mockCandidateData,
  mockInvalidCandidateData,
  mockCandidateEducation,
  mockCandidateWorkExperience,
  mockCandidateCV,
} from '../../fixtures/candidateFixtures';

describe('Validator - Unit Tests', () => {
  describe('validateCandidateData', () => {
    it('should pass validation for valid candidate data', () => {
      expect(() => validateCandidateData(mockCandidateData)).not.toThrow();
    });

    it('should skip validation if id is provided (editing existing candidate)', () => {
      const dataWithId = { id: 1, ...mockCandidateData };
      expect(() => validateCandidateData(dataWithId)).not.toThrow();
    });

    it('should throw error for invalid first name (too short)', () => {
      const invalidData = { ...mockCandidateData, firstName: 'J' };
      expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
    });

    it('should throw error for invalid first name (invalid characters)', () => {
      const invalidData = { ...mockCandidateData, firstName: 'John123' };
      expect(() => validateCandidateData(invalidData)).toThrow('Invalid name');
    });

    it('should throw error for invalid email', () => {
      const invalidData = { ...mockCandidateData, email: 'invalid-email' };
      expect(() => validateCandidateData(invalidData)).toThrow('Invalid email');
    });

    it('should throw error for invalid phone', () => {
      const invalidData = { ...mockCandidateData, phone: '123' };
      expect(() => validateCandidateData(invalidData)).toThrow('Invalid phone');
    });

    it('should throw error for address too long', () => {
      const invalidData = {
        ...mockCandidateData,
        address: 'a'.repeat(101), // Más de 100 caracteres
      };
      expect(() => validateCandidateData(invalidData)).toThrow('Invalid address');
    });

    it('should validate education data correctly', () => {
      const dataWithEducation = {
        ...mockCandidateData,
        educations: [mockCandidateEducation],
      };
      expect(() => validateCandidateData(dataWithEducation)).not.toThrow();
    });

    it('should throw error for invalid education institution', () => {
      const invalidEducation = {
        ...mockCandidateEducation,
        institution: 'a'.repeat(101), // Más de 100 caracteres
      };
      const dataWithEducation = {
        ...mockCandidateData,
        educations: [invalidEducation],
      };
      expect(() => validateCandidateData(dataWithEducation)).toThrow('Invalid institution');
    });

    it('should throw error for invalid education date format', () => {
      const invalidEducation = {
        ...mockCandidateEducation,
        startDate: '01-09-2015', // Formato incorrecto
      };
      const dataWithEducation = {
        ...mockCandidateData,
        educations: [invalidEducation],
      };
      expect(() => validateCandidateData(dataWithEducation)).toThrow('Invalid date');
    });

    it('should validate work experience data correctly', () => {
      const dataWithExperience = {
        ...mockCandidateData,
        workExperiences: [mockCandidateWorkExperience],
      };
      expect(() => validateCandidateData(dataWithExperience)).not.toThrow();
    });

    it('should throw error for invalid work experience company', () => {
      const invalidExperience = {
        ...mockCandidateWorkExperience,
        company: 'a'.repeat(101), // Más de 100 caracteres
      };
      const dataWithExperience = {
        ...mockCandidateData,
        workExperiences: [invalidExperience],
      };
      expect(() => validateCandidateData(dataWithExperience)).toThrow('Invalid company');
    });

    it('should validate CV data correctly', () => {
      const dataWithCV = {
        ...mockCandidateData,
        cv: mockCandidateCV,
      };
      expect(() => validateCandidateData(dataWithCV)).not.toThrow();
    });

    it('should throw error for invalid CV data structure', () => {
      const invalidCV = {
        filePath: '/uploads/test.pdf',
        // Falta fileType
      };
      const dataWithCV = {
        ...mockCandidateData,
        cv: invalidCV,
      };
      expect(() => validateCandidateData(dataWithCV)).toThrow('Invalid CV data');
    });
  });
});

