# Documentación de Prompts para el Pipeline CI/CD

Este documento explica los prompts y el razonamiento utilizado para generar cada sección del pipeline de CI/CD en GitHub Actions.

## Índice

1. [Tests de Backend](#1-tests-de-backend)
2. [Build del Backend](#2-build-del-backend)
3. [Despliegue en EC2](#3-despliegue-en-ec2)

---

## 1. Tests de Backend

### Prompt Utilizado

> "Crear un job de GitHub Actions que ejecute los tests del backend. El backend está en el directorio `backend/`, usa Node.js, tiene un archivo `package.json` con el script `test` que ejecuta Jest. El job debe instalar Node.js versión 18, instalar las dependencias con npm install, y ejecutar npm test. El job debe fallar si algún test falla."

### Razonamiento

- **Node.js 18**: Versión LTS estable y compatible con el proyecto
- **Cache de npm**: Se configura el cache para acelerar instalaciones posteriores
- **Working directory**: Se especifica `./backend` para ejecutar comandos en el directorio correcto
- **Dependencia explícita**: Este job no tiene `needs`, por lo que es el primero en ejecutarse
- **Fallo automático**: Si `npm test` falla, el job falla automáticamente y detiene el pipeline

### Implementación Resultante

```yaml
test-backend:
  name: Tests del Backend
  runs-on: ubuntu-latest
  
  steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Configurar Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Instalar dependencias
      working-directory: ./backend
      run: npm install
    
    - name: Ejecutar tests
      working-directory: ./backend
      run: npm test
```

### Decisiones de Diseño

1. **Ubuntu latest**: Runner estándar y confiable de GitHub Actions
2. **Actions checkout@v4**: Última versión estable para obtener el código
3. **Setup-node@v4**: Acción oficial de Node.js con soporte de cache
4. **Cache de npm**: Reduce tiempo de ejecución en runs subsecuentes
5. **Working directory**: Evita tener que hacer `cd backend` en cada comando

---

## 2. Build del Backend

### Prompt Utilizado

> "Crear un job de GitHub Actions que compile el backend TypeScript a JavaScript. El job debe depender del job de tests (`test-backend`), instalando Node.js 18, ejecutando `npm run build` en el directorio backend, y verificando que el directorio `dist/` fue generado. También debe crear un archivo tar.gz con los archivos necesarios para el despliegue (dist/, package.json, package-lock.json, prisma/) y subirlo como artefacto para usar en el despliegue."

### Razonamiento

- **Dependencia de tests**: `needs: test-backend` asegura que el build solo se ejecute si los tests pasaron
- **Verificación del build**: Se verifica que el directorio `dist/` exista después del build
- **Artefactos**: Se comprimen solo los archivos necesarios para producción
- **Retention days**: Se mantiene 1 día para permitir el despliegue, luego se elimina automáticamente

### Implementación Resultante

```yaml
build-backend:
  name: Build del Backend
  runs-on: ubuntu-latest
  needs: test-backend
  
  steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Configurar Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Instalar dependencias
      working-directory: ./backend
      run: npm install
    
    - name: Compilar TypeScript
      working-directory: ./backend
      run: npm run build
    
    - name: Verificar build
      working-directory: ./backend
      run: |
        if [ ! -d "dist" ]; then
          echo "Error: El directorio dist no fue generado"
          exit 1
        fi
        echo "Build completado exitosamente"
    
    - name: Preparar artefactos para despliegue
      working-directory: ./backend
      run: |
        tar -czf deploy.tar.gz dist/ package.json package-lock.json prisma/
    
    - name: Subir artefactos
      uses: actions/upload-artifact@v4
      with:
        name: backend-build
        path: backend/deploy.tar.gz
        retention-days: 1
```

### Decisiones de Diseño

1. **Needs: test-backend**: Garantiza orden de ejecución y evita builds innecesarios si los tests fallan
2. **Reinstalación de dependencias**: Aunque se podría reutilizar del job anterior, cada job es independiente por diseño
3. **Verificación del build**: Script bash que verifica la existencia del directorio `dist/`
4. **Artefactos comprimidos**: Reduce el tamaño de transferencia y tiempo de despliegue
5. **Incluir prisma/**: Necesario para generar el cliente Prisma en el servidor

---

## 3. Despliegue en EC2

### Prompt Utilizado

> "Crear un job de GitHub Actions que despliegue el backend en un servidor EC2 usando SSH. El job debe depender del job de build (`build-backend`), descargar los artefactos del build, configurar SSH usando un secret para la clave privada, conectarse al servidor EC2 usando secrets para el host y usuario, copiar los archivos al servidor, descomprimir, instalar dependencias de producción, generar el cliente Prisma, y reiniciar la aplicación usando PM2 si está disponible, o iniciarla directamente con node."

### Razonamiento

- **Dependencia de build**: `needs: build-backend` asegura que solo se despliegue si el build fue exitoso
- **SSH seguro**: Se configura la clave SSH desde secrets y se añade el host a known_hosts
- **Variables de entorno**: Se usan secrets de GitHub para datos sensibles (host, usuario, path)
- **Flexibilidad en ejecución**: Se intenta usar PM2 si está disponible, sino se usa nohup como alternativa
- **Script heredoc**: Permite ejecutar múltiples comandos en el servidor remoto

### Implementación Resultante

```yaml
deploy-backend:
  name: Despliegue en EC2
  runs-on: ubuntu-latest
  needs: build-backend
  if: github.event.pull_request.state == 'open'
  
  steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Descargar artefactos
      uses: actions/download-artifact@v4
      with:
        name: backend-build
        path: ./deploy-artifacts
    
    - name: Configurar SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/deploy_key
        chmod 600 ~/.ssh/deploy_key
        ssh-keyscan -H ${{ secrets.EC2_HOST }} >> ~/.ssh/known_hosts
    
    - name: Desplegar en EC2
      env:
        EC2_HOST: ${{ secrets.EC2_HOST }}
        EC2_USER: ${{ secrets.EC2_USER }}
        DEPLOY_PATH: ${{ secrets.EC2_DEPLOY_PATH }}
      run: |
        # Crear directorio de despliegue si no existe
        ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "mkdir -p ${DEPLOY_PATH}"
        
        # Copiar archivos comprimidos al servidor
        scp -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no ./deploy-artifacts/deploy.tar.gz ${EC2_USER}@${EC2_HOST}:${DEPLOY_PATH}/
        
        # Descomprimir y configurar en el servidor
        ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << EOF
          cd ${DEPLOY_PATH}
          tar -xzf deploy.tar.gz
          npm install --production
          npx prisma generate || echo "Prisma generate opcional"
          
          # Reiniciar aplicación con PM2 si existe, sino iniciar directamente
          if command -v pm2 &> /dev/null; then
            pm2 restart backend || pm2 start dist/index.js --name backend || node dist/index.js &
          else
            pkill -f "node dist/index.js" || true
            nohup node dist/index.js > app.log 2>&1 &
          fi
        EOF
        
        echo "Despliegue completado exitosamente"
```

### Decisiones de Diseño

1. **Needs: build-backend**: Garantiza que el despliegue solo ocurra después de un build exitoso
2. **Condición PR abierto**: `if: github.event.pull_request.state == 'open'` evita despliegues en PRs cerrados
3. **Configuración SSH segura**: 
   - Permisos 600 en la clave privada (requerido por SSH)
   - ssh-keyscan para evitar prompts interactivos
   - StrictHostKeyChecking=no para automatización
4. **Manejo de PM2 flexible**: 
   - Intenta restart si ya existe
   - Intenta start si no existe
   - Fallback a node directo si PM2 no está disponible
5. **Variables en heredoc**: Uso de EOF en lugar de 'ENDSSH' para permitir expansión de variables de entorno

### Secrets Necesarios

Los siguientes secrets deben configurarse en GitHub (Settings > Secrets and variables > Actions):

- **EC2_SSH_KEY**: Contenido completo del archivo `.pem` de la clave privada SSH
- **EC2_HOST**: Dirección IP pública o DNS de la instancia EC2 (ej: `ec2-12-34-56-78.compute-1.amazonaws.com` o `12.34.56.78`)
- **EC2_USER**: Usuario de la instancia (normalmente `ec2-user` para Amazon Linux o `ubuntu` para Ubuntu)
- **EC2_DEPLOY_PATH**: Ruta donde se desplegará la aplicación (ej: `/home/ec2-user/app`)

---

## Flujo General del Pipeline

El pipeline sigue este flujo:

1. **Trigger**: Se activa cuando hay un push a una rama con Pull Request abierto
2. **Tests**: Se ejecutan primero; si fallan, el pipeline se detiene
3. **Build**: Solo se ejecuta si los tests pasaron; compila TypeScript y prepara artefactos
4. **Deploy**: Solo se ejecuta si el build fue exitoso; despliega en EC2

Este orden garantiza que:
- No se construye código con tests fallidos
- No se despliega código que no compila correctamente
- Cada paso valida el anterior antes de continuar

---

## Mejoras Futuras Posibles

1. **Variables de entorno**: Añadir paso para configurar variables de entorno en el servidor
2. **Rollback**: Implementar mecanismo de rollback si el despliegue falla
3. **Notificaciones**: Añadir notificaciones (Slack, email) sobre el estado del pipeline
4. **Tests de integración**: Añadir tests después del despliegue para verificar que la app funciona
5. **Blue-Green Deployment**: Implementar estrategia de despliegue sin downtime

