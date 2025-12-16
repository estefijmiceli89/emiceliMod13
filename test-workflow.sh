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
npm install > /dev/null 2>&1
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
    echo "   Archivos en dist/: $(ls dist/ | wc -l | xargs) archivos"
else
    echo -e "${RED}❌ Error: El directorio dist no fue generado${NC}"
    exit 1
fi

print_step "Paso 5: Creando artefacto deploy.tar.gz..."
tar -czf deploy.tar.gz dist/ package.json package-lock.json prisma/ 2>/dev/null
check_success "Artefacto creado"

print_step "Paso 6: Verificando contenido del artefacto..."
if [ -f "deploy.tar.gz" ]; then
    SIZE=$(ls -lh deploy.tar.gz | awk '{print $5}')
    echo -e "${GREEN}✅ Artefacto creado (tamaño: $SIZE)${NC}"
    
    # Verificar contenido importante
    echo "   Contenido verificado:"
    tar -tzf deploy.tar.gz | grep -E "^(dist/|package.json|package-lock.json|prisma/)" | head -5 | sed 's/^/     - /'
else
    echo -e "${RED}❌ Error: deploy.tar.gz no fue creado${NC}"
    exit 1
fi

print_step "Paso 7: Simulando descompresión..."
TEST_DIR="/tmp/test-workflow-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
cp "$PROJECT_ROOT/backend/deploy.tar.gz" . > /dev/null 2>&1
tar -xzf deploy.tar.gz > /dev/null 2>&1
check_success "Artefacto descomprimido correctamente"

print_step "Paso 8: Verificando estructura descomprimida..."
if [ -d "dist" ] && [ -f "package.json" ] && [ -d "prisma" ]; then
    check_success "Estructura correcta después de descomprimir"
    echo "   - dist/ existe"
    echo "   - package.json existe"
    echo "   - prisma/ existe"
else
    echo -e "${RED}❌ Error: Estructura incorrecta después de descomprimir${NC}"
    echo "   dist existe: $([ -d "dist" ] && echo "Sí" || echo "No")"
    echo "   package.json existe: $([ -f "package.json" ] && echo "Sí" || echo "No")"
    echo "   prisma existe: $([ -d "prisma" ] && echo "Sí" || echo "No")"
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
echo "📝 Nota: El deploy a EC2 no se puede probar localmente sin:"
echo "   - Configurar los secrets de EC2 en GitHub"
echo "   - Tener acceso SSH al servidor"
echo "   - Configurar las variables de entorno necesarias"
echo ""
echo "✅ El workflow está listo para usar en GitHub Actions"

