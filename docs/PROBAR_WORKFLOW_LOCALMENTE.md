# 🧪 Cómo Probar el Workflow de GitHub Actions Localmente

Esta guía te mostrará varias formas de probar el workflow `pipeline.yml` antes de hacer push a GitHub.

---

## 📋 Opciones Disponibles

1. **[Opción 1: Usar `act`](#opción-1-usar-act-recomendado)** - Ejecuta workflows de GitHub Actions localmente
2. **[Opción 2: Ejecutar comandos manualmente](#opción-2-ejecutar-comandos-manualmente)** - Simula cada paso del workflow
3. **[Opción 3: Script de prueba](#opción-3-script-de-prueba)** - Script automatizado que ejecuta todos los pasos

---

## 🚀 Opción 1: Usar `act` (Recomendado)

`act` es una herramienta que ejecuta GitHub Actions localmente usando Docker.

### Instalación

#### macOS
```bash
brew install act
```

#### Linux
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

#### Windows
```powershell
choco install act-cli
# o
scoop install act
```

### Configuración Inicial

1. **Verificar que Docker está corriendo:**
   ```bash
   docker ps
   ```
   Si Docker no está corriendo, inícialo primero.

2. **Verificar que act funciona:**
   ```bash
   act --version
   ```

### Probar el Workflow

#### Probar solo el job de tests:
```bash
cd /Users/estefaniamiceli/Desktop/emiceliMod13
act -j test-backend -W .github/workflows/pipeline.yml
```

#### Probar solo el job de build:
```bash
act -j build-backend -W .github/workflows/pipeline.yml
```

#### Probar todo el workflow (excepto deploy):
```bash
# Ejecuta todos los jobs excepto deploy (porque necesita secrets de EC2)
act push -W .github/workflows/pipeline.yml --skip-tags deploy-backend
```

#### Probar con lista de jobs:
```bash
act -l -W .github/workflows/pipeline.yml
```

### Notas sobre `act`:

- **No puede probar el deploy a EC2** (necesitarías configurar los secrets)
- Los jobs se ejecutan en contenedores Docker
- Puede ser más lento que ejecutar manualmente
- Útil para verificar la sintaxis y estructura del workflow

---

## 🔧 Opción 2: Ejecutar Comandos Manualmente

Esta opción te permite ejecutar cada paso del workflow manualmente en tu máquina local.

### Paso 1: Probar Tests del Backend

```bash
cd /Users/estefaniamiceli/Desktop/emiceliMod13/backend

# Instalar dependencias (si no están instaladas)
npm install

# Ejecutar tests
npm test
```

**Resultado esperado:** Todos los tests deben pasar ✅

### Paso 2: Probar Build del Backend

```bash
# Seguir en el directorio backend
cd /Users/estefaniamiceli/Desktop/emiceliMod13/backend

# Instalar dependencias (si no están instaladas)
npm install

# Compilar TypeScript
npm run build

# Verificar que el directorio dist fue generado
ls -la dist/

# Deberías ver archivos como:
# - index.js
# - application/
# - presentation/
# - domain/
# - routes/
```

**Resultado esperado:** El directorio `dist/` debe existir con los archivos compilados ✅

### Paso 3: Preparar Artefactos (simular)

```bash
# Seguir en el directorio backend
cd /Users/estefaniamiceli/Desktop/emiceliMod13/backend

# Crear el archivo tar.gz (como en el workflow)
tar -czf deploy.tar.gz dist/ package.json package-lock.json prisma/

# Verificar que el archivo fue creado
ls -lh deploy.tar.gz

# Deberías ver algo como:
# -rw-r--r--  1 usuario  staff   2.5M deploy.tar.gz
```

**Resultado esperado:** El archivo `deploy.tar.gz` debe existir ✅

### Paso 4: Verificar el Contenido del Artifact

```bash
# Ver qué contiene el tar.gz
tar -tzf deploy.tar.gz | head -20

# Deberías ver algo como:
# dist/
# dist/index.js
# dist/application/
# package.json
# package-lock.json
# prisma/
# prisma/schema.prisma
```

### Paso 5: Probar Descomprimir (simulación local)

```bash
# Crear un directorio temporal para simular el servidor
mkdir -p /tmp/test-deploy
cd /tmp/test-deploy

# Copiar el tar.gz (simular scp)
cp /Users/estefaniamiceli/Desktop/emiceliMod13/backend/deploy.tar.gz .

# Descomprimir
tar -xzf deploy.tar.gz

# Verificar que todo se descomprimió correctamente
ls -la
# Deberías ver: dist/, package.json, package-lock.json, prisma/

# Verificar que dist contiene los archivos
ls -la dist/
```

**Resultado esperado:** Todos los archivos descomprimidos correctamente ✅

### Paso 6: Probar Instalación de Producción (simulación)

```bash
# En el directorio de prueba
cd /tmp/test-deploy

# Instalar solo dependencias de producción
npm install --production

# Verificar que node_modules existe
ls -la node_modules/ | head -10

# Verificar que Prisma puede generar el cliente
npx prisma generate

# Verificar que la aplicación puede iniciarse (sin correrla)
node dist/index.js --help || echo "App compiled correctly"
```

---

## 🤖 Opción 3: Script de Prueba

Crear un script automatizado que ejecute todos los pasos.

### Crear el script:

```bash
cat > /Users/estefaniamiceli/Desktop/emiceliMod13/test-workflow.sh << 'EOF'
#!/bin/bash

# Script para probar el workflow pipeline.yml localmente

set -e  # Salir si cualquier comando falla

echo "🧪 Probando workflow pipeline.yml localmente..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir pasos
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Función para verificar éxito
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 falló${NC}"
        exit 1
    fi
}

# Cambiar al directorio del proyecto
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

print_step "Paso 1: Instalando dependencias del backend..."
cd "$PROJECT_ROOT/backend"
npm install
check_success "Dependencias instaladas"

print_step "Paso 2: Ejecutando tests..."
npm test
check_success "Tests pasaron"

print_step "Paso 3: Compilando TypeScript..."
npm run build
check_success "Build completado"

print_step "Paso 4: Verificando que dist/ existe..."
if [ -d "dist" ]; then
    check_success "Directorio dist/ generado"
else
    echo -e "${RED}❌ Error: El directorio dist no fue generado${NC}"
    exit 1
fi

print_step "Paso 5: Creando artefacto deploy.tar.gz..."
tar -czf deploy.tar.gz dist/ package.json package-lock.json prisma/
check_success "Artefacto creado"

print_step "Paso 6: Verificando contenido del artefacto..."
if [ -f "deploy.tar.gz" ]; then
    SIZE=$(ls -lh deploy.tar.gz | awk '{print $5}')
    echo -e "${GREEN}✅ Artefacto creado (tamaño: $SIZE)${NC}"
    
    # Verificar contenido
    echo "Contenido del artefacto:"
    tar -tzf deploy.tar.gz | head -10
else
    echo -e "${RED}❌ Error: deploy.tar.gz no fue creado${NC}"
    exit 1
fi

print_step "Paso 7: Simulando descompresión..."
TEST_DIR="/tmp/test-workflow-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
cp "$PROJECT_ROOT/backend/deploy.tar.gz" .
tar -xzf deploy.tar.gz
check_success "Artefacto descomprimido correctamente"

print_step "Paso 8: Verificando estructura descomprimida..."
if [ -d "dist" ] && [ -f "package.json" ] && [ -d "prisma" ]; then
    check_success "Estructura correcta después de descomprimir"
else
    echo -e "${RED}❌ Error: Estructura incorrecta después de descomprimir${NC}"
    exit 1
fi

print_step "Paso 9: Limpiando archivos temporales..."
cd "$PROJECT_ROOT/backend"
rm -f deploy.tar.gz
rm -rf "$TEST_DIR"
check_success "Limpieza completada"

echo ""
echo -e "${GREEN}🎉 ¡Todos los pasos del workflow pasaron exitosamente!${NC}"
echo ""
echo "Nota: El deploy a EC2 no se puede probar localmente sin:"
echo "  - Configurar los secrets de EC2"
echo "  - Tener acceso SSH al servidor"
echo "  - Configurar las variables de entorno necesarias"
EOF

chmod +x /Users/estefaniamiceli/Desktop/emiceliMod13/test-workflow.sh
```

### Ejecutar el script:

```bash
cd /Users/estefaniamiceli/Desktop/emiceliMod13
./test-workflow.sh
```

---

## 🔍 Verificación de Errores Comunes

### Error: "Tests fallan"

```bash
cd backend
npm test
# Revisa los errores y arréglalos antes de continuar
```

### Error: "Build falla"

```bash
cd backend
npm run build
# Revisa los errores de TypeScript
```

### Error: "No se puede crear deploy.tar.gz"

Verifica que todos los archivos/directorios existan:
```bash
cd backend
ls -la dist/
ls -la package.json
ls -la prisma/
```

### Error: "El archivo es muy grande"

Si el `deploy.tar.gz` es muy grande, verifica que no estés incluyendo `node_modules/`:
```bash
tar -tzf deploy.tar.gz | grep node_modules
# No debería mostrar nada
```

---

## 📝 Checklist de Prueba Local

Antes de hacer push a GitHub, verifica:

- [ ] ✅ Tests pasan localmente (`npm test`)
- [ ] ✅ Build funciona localmente (`npm run build`)
- [ ] ✅ El directorio `dist/` se genera correctamente
- [ ] ✅ El artefacto `deploy.tar.gz` se crea correctamente
- [ ] ✅ El artefacto contiene: `dist/`, `package.json`, `package-lock.json`, `prisma/`
- [ ] ✅ El artefacto se puede descomprimir correctamente
- [ ] ✅ La estructura después de descomprimir es correcta

---

## 🚨 Notas Importantes

1. **El deploy a EC2 NO se puede probar completamente localmente** sin:
   - Configurar los secrets de GitHub
   - Tener acceso SSH al servidor EC2
   - Configurar las variables de entorno del servidor

2. **Usa `act` para probar la sintaxis del workflow**, pero recuerda que:
   - Los secrets no estarán disponibles (a menos que uses `.secrets` file)
   - Algunas acciones pueden comportarse diferente

3. **La forma más confiable** es:
   - Probar localmente los pasos manualmente
   - Hacer push a una rama de prueba
   - Verificar en GitHub Actions que todo funciona

---

## 🔗 Recursos Adicionales

- [Documentación de act](https://github.com/nektos/act)
- [GitHub Actions Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Testing GitHub Actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github)

