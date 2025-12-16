# Meta Prompt: Pipeline CI/CD Completo con Tests Profesionales

Este meta prompt te permite crear un pipeline CI/CD completo con GitHub Actions y una estructura de tests profesional en una sola iteración.

---

## 🎯 Objetivo

Crear un pipeline CI/CD completo que:
1. Ejecute tests del backend automáticamente
2. Genere el build del backend
3. Despliegue el backend en EC2
4. Incluya una estructura de tests profesional (unitarios e integración) siguiendo mejores prácticas

---

## 📋 Contexto del Proyecto

**Tecnología del Backend:**
- Node.js con TypeScript
- Express.js
- Prisma ORM
- Jest para testing
- Estructura: `src/` con subdirectorios `application/services/`, `presentation/controllers/`, `domain/models/`

**Estructura Actual:**
```
backend/
├── src/
│   ├── application/
│   │   ├── services/
│   │   └── validator.ts
│   ├── presentation/
│   │   └── controllers/
│   └── domain/
│       └── models/
├── tests/  (estructura a crear)
├── package.json
├── jest.config.js
└── tsconfig.json
```

---

## 🚀 Meta Prompt Completo

```
Necesito crear un pipeline CI/CD completo con GitHub Actions y una estructura de tests profesional para mi proyecto backend.

CONTEXTO DEL PROYECTO:
- Backend en TypeScript con Express, ubicado en backend/
- Usa Prisma ORM
- Tiene servicios en src/application/services/
- Tiene controladores en src/presentation/controllers/
- Actualmente hay algunos tests mezclados con el código fuente

REQUISITOS DEL PIPELINE CI/CD:

1. WORKFLOW PARA PULL REQUESTS (ci.yml):
   - Trigger: pull_request (opened, synchronize) a main/master
   - Job 1: Tests del Backend
     - Instalar Node.js 18
     - Instalar dependencias (npm install)
     - Ejecutar todos los tests (npm test)
   - Job 2: Build del Backend (depende de test-backend)
     - Instalar Node.js 18
     - Instalar dependencias
     - Compilar TypeScript (npm run build)
     - Verificar que el directorio dist/ fue generado

2. WORKFLOW PARA DEPLOYMENT (pipeline.yml):
   - Trigger: pull_request (opened, synchronize) con PR abierto
   - Job 1: Tests del Backend (mismo que ci.yml)
   - Job 2: Build del Backend (mismo que ci.yml)
     - Además: Crear artefacto comprimido (tar.gz) con dist/, package.json, package-lock.json, prisma/
   - Job 3: Despliegue en EC2 (depende de build-backend)
     - Configurar SSH usando secret EC2_SSH_KEY
     - Conectar a EC2 usando secrets EC2_HOST, EC2_USER, EC2_DEPLOY_PATH
     - Copiar archivos al servidor
     - Descomprimir
     - Instalar dependencias de producción (npm install --production)
     - Generar Prisma client (npx prisma generate)
     - Reiniciar aplicación con PM2 (o iniciar si no existe)

SECRETS NECESARIOS EN GITHUB:
- EC2_SSH_KEY: Contenido completo del archivo .pem
- EC2_HOST: IP pública o DNS de la instancia EC2
- EC2_USER: Usuario (ec2-user para Amazon Linux, ubuntu para Ubuntu)
- EC2_DEPLOY_PATH: Ruta de despliegue (ej: /home/ec2-user/app)

ESTRUCTURA DE TESTS PROFESIONAL:

Crear la siguiente estructura en backend/tests/:

backend/tests/
├── unit/                    # Tests unitarios
│   ├── services/           # Tests de servicios
│   └── controllers/        # Tests de controladores
├── integration/            # Tests de integración
│   └── api/               # Tests de endpoints completos
├── fixtures/              # Datos de prueba reutilizables
│   ├── candidateFixtures.ts
│   └── positionFixtures.ts
├── factories/             # Factories para crear objetos de prueba
│   └── prismaMockFactory.ts
├── helpers/               # Utilidades para tests
│   └── testHelpers.ts
├── setup/                 # Configuración global
│   └── testSetup.ts
└── README.md              # Documentación de la estructura

REQUISITOS DE TESTS:

1. MIGRAR TESTS EXISTENTES:
   - Mover tests de src/application/services/*.test.ts a tests/unit/services/
   - Mover tests de src/presentation/controllers/*.test.ts a tests/unit/controllers/
   - Refactorizar para usar fixtures y helpers

2. CREAR FIXTURES:
   - candidateFixtures.ts: mockCandidateData, mockCandidateWithId, mockDuplicateEmailError, etc.
   - positionFixtures.ts: mockPosition, mockPositionsList, mockApplicationWithRelations, etc.

3. CREAR HELPERS:
   - testHelpers.ts: createMockRequest(), createMockResponse(), clearAllMocks()

4. CREAR FACTORIES:
   - prismaMockFactory.ts: createPrismaMock() para mockear Prisma Client

5. CREAR TESTS NUEVOS:
   - Tests unitarios para validator.ts
   - Tests unitarios para fileUploadService.ts (básicos, multer es complejo)
   - Tests de integración para endpoints API

6. CONFIGURACIÓN:
   - Actualizar jest.config.js para reconocer la nueva estructura
   - Actualizar tsconfig.json para incluir tests/
   - Configurar setupFilesAfterEnv apuntando a tests/setup/testSetup.ts
   - Agregar scripts a package.json:
     * test:unit - Solo tests unitarios
     * test:integration - Solo tests de integración
     * test:watch - Modo watch
     * test:coverage - Con cobertura

7. LIMPIAR:
   - Eliminar tests antiguos de src/ después de migrarlos
   - Asegurar que no queden archivos .test.ts en src/

MEJORES PRÁCTICAS A SEGUIR:
- Separar tests unitarios de integración
- Usar fixtures para datos de prueba reutilizables
- Usar helpers para evitar duplicación
- Tests unitarios deben usar mocks apropiados
- Tests de integración prueban flujos completos
- Documentar la estructura en tests/README.md
- Todos los tests deben pasar antes de completar

VERIFICACIÓN FINAL:
- Todos los tests deben ejecutarse con "npm test" y pasar
- El build debe generar dist/ correctamente
- No debe haber archivos .test.ts en src/
- La estructura debe seguir las mejores prácticas mencionadas
- Configuración de Jest y TypeScript debe funcionar correctamente

Por favor, implementa todo esto siguiendo las mejores prácticas de testing y CI/CD.
```

---

## 📝 Cómo Usar Este Meta Prompt

1. **Copia el meta prompt completo** (desde "Necesito crear..." hasta el final)

2. **Pégalo en tu conversación con el asistente** (Claude, ChatGPT, etc.)

3. **El asistente debería:**
   - Crear la estructura completa de tests
   - Crear los workflows de GitHub Actions
   - Migrar y refactorizar tests existentes
   - Crear fixtures, helpers y factories
   - Configurar Jest y TypeScript correctamente
   - Eliminar tests antiguos del código fuente
   - Verificar que todo funciona

4. **Verifica que:**
   - Todos los tests pasen: `cd backend && npm test`
   - El build funcione: `cd backend && npm run build`
   - No haya tests en `src/`
   - La estructura esté completa

---

## 🎓 Qué Logra Este Meta Prompt

### 1. Pipeline CI/CD Completo
- ✅ Workflow para Pull Requests (tests + build)
- ✅ Workflow para Deployment (tests + build + deploy a EC2)
- ✅ Configuración correcta de triggers
- ✅ Manejo de artefactos
- ✅ Despliegue seguro con SSH

### 2. Estructura de Tests Profesional
- ✅ Separación unitarios/integración
- ✅ Fixtures para datos reutilizables
- ✅ Helpers para utilidades comunes
- ✅ Factories para mocks complejos
- ✅ Setup global configurado

### 3. Configuración Correcta
- ✅ Jest configurado para la nueva estructura
- ✅ TypeScript incluye tests/
- ✅ Scripts NPM para diferentes tipos de tests
- ✅ Documentación incluida

### 4. Mejores Prácticas
- ✅ Tests organizados por tipo
- ✅ Código de prueba reutilizable
- ✅ Tests independientes y aislados
- ✅ Cobertura adecuada

---

## 🔍 Personalización

Puedes ajustar el meta prompt según tus necesidades:

- **Cambiar versión de Node.js**: Reemplaza '18' por tu versión
- **Agregar más tipos de tests**: Agrega ejemplos en la sección de requisitos
- **Cambiar estructura de directorios**: Ajusta las rutas según tu proyecto
- **Agregar más servicios**: Menciona servicios específicos que necesitan tests

---

## ✅ Checklist de Verificación

Después de usar el meta prompt, verifica:

- [ ] Workflows creados en `.github/workflows/`
- [ ] Estructura `tests/` completa
- [ ] Todos los tests pasan (`npm test`)
- [ ] Build funciona (`npm run build`)
- [ ] No hay tests en `src/`
- [ ] `jest.config.js` actualizado
- [ ] `tsconfig.json` incluye tests/
- [ ] Scripts NPM agregados
- [ ] Documentación en `tests/README.md`
- [ ] Secrets configurados en GitHub (para deployment)

---

## 📚 Documentación Relacionada

- `docs/GITHUB_ACTIONS_SETUP.md` - Guía completa de configuración
- `docs/PROBAR_LOCALMENTE.md` - Cómo probar sin hacer push
- `tests/README.md` - Documentación de la estructura de tests
- `docs/pipeline-prompts.md` - Prompts específicos usados para cada sección

---

## 💡 Notas Importantes

1. **Una sola iteración**: Este meta prompt está diseñado para lograr todo en una conversación, pero si el proyecto es muy grande, puede necesitar múltiples iteraciones.

2. **Verificación manual**: Siempre verifica que todo funciona después de usar el prompt.

3. **Personalización**: Ajusta según las necesidades específicas de tu proyecto.

4. **Tests reales vs mocks**: Los tests de integración actuales usan mocks. Para tests reales de integración, necesitarías una base de datos de prueba.

---

## 🚀 Resultado Esperado

Después de usar este meta prompt, deberías tener:

- **Pipeline CI/CD** funcionando en GitHub Actions
- **63+ tests** organizados profesionalmente
- **Estructura escalable** para agregar más tests fácilmente
- **Documentación completa** para entender y mantener el proyecto
- **Configuración lista** para desarrollo y producción

