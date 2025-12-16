/**
 * Fixtures para tests de Candidate
 * Datos de prueba reutilizables para tests
 */

export const mockCandidateData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
  address: '123 Main St',
};

export const mockCandidateWithId = {
  id: 1,
  ...mockCandidateData,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCandidateWithRelations = {
  ...mockCandidateWithId,
  educations: [],
  workExperiences: [],
  resumes: [],
  applications: [],
};

export const mockCandidateEducation = {
  institution: 'University of Test',
  title: 'Computer Science Degree',
  startDate: '2015-09-01',
  endDate: '2019-06-30',
};

export const mockCandidateWorkExperience = {
  company: 'Tech Company',
  position: 'Software Developer',
  description: 'Developed web applications',
  startDate: '2020-01-01',
  endDate: '2022-12-31',
};

export const mockCandidateCV = {
  filePath: '/uploads/test-cv.pdf',
  fileType: 'application/pdf',
};

export const mockInvalidCandidateData = {
  firstName: 'J', // Muy corto
  lastName: 'D',
  email: 'invalid-email',
  phone: '123', // Formato inválido
};

export const mockDuplicateEmailError = {
  code: 'P2002',
  meta: {
    target: ['email'],
  },
};

