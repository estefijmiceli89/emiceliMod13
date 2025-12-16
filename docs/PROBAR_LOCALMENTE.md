# 🧪 Cómo Probar GitHub Actions Localmente (Sin Hacer Push)

Puedes probar tu pipeline CI/CD sin necesidad de hacer push a GitHub. Aquí tienes varias opciones:

---

## Opción 1: Script Automático (Más Fácil) ⭐ Recomendado

Hemos creado un script que simula lo que hace GitHub Actions:

```bash
# Desde la raíz del proyecto
./scripts/test-ci-locally.sh
```

Este script:
- ✅ Verifica que Node.js está instalado
- ✅ Instala dependencias del backend
- ✅ Ejecuta todos los tests
- ✅ Compila el backend (build)
- ✅ Verifica que el build fue exitoso

**Ventajas:**
- Rápido y fácil
- Te dice exactamente qué paso falló
- No necesitas herramientas adicionales

---

## Opción 2: Ejecutar Manualmente los Comandos

Puedes ejecutar manualmente los mismos comandos que ejecuta GitHub Actions:

### Tests del Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Ejecutar tests
npm test

# 3. Build
npm run build

# 4. Verificar que se creó el directorio dist
ls -la dist/
```

Si todos estos comandos pasan sin errores, tu pipeline debería funcionar en GitHub Actions.

---

## Opción 3: Usar `act` (Ejecutar GitHub Actions Localmente)

`act` es una herramienta que ejecuta GitHub Actions en tu máquina local.

### Instalar act (Mac)

```bash
brew install act
```

### Instalar act (Linux/Windows)

Visita: https://github.com/nektos/act#installation

### Usar act

```bash
# Ejecutar el workflow ci.yml (este funciona bien con act)
act pull_request

# O ejecutar un workflow específico
act -W .github/workflows/ci.yml
```

**⚠️ Limitaciones de `act`:**
- **NO puede simular `actions/upload-artifact`** - Esta acción requiere el runtime de GitHub Actions y fallará con `ACTIONS_RUNTIME_TOKEN env variable` error
- El workflow `ci.yml` funciona bien porque no usa artefactos
- El workflow `pipeline.yml` fallará en el paso de "Subir artefactos" cuando uses `act`
- **Esto es NORMAL y esperado** - No significa que haya un error en tu código

**Solución:** Para probar el workflow completo localmente, usa el script `test-ci-locally.sh` en lugar de `act` para el workflow de deployment.

---

## Opción 4: Probar el Deploy Localmente (Solo CI, no CD)

Para probar solo la parte de CI (tests + build) sin hacer deploy:

```bash
cd backend

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Build
npm run build
```

Si estos pasos funcionan, el workflow `ci.yml` debería funcionar en GitHub.

Para probar el deploy (CD), necesitas hacer push porque requiere acceso a tu servidor EC2.

---

## ¿Cuándo Probar Localmente vs en GitHub?

### Probar Localmente ✅
- Cuando estás desarrollando y quieres verificar rápidamente
- Cuando quieres debuggear errores de tests o build
- Antes de hacer commit/push

### Probar en GitHub Actions ✅
- Para verificar la configuración completa del workflow
- Para probar el deploy real a EC2
- Para ver cómo se ve en el entorno real de CI/CD

---

## Troubleshooting

### Error: "npm command not found"
Asegúrate de tener Node.js instalado:
```bash
node --version
npm --version
```

### Error: "Tests fallan localmente"
Si los tests fallan localmente, también fallarán en GitHub Actions. Revisa los errores y corrígelos antes de hacer push.

### Error: "Build falla localmente"
Revisa los errores de TypeScript. Si compila localmente, debería compilar en GitHub Actions.

---

## Resumen: Flujo Recomendado

1. **Desarrollo local:**
   ```bash
   # Ejecutar tests mientras desarrollas
   cd backend
   npm test
   ```

2. **Antes de commit:**
   ```bash
   # Probar todo el pipeline
   ./scripts/test-ci-locally.sh
   ```

3. **Después de push:**
   - Verifica en GitHub Actions que todo funciona
   - Revisa los logs si algo falla

---

## Scripts Disponibles

- `scripts/test-ci-locally.sh` - Ejecuta todo el pipeline CI localmente

Puedes agregar más scripts según tus necesidades.

