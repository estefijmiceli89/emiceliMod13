# 🚀 Guía Completa: Configurar GitHub Actions desde Cero

Esta guía te explicará paso a paso cómo configurar GitHub Actions para tu proyecto.

---

## 📋 Índice

1. [Conceptos Básicos](#conceptos-básicos)
2. [Paso 1: Preparar el Repositorio](#paso-1-preparar-el-repositorio)
3. [Paso 2: Subir los Archivos de Workflow](#paso-2-subir-los-archivos-de-workflow)
4. [Paso 3: Configurar Secrets en GitHub](#paso-3-configurar-secrets-en-github)
5. [Paso 4: Probar el Pipeline](#paso-4-probar-el-pipeline)
6. [Paso 5: Verificar que Funciona](#paso-5-verificar-que-funciona)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎓 Conceptos Básicos

### ¿Qué es CI/CD?
- **CI (Continuous Integration)**: Valida tu código automáticamente cada vez que haces cambios
- **CD (Continuous Deployment)**: Despliega tu aplicación automáticamente cuando el código pasa las validaciones

### ¿Qué hace tu pipeline?

**Workflow `ci.yml`** (se ejecuta en Pull Requests):
- ✅ Ejecuta tests del backend
- ✅ Compila el backend (verifica que no tenga errores)

**Workflow `pipeline.yml`** (se ejecuta cuando haces push a main/master):
- ✅ Ejecuta tests del backend
- ✅ Compila el backend
- ✅ Despliega automáticamente el backend en tu servidor EC2

### Requisitos según el enunciado:
1. ✅ Tests de backend
2. ✅ Build del backend
3. ✅ Despliegue del backend en EC2

---

## 📝 Paso 1: Preparar el Repositorio

### 1.1 Verificar que tienes Git configurado

Abre tu terminal y ejecuta:

```bash
cd /Users/estefaniamiceli/Desktop/emiceliMod13
git status
```

Si ves una lista de archivos, Git está funcionando. Si ves un error, necesitas inicializar Git:

```bash
git init
```

### 1.2 Verificar tu repositorio remoto

Ya tienes configurado:
- **Repositorio**: `https://github.com/estefijmiceli89/emiceliMod13.git`

Si necesitas cambiar el remoto:
```bash
git remote set-url origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

---

## 📤 Paso 2: Subir los Archivos de Workflow

Los archivos de workflow ya están en tu proyecto en `.github/workflows/`. Necesitas subirlos a GitHub.

### 2.1 Agregar los archivos al repositorio

```bash
# Asegúrate de estar en el directorio correcto
cd /Users/estefaniamiceli/Desktop/emiceliMod13

# Agrega todos los archivos nuevos (incluyendo los workflows)
git add .

# Verifica qué archivos se van a subir
git status
```

### 2.2 Hacer commit de los cambios

```bash
git commit -m "Agregar workflows de CI/CD para GitHub Actions"
```

### 2.3 Subir a GitHub

```bash
# Primera vez: configura la rama main
git branch -M main

# Sube los cambios
git push -u origin main
```

Si te pide credenciales, necesitarás un **Personal Access Token** de GitHub:
- Ve a GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Genera un nuevo token con permisos `repo`
- Úsalo como contraseña cuando Git te la pida

---

## 🔐 Paso 3: Configurar Secrets en GitHub

Los "secrets" son variables secretas (contraseñas, claves SSH) que GitHub Actions necesita para conectarse a tu servidor EC2.

### 3.1 Ir a la configuración de Secrets

1. Ve a tu repositorio en GitHub: `https://github.com/estefijmiceli89/emiceliMod13`
2. Click en **Settings** (Configuración) en la parte superior del repositorio
3. En el menú de la izquierda, busca **Secrets and variables** → **Actions**
4. Click en **New repository secret** (Nuevo secreto de repositorio)

### 3.2 Agregar los Secrets necesarios

Necesitas agregar estos 4 secrets:

#### Secret 1: `EC2_SSH_KEY`

**¿Qué es?** La clave privada SSH (.pem) para conectarte a tu servidor EC2.

**Cómo obtenerla:**
- Si ya tienes una instancia EC2, descargaste un archivo `.pem` cuando la creaste
- Si no lo tienes, necesitas crear una instancia EC2 primero

**Cómo agregarlo:**
1. Abre el archivo `.pem` con un editor de texto (o ejecuta: `cat tu-clave.pem`)
2. Copia **TODO** el contenido (desde `-----BEGIN RSA PRIVATE KEY-----` hasta `-----END RSA PRIVATE KEY-----`)
3. En GitHub:
   - **Name**: `EC2_SSH_KEY`
   - **Secret**: Pega todo el contenido del archivo `.pem`
   - Click en **Add secret**

#### Secret 2: `EC2_HOST`

**¿Qué es?** La dirección IP pública o DNS de tu servidor EC2.

**Cómo obtenerla:**
- Ve a AWS Console → EC2 → Instances
- Selecciona tu instancia
- En la parte inferior verás "Public IPv4 address" o "Public IPv4 DNS"
- Copia esa dirección (ejemplo: `ec2-12-34-56-78.compute-1.amazonaws.com` o `12.34.56.78`)

**Cómo agregarlo:**
1. **Name**: `EC2_HOST`
2. **Secret**: La dirección IP o DNS (ejemplo: `12.34.56.78`)
3. Click en **Add secret**

#### Secret 3: `EC2_USER`

**¿Qué es?** El nombre de usuario para conectarte por SSH a tu servidor.

**Valores comunes:**
- **Amazon Linux**: `ec2-user`
- **Ubuntu**: `ubuntu`
- **Red Hat**: `ec2-user`

**Cómo agregarlo:**
1. **Name**: `EC2_USER`
2. **Secret**: `ec2-user` (o el usuario correspondiente a tu AMI)
3. Click en **Add secret**

#### Secret 4: `EC2_DEPLOY_PATH`

**¿Qué es?** La ruta en el servidor donde quieres desplegar tu aplicación.

**Ejemplos:**
- `/home/ec2-user/app`
- `/var/www/backend`
- `/opt/backend`

**Cómo agregarlo:**
1. **Name**: `EC2_DEPLOY_PATH`
2. **Secret**: La ruta donde quieres desplegar (ejemplo: `/home/ec2-user/app`)
3. Click en **Add secret**

### 3.3 Verificar que los Secrets están configurados

Después de agregar los 4 secrets, deberías ver una lista como esta:

```
✅ EC2_DEPLOY_PATH
✅ EC2_HOST
✅ EC2_SSH_KEY
✅ EC2_USER
```

---

## 🧪 Paso 4: Probar el Pipeline

Hay dos formas de probar:

### Opción A: Probar el CI (sin deploy) - Recomendado para empezar

Crea un Pull Request para probar el workflow `ci.yml`:

1. **Crea una nueva rama:**
   ```bash
   git checkout -b test-ci
   ```

2. **Haz un cambio pequeño** (por ejemplo, agrega un comentario a algún archivo)

3. **Commit y push:**
   ```bash
   git add .
   git commit -m "Test: Probar CI pipeline"
   git push -u origin test-ci
   ```

4. **Crea un Pull Request:**
   - Ve a GitHub → Pull requests → New pull request
   - Selecciona `test-ci` → `main`
   - Click en "Create pull request"

5. **Verifica que se ejecute:**
   - En el PR, verás una sección "Checks" o "Actions"
   - Deberías ver que se ejecuta "CI - Continuous Integration"
   - Espera a que termine (puede tardar 2-5 minutos)

### Opción B: Probar el CD (con deploy) - Solo si ya tienes EC2 configurado

Si ya tienes todo configurado y quieres probar el despliegue:

1. **Haz push directo a main:**
   ```bash
   git checkout main
   git add .
   git commit -m "Test: Probar deploy automático"
   git push origin main
   ```

2. **Verifica en GitHub Actions:**
   - Ve a la pestaña **Actions** en tu repositorio
   - Deberías ver que se ejecuta "CD - Continuous Deployment"
   - Observa los logs para ver si el despliegue funciona

---

## ✅ Paso 5: Verificar que Funciona

### 5.1 Ver los resultados en GitHub

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions** (en la parte superior)
3. Verás una lista de todos los workflows ejecutados
4. Click en uno para ver los detalles

### 5.2 Entender los resultados

**✅ Verde (✓)**: Todo funcionó correctamente
**❌ Rojo (✗)**: Algo falló, revisa los logs
**🟡 Amarillo (⏳)**: Está ejecutándose

### 5.3 Ver los logs detallados

1. Click en un workflow ejecutado
2. Click en un job (por ejemplo, "Tests del Backend")
3. Verás cada paso expandible con sus logs
4. Si algo falla, los logs te dirán qué salió mal

### 5.4 Verificar que el deploy funcionó

Si probaste el deploy:

1. **Conéctate a tu servidor EC2 por SSH:**
   ```bash
   ssh -i tu-clave.pem ec2-user@TU_IP_EC2
   ```

2. **Verifica que la aplicación está corriendo:**
   ```bash
   cd /home/ec2-user/app  # o la ruta que configuraste
   ls -la  # Deberías ver los archivos desplegados
   pm2 list  # Si usas PM2, deberías ver tu app corriendo
   ```

---

## 🔧 Solución de Problemas

### Problema: "No se puede conectar por SSH"

**Causas posibles:**
- El secret `EC2_SSH_KEY` está mal copiado (debe incluir las líneas BEGIN/END)
- El secret `EC2_HOST` tiene un formato incorrecto
- El servidor EC2 no tiene el puerto 22 abierto en el Security Group

**Solución:**
1. Verifica que copiaste TODA la clave privada (incluyendo BEGIN/END)
2. Verifica la IP en AWS Console
3. En AWS → EC2 → Security Groups, asegúrate de que el puerto 22 está abierto

### Problema: "Tests fallan"

**Solución:**
1. Ejecuta los tests localmente primero:
   ```bash
   cd backend
   npm test
   ```
2. Si fallan localmente, GitHub Actions también fallará
3. Arregla los tests localmente antes de hacer push

### Problema: "Build falla"

**Solución:**
1. Prueba compilar localmente:
   ```bash
   cd backend
   npm run build
   ```
2. Revisa los errores de TypeScript
3. Arregla los errores antes de hacer push

### Problema: "No veo la pestaña Actions"

**Solución:**
- Asegúrate de que los archivos `.github/workflows/*.yml` están en tu repositorio
- Haz push de los cambios:
  ```bash
  git add .github/workflows/
  git commit -m "Agregar workflows"
  git push
  ```

### Problema: "El workflow no se ejecuta"

**Causas posibles:**
- Los archivos no están en la rama correcta (deben estar en `main` o `master`)
- El archivo YAML tiene errores de sintaxis

**Solución:**
1. Verifica que estás en la rama correcta:
   ```bash
   git branch
   ```
2. Verifica la sintaxis YAML online: https://www.yamllint.com/

---

## 📚 Recursos Adicionales

- [Documentación oficial de GitHub Actions](https://docs.github.com/en/actions)
- [Guía de GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Configurar EC2 para SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connection-prereqs.html)

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, deberías tener:
- ✅ CI funcionando en Pull Requests
- ✅ CD funcionando cuando haces push a main
- ✅ Tests ejecutándose automáticamente
- ✅ Deploy automático a EC2

**¿Tienes preguntas?** Revisa los logs en GitHub Actions para ver qué está pasando.

