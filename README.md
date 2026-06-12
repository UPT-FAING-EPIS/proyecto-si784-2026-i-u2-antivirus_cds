<div align="center">

# 🛡️ RustGuard Antivirus 🛡️

**UNIVERSIDAD PRIVADA DE TACNA**  
**FACULTAD DE INGENIERÍA**  
**Escuela Profesional de Ingeniería de Sistemas**

**Curso:** Calidad y Pruebas de Software (2026)  
**Docente:** Mag. Patrick Cuadros Quiroga  
**Integrantes:**  
*LLica Mamani, Jimmy Mijair (2023076789)*  
*Sierra Ruiz, Iker Alberto (2023077090)*

---

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

<br />

## 📖 Descripción del Proyecto

**RustGuard** es una suite de ciberseguridad open-source ultraligera de escritorio. Construida con una base sólida que acopla tecnologías web de última generación y un motor interno backend mediante Electron (Node.js). Este producto envuelve e invoca en su núcleo las rutinas del robusto motor de código abierto **ClamAV**, ofreciendo escaneos precisos, monitoreo en tiempo real y una bóveda de cuarentena.

El sistema fue diseñado aplicando métricas rigurosas de calidad de software, pruebas automatizadas, desarrollo guiado por comportamiento (BDD) e integración continua.

---

## ✨ Características Principales

* 🔍 **Motor ClamAV Integrado:** Escaneo profundo basado en firmas de malware y actualización automática de base de datos de virus mediante `freshclam`.
* ⚡ **Análisis bajo demanda:** Escaneos Rápidos, Completos y Personalizados por carpetas específicas o memorias USB.
* 🛡️ **Protección en Tiempo Real:** Servicio residente en memoria que monitorea cambios del disco (`chokidar`) para detectar descargas maliciosas al instante.
* 🔒 **Bóveda de Cuarentena:** Aislamiento seguro de amenazas detectadas, encriptándolas, con la posibilidad de restaurar falsos positivos de forma transparente.
* 📊 **Trazabilidad Inmutable:** Registro histórico de escaneos guardado en una base de datos local ultra rápida SQLite (`better-sqlite3`).
* 🎨 **Interfaz Moderna "Frameless":** UI construida con React y Tailwind CSS para una experiencia de usuario amigable y fluida.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto acata el estricto modelo multi-proceso de Chromium/Electron, garantizando aislamiento de seguridad (Sandboxing):

* **Capa de Presentación (Frontend):** 
  * Desarrollada con **React 19** y **Vite**.
  * Estilizado con **Tailwind CSS**.
* **Proceso Principal (Backend / Main Process):**
  * Construido con **Node.js** y **Electron**.
  * Manipula la base de datos **SQLite** (`better-sqlite3`).
  * Despliega sub-procesos nativos (`child_process`) para operar **ClamAV** (`clamscan.exe`).
* **Seguridad (Preload / Context Bridge):**
  * Asegura que la interfaz visual no tenga acceso directo ni permisos sobre el disco duro, operando mediante canales de comunicación IPC asíncronos.

---

## 🧪 Calidad de Software (CI/CD)

Este repositorio aplica prácticas avanzadas de DevOps y Quality Assurance:

- **Infraestructura como Código:** Flujos preparados para `Terraform` (AWS).
- **Pruebas BDD y Unitarias:** Implementadas con **Jest** garantizando un umbral de cobertura mayor al 70%.
- **Pruebas de Interfaz (E2E):** Ejecutadas automáticamente con **Playwright**, grabando videos de comportamiento en cada Pull Request.
- **Análisis de Seguridad Estático:** Integración con **Snyk** y **Semgrep** para mitigar vulnerabilidades y secretos expuestos.
- **Pruebas de Mutación:** Verificación exhaustiva de código usando **Stryker Mutator**.

> Los reportes detallados y la evidencia de pruebas se documentan y exportan mediante *GitHub Actions* y *GitHub Pages*.

---

## 🚀 Instrucciones de Desarrollo e Instalación

Para colaborar, clonar o auditar el código fuente en tu entorno local:

### Requisitos Previos
* **Sistema Operativo:** Windows 10/11, macOS, o distribuciones Linux de 64 bits.
* **Entorno:** Node.js v18.0 o superior.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/UPT-FAING-EPIS/proyecto-si784-2026-i-u2-antivirus_cds.git
   cd proyecto-si784-2026-i-u2-antivirus_cds
   ```

2. **Instalar dependencias NPM:**
   ```bash
   npm install
   ```

3. **Ejecutar el entorno de desarrollo (Modo Hot-Reload):**
   ```bash
   npm run dev
   ```

4. **Compilar y Empaquetar para Producción (.exe):**
   ```bash
   npm run dist
   ```
   *El archivo ejecutable instalable se generará en la carpeta `release/`.*

---

## 📚 Documentación Adicional y Wiki

¿Buscas el manual de usuario, diccionarios de datos o la hoja de ruta de futuras versiones?  
El proyecto incluye un portal exhaustivo de documentación que almacena:

* **Informes Académicos:** Factibilidad, Visión, Requerimientos (Historias de Usuario) y Arquitectura.
* **Diccionario de Datos:** Detalle de las tablas internas de la base de datos `rustguard.db`.
* **Estándar de Programación:** Reglas de linter (ESLint) y buenas prácticas de nombramiento.
* **Roadmap Oficial:** Evolución de las versiones 1.0 (MVP), 2.0 (Telemetría Cloud) y 3.0 (Heurística Machine Learning).

Puedes consultar toda esta información dentro de las carpetas `Informes/` y `Informes/Wiki/`.

<div align="center">
  <br />
  <i>Construyendo software más seguro para el mañana.</i>
</div>

<div align="center">
  <br />
  <i>Iker Sierra - Jimmy Llica</i>
</div>