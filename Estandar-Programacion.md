<center>

![./media/logo-upt.png](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERIA**

**Escuela Profesional de Ingeniería de Sistemas**

**Proyecto de Antivirus**

Curso: *Calidad y Pruebas de Software*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***LLica Mamani, Jimmy Mijair (2023076789)***

***Sierra Ruiz, Iker Alberto (2023077090)***

**Tacna – Perú**

***2026***

</center>

<div style="page-break-after: always; visibility: hidden"></div>

Sistema *RustGuard Antivirus*

Estándar de Programación

Versión *1.0*

| CONTROL DE VERSIONES | | | | |
|:---:|:---|:---|:---|:---|
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | LLica Mamani, Jimmy Mijair | Sierra Ruiz, Iker Alberto | LLica Mamani, Jimmy Mijair | 02/06/2026 | Versión Extendida |

<div style="page-break-after: always; visibility: hidden"></div>

# Estándar de Programación y Arquitectura

El desarrollo de RustGuard Antivirus sigue una normativa estricta para asegurar un código mantenible, libre de olores (Code Smells) y preparado para análisis de código estático (SAST) mediante herramientas como SonarQube y Snyk.

## 1. Convenciones de Nomenclatura

- **Archivos y Carpetas:** Todo archivo JS/JSX y directorio debe estar en `kebab-case` (ej. `scan-engine.js`, `main-window.jsx`) excepto componentes de React.
- **Componentes React:** Los archivos de componentes JSX y los nombres de las funciones React deben estar en `PascalCase` (ej. `QuarantineTable.jsx`, `const QuarantineTable = () => {}`).
- **Variables y Funciones:** Todas las funciones, métodos de clase y variables globales o de scope local deben estar en `camelCase` (ej. `startWatcher()`, `scanResult`).
- **Constantes Globales:** Toda constante de configuración, variables de entorno o variables inmutables críticas deben escribirse en `UPPER_SNAKE_CASE` (ej. `MAX_THREADS`, `CLAMAV_DIR_PATH`).

## 2. Manejo de Errores y Excepciones

- **Backend (Node.js):** El uso de bloques `try / catch` es **obligatorio** en todas las operaciones del sistema de archivos (`fs.*`) y llamadas de base de datos (`better-sqlite3`). No se permiten `catch` vacíos. Se debe utilizar `console.error` para registrar el stack trace.
- **Frontend (React):** Todos los componentes que utilicen `useEffect` o invocaciones asincrónicas IPC (`window.electronAPI.invoke`) deben envolverse en un estado de error manejado. Ejemplo: `const [error, setError] = useState(null)`.

## 3. Seguridad IPC (Inter-Process Communication)

Es un estándar de seguridad crítico para aplicaciones Electron:
1. `nodeIntegration: false` es obligatorio en todos los `BrowserWindow`.
2. `contextIsolation: true` es obligatorio.
3. El archivo `preload.js` debe utilizar exclusivamente `contextBridge.exposeInMainWorld`. No se permite inyectar objetos de módulo de Node (`fs`, `path`, `child_process`) directamente al objeto Window de Chrome.

## 4. Estilos y CSS

- El uso de CSS puro está prohibido para mantener consistencia. Todo estilo debe ser inyectado a través de utilidades de **TailwindCSS 4**.
- Evitar clases largas de Tailwind in-line que sobrepasen los 100 caracteres; si ocurren, extraer la clase en un `@apply` dentro de `App.css` o particionar en componentes pequeños.

## 5. Control de Calidad Estático (ESLint)

- Se utiliza ESLint y Prettier. Se debe cumplir la regla de 0 advertencias.
- Reglas personalizadas estrictas en `eslint.config.js`:
  - `"no-unused-vars": "error"`
  - `"no-console": "warn"` (Excepto `console.error`)
  - `"react-hooks/exhaustive-deps": "warn"`
