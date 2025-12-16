# Tests del Backend

Este directorio contiene todos los tests del backend organizados siguiendo mejores prácticas de testing.

## Estructura de Directorios

```
tests/
├── unit/                  # Tests unitarios
│   ├── services/          # Tests de servicios (lógica de negocio)
│   └── controllers/       # Tests de controladores (endpoints)
├── integration/           # Tests de integración
│   └── api/              # Tests de endpoints completos
├── fixtures/             # Datos de prueba reutilizables
│   ├── candidateFixtures.ts
│   └── positionFixtures.ts
├── factories/            # Factories para crear objetos de prueba
│   └── prismaMockFactory.ts
├── helpers/              # Utilidades y helpers para tests
│   └── testHelpers.ts
└── setup/                # Configuración global de tests
    └── testSetup.ts
```

## Tipos de Tests

### Tests Unitarios (`tests/unit/`)

Los tests unitarios prueban componentes individuales de manera aislada usando mocks:
- **Services**: Prueban la lógica de negocio sin dependencias externas
- **Controllers**: Prueban los controladores usando mocks de servicios

### Tests de Integración (`tests/integration/`)

Los tests de integración prueban flujos completos:
- **API**: Prueban endpoints completos (controller + service)

Nota: Actualmente los tests de integración usan mocks. Para tests reales de integración, se necesitaría configurar una base de datos de prueba.

## Fixtures

Los fixtures son datos de prueba reutilizables que se encuentran en `tests/fixtures/`:
- `candidateFixtures.ts`: Datos relacionados con candidatos
- `positionFixtures.ts`: Datos relacionados con posiciones

Ejemplo de uso:
```typescript
import { mockCandidateData, mockCandidateWithId } from '../../fixtures/candidateFixtures';
```

## Helpers

Los helpers proporcionan utilidades comunes para facilitar la escritura de tests:
- `createMockRequest()`: Crea un mock de Request de Express
- `createMockResponse()`: Crea un mock de Response de Express
- `clearAllMocks()`: Limpia todos los mocks

Ejemplo de uso:
```typescript
import { createMockRequest, createMockResponse } from '../../helpers/testHelpers';

const mockReq = createMockRequest({ body: { email: 'test@example.com' } });
const mockRes = createMockResponse();
```

## Factories

Las factories ayudan a crear objetos complejos para tests:
- `createPrismaMock()`: Crea un mock completo de Prisma Client

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Solo tests unitarios
```bash
npm test -- tests/unit
```

### Solo tests de integración
```bash
npm test -- tests/integration
```

### Tests con cobertura
```bash
npm test -- --coverage
```

### Tests en modo watch
```bash
npm test -- --watch
```

## Convenciones de Nomenclatura

- Archivos de test: `*.test.ts` (ej: `candidateService.test.ts`)
- Describir suites de tests: `describe('ComponentName - Unit Tests', () => {})`
- Describir casos de prueba: `it('should do something when condition', () => {})`
- Usar `beforeEach` para configurar el estado antes de cada test
- Usar fixtures y helpers para evitar duplicación de código

## Mejores Prácticas

1. **Aislamiento**: Cada test debe ser independiente y no depender de otros tests
2. **Nombres descriptivos**: Los nombres de tests deben describir claramente qué prueban
3. **Arrange-Act-Assert**: Organizar tests en estas tres fases
4. **Mocks apropiados**: Usar mocks para dependencias externas, no para el código bajo prueba
5. **Fixtures**: Reutilizar datos de prueba usando fixtures en lugar de duplicar código
6. **Cleanup**: Limpiar mocks y estado después de cada test

## Ejemplo de Test

```typescript
import { addCandidate } from '../../../../src/application/services/candidateService';
import { mockCandidateData, mockCandidateWithId } from '../../fixtures/candidateFixtures';
import { clearAllMocks } from '../../helpers/testHelpers';

describe('CandidateService - Unit Tests', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('addCandidate', () => {
    it('should successfully add a candidate', async () => {
      // Arrange
      const mockSave = jest.fn().mockResolvedValue(mockCandidateWithId);
      
      // Act
      const result = await addCandidate(mockCandidateData);
      
      // Assert
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockCandidateWithId);
    });
  });
});
```

