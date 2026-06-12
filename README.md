# RustGuard Antivirus 🛡️

RustGuard es una suite de ciberseguridad open-source ultraligera de escritorio, orientada al consumidor final. Construida con una base sólida que acopla tecnologías web ultra-rápidas (React, Vite, Tailwind CSS) y un motor interno backend mediante Electron (Node.js). Este producto en su núcleo envuelve e invoca rutinas del robusto motor de código abierto **ClamAV**.

## Características Principales ✨

- **Motor ClamAV Integrado:** Escaneo profundo basado en firmas de malware y actualización automática de base de datos de virus mediante `freshclam`.
- **Análisis bajo demanda:** Escaneos rápidos, completos y personalizados por carpetas específicas.
- **Protección Activa (Background):** Servicio residente en memoria que monitorea cambios del disco (`chokidar`) para detectar descargas maliciosas en tiempo real.
- **Bóveda de Cuarentena:** Aislamiento seguro de amenazas detectadas y posibilidad de restaurar "falsos positivos" de forma transparente.
- **Trazabilidad Inmutable:** Registro histórico de escaneos guardado en una base de datos local ultra rápida SQLite (`better-sqlite3`).
- **Interfaz "Frameless" Moderna:** UI construida con React, Tailwind CSS y Lucide Icons para una experiencia intuitiva, incluyendo soporte a temas oscuros.

## Arquitectura del Proyecto 🏗️

El proyecto acata el modelo multi-proceso de Electron, garantizando aislamiento de seguridad:
- **Renderer Process:** Construido con **React 19** y **Vite**. Gestiona toda la interfaz y experiencia de usuario.
- **Main Process:** Construido con **Node.js** y **Electron**. Gestiona llamadas al sistema operativo, manipula la base de datos local `rustguard.db` e invoca los binarios `clamscan.exe` en segundo plano.
- **Preload (Context Bridge):** Asegura que la interfaz visual no tenga acceso directo ni permisos sobre el disco duro (Comunicación IPC Asíncrona estricta).

## Requisitos del Sistema 💻

- **Entorno de Producción:** Windows 10/11, macOS, o Linux.
- **Entorno de Desarrollo:** Node.js v22 o superior.

## Instrucciones de Desarrollo 🛠️

Si deseas contribuir o probar el proyecto en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone <url-de-tu-repositorio>
   cd proyecto-si784-2026-i-u2-antivirus_cds
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo Desarrollo (Hot-Reload de Vite + Electron):**
   ```bash
   npm start
   # o
   npm run dev
   ```

4. **Empaquetar para Producción (Crear Instalador ejecutable):**
   ```bash
   npm run dist
   ```

## Integración Continua y Pruebas 🧪

Este proyecto cuenta con flujos automatizados de GitHub Actions (`.github/workflows/`) para asegurar la calidad de código:
- Pruebas Unitarias (Jest).
- Pruebas de Interfaz (Playwright) con captura de video.
- Análisis de Vulnerabilidades Estáticas (Snyk, Semgrep).
- Reportes de Mutación (Stryker).
- Empaquetado automático de Releases.

## Documentación y Wiki 📖

Para mayor información técnica, revisa la carpeta `Informes/` en este repositorio, que incluye:
- Informes de Factibilidad, Visión y Arquitectura.
- Diccionario de Datos (SQLite).
- Estándar de Programación y Reglas de ESLint.
- Criterios de Aceptación y Pruebas BDD (Gherkin).

También puedes consultar la **Wiki** oficial (disponible en la carpeta `Informes/Wiki/`).

---

**Desarrollado para:** Universidad Privada de Tacna - Facultad de Ingeniería - Escuela Profesional de Ingeniería de Sistemas.  
**Curso:** Calidad y Pruebas de Software (2026).  
**Autores:** LLica Mamani, Jimmy Mijair & Sierra Ruiz, Iker Alberto.
