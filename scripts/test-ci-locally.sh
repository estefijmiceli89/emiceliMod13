#!/bin/bash

# Script para probar el pipeline CI localmente
# Simula lo que haría GitHub Actions sin necesidad de hacer push

echo "🧪 Probando CI Pipeline Localmente..."
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Paso 1: Checkout (ya estamos en el repo)
print_step "Paso 1: Verificando que estamos en el directorio correcto..."
if [ ! -d "backend" ]; then
    print_error "No se encuentra el directorio backend. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi
print_success "Directorio correcto"

# Paso 2: Configurar Node.js
print_step "Paso 2: Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js encontrado: $NODE_VERSION"

# Paso 3: Instalar dependencias
print_step "Paso 3: Instalando dependencias del backend..."
cd backend
if ! npm install --silent; then
    print_error "Error al instalar dependencias"
    exit 1
fi
print_success "Dependencias instaladas"

# Paso 4: Ejecutar tests
print_step "Paso 4: Ejecutando tests del backend..."
if npm test; then
    print_success "Tests pasaron exitosamente"
else
    print_error "Algunos tests fallaron"
    exit 1
fi

# Paso 5: Build
print_step "Paso 5: Compilando el backend..."
if npm run build; then
    print_success "Build completado exitosamente"
else
    print_error "Error en el build"
    exit 1
fi

# Verificar que el build generó archivos
if [ ! -d "dist" ]; then
    print_error "El directorio dist no fue generado"
    exit 1
fi
print_success "Directorio dist generado correctamente"

echo ""
echo "========================================"
print_success "¡Todo el pipeline CI pasó localmente!"
echo ""
echo "Ahora puedes hacer commit y push con confianza."
echo "Los tests y el build funcionan correctamente."

