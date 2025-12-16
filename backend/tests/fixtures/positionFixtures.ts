/**
 * Fixtures para tests de Position
 * Datos de prueba reutilizables para tests
 */

export const mockPosition = {
  id: 1,
  title: 'Software Engineer',
  description: 'Full-stack developer position',
  companyId: 1,
  isVisible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPositionsList = [
  mockPosition,
  {
    id: 2,
    title: 'Product Manager',
    description: 'Product management position',
    companyId: 1,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockApplication = {
  id: 1,
  positionId: 1,
  candidateId: 1,
  currentInterviewStep: 1,
  applicationDate: new Date(),
  notes: null,
};

export const mockCandidate = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
};

export const mockInterviewStep = {
  id: 1,
  name: 'Initial Screening',
  orderIndex: 1,
  interviewFlowId: 1,
  interviewTypeId: 1,
};

export const mockInterview = {
  id: 1,
  applicationId: 1,
  interviewStepId: 1,
  score: 85,
  notes: 'Good candidate',
  interviewDate: new Date(),
};

export const mockApplicationWithRelations = {
  ...mockApplication,
  candidate: mockCandidate,
  interviews: [mockInterview],
  interviewStep: mockInterviewStep,
};

export const mockInterviewFlow = {
  id: 1,
  description: 'Standard interview process',
  interviewSteps: [
    {
      id: 1,
      name: 'Initial Screening',
      orderIndex: 1,
      interviewFlowId: 1,
      interviewTypeId: 1,
    },
    {
      id: 2,
      name: 'Technical Interview',
      orderIndex: 2,
      interviewFlowId: 1,
      interviewTypeId: 2,
    },
  ],
};

export const mockPositionWithInterviewFlow = {
  ...mockPosition,
  interviewFlow: mockInterviewFlow,
};

