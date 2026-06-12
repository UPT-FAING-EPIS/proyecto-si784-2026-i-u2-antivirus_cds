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

Informe de Visión y Alcance

Versión *1.0*

| CONTROL DE VERSIONES | | | | |
|:---:|:---|:---|:---|:---|
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | LLica Mamani, Jimmy Mijair | Sierra Ruiz, Iker Alberto | LLica Mamani, Jimmy Mijair | 02/06/2026 | Versión Extendida |

<div style="page-break-after: always; visibility: hidden"></div>

# **INDICE GENERAL**

[1. Propósito del Documento](#1-propósito-del-documento)

[2. Visión del Producto (Business Goals)](#2-visión-del-producto-business-goals)

[3. Estrategia de Documentación (GitHub Wikis)](#3-estrategia-de-documentación-github-wikis)

&nbsp;&nbsp;[3.1 Índice Estructural de la Wiki](#31-índice-estructural-de-la-wiki)

&nbsp;&nbsp;[3.2 Gestión de Issues y Pull Requests](#32-gestión-de-issues-y-pull-requests)

[4. Roadmap del Proyecto (Hoja de Ruta)](#4-roadmap-del-proyecto-hoja-de-ruta)

[5. Alcance y Limitaciones del Sistema](#5-alcance-y-limitaciones-del-sistema)

[6. Roles, Responsabilidades y Equipo](#6-roles-responsabilidades-y-equipo)

<div style="page-break-after: always; visibility: hidden"></div>

**<u>Informe de Visión</u>**

## 1. Propósito del Documento
El presente documento "Informe de Visión y Alcance" tiene como objetivo delinear de forma clara la meta fundamental del producto de software **RustGuard Antivirus**. Sirve como el documento guía que alinea a todo el equipo de desarrollo, la parte interesada (stakeholders/docentes) y define explícitamente qué entrará dentro de la planificación de desarrollo y qué quedará fuera de los entregables (Scope Management).

## 2. Visión del Producto (Business Goals)
**Visión:**
"Proveer a los usuarios domésticos y profesionales independientes una suite de ciberseguridad open-source, que sea ultra-rápida, 100% transparente y respete su privacidad. RustGuard elimina la complejidad de utilizar herramientas de consola de grado servidor (como ClamAV) envolviéndolas en una interfaz gráfica moderna (React/Electron), asegurando que cualquier usuario pueda aislar malware en 3 clics o menos sin perder rendimiento en su equipo".

**Objetivos del Negocio (Métricas de Éxito):**
1. **Adopción Inmediata:** Instalar y realizar un primer escaneo en menos de 2 minutos.
2. **Claridad Trazable:** Que todo registro de aislamiento o escaneo fallido sea persistido localmente y auditable mediante exportación a archivos `.txt`.
3. **Estabilidad Reactiva:** Mantener el overhead de CPU provocado por la capa de interfaz en Node.js por debajo del 5% durante el modo de espera (Idle).

## 3. Estrategia de Documentación (GitHub Wikis)
Dada la naturaleza descentralizada y académica de este software, toda la transferencia de conocimiento técnico y funcional estará alojada en los **GitHub Wikis** públicos del repositorio oficial. Esto descarta la necesidad de manuales en PDF desactualizados.

### 3.1 Índice Estructural de la Wiki
La página de Wiki de GitHub estará segmentada obligatoriamente bajo la siguiente estructura jerárquica para facilitar el onboarding de futuros colaboradores:

1. **[Inicio] Home & Acerca de RustGuard:**
   - Presentación general y enlace de descarga de la última *Release*.
   - Requisitos de Sistema (Windows 10/11, Node.js 18+).
2. **[Guía de Desarrollo] Instalación y Compilación:**
   - Procedimiento de Clonado: `git clone`.
   - Instalación de dependencias: `npm install`.
   - Ejecución Local (`npm start` o `npm run dev`).
   - Compilación para Producción: Instrucciones del comando `npm run dist` (electron-builder).
3. **[Arquitectura] El Modelo IPC (Inter-Process Communication):**
   - Cómo el Renderer Process (React, Vite) se comunica de forma asincrónica con el Main Process (Node.js) mediante `preload.cjs` usando `contextBridge`.
   - Reglas de Seguridad (NodeIntegration = false).
4. **[Core] Base de Datos SQLite:**
   - Detalle de la librería `better-sqlite3`.
   - DDLS (Data Definition Language) para la tabla `scan_history` y la tabla `quarantine`.
5. **[Core] Diccionario de Comandos ClamAV:**
   - Explicación y parámetros utilizados para ejecutar `clamscan` de forma optimizada.
   - Proceso de invocación y parsing de logs de `freshclam.conf` para mantener actualizadas las firmas víricas.
6. **[Contribución] Guía de Trabajo y Code Style:**
   - Reglas sobre el uso de ESLint y TailwindCSS.
   - Obligatoriedad de adjuntar un "DADO..CUANDO..ENTONCES" en los Commits importantes.

### 3.2 Gestión de Issues y Pull Requests
Todo requerimiento de mejora o corrección de error se documentará en la pestaña **Issues** del repositorio. Estarán etiquetados (`enhancement`, `bug`, `documentation`). Cualquier integración de código (merge) hacia la rama `main` requerirá al menos 1 Pull Request revisado por el líder técnico del proyecto para garantizar la calidad del código, verificando que no se rompan las implementaciones de ClamAV.

## 4. Roadmap del Proyecto (Hoja de Ruta)
La hoja de ruta define los hitos del ciclo de vida de desarrollo de software organizados temporalmente, asegurando una evolución sostenible de RustGuard.

### Versión 1.0: Fundación y Protección Base (MVP)
*Duración estimada: 16 semanas*
- **Semanas 1-4:** Arquitectura Base. Configuración del monorepo (Electron + React + Vite). Habilitación del contexto seguro `preload.cjs` e interfaz frameless.
- **Semanas 5-8:** Motor Antivirus. Integración nativa del binario ClamAV. Flujos de Escaneo (Rápido, Completo, Personalizado) y actualizador de firmas (`freshclam`).
- **Semanas 9-12:** Monitoreo y Cuarentena. Integración de SQLite (`better-sqlite3`). Watcher en tiempo real (`chokidar`) y aislamiento de archivos.
- **Semanas 13-16:** Estabilización. Exportación de historiales a `.txt`, empaquetado NSIS para Windows y publicación del Release Oficial en GitHub.

### Versión 2.0: Telemetría y Ecosistema en la Nube
*Duración estimada: 12 semanas*
- **Mes 1:** Infraestructura. Despliegue de infraestructura en AWS mediante Terraform (S3, RDS PostgreSQL, Lambda).
- **Mes 2:** Telemetría Opcional. Los clientes de RustGuard envían metadatos anónimos de las amenazas detectadas a la base de datos global.
- **Mes 3:** Panel Web. Lanzamiento de un Dashboard web en React para visualizar mapas globales de calor de malware detectado por los nodos de RustGuard.

### Versión 3.0: Análisis Heurístico con Machine Learning
*Duración estimada: 16 semanas*
- **Mes 1-2:** Recolección de Datos y Entrenamiento. Entrenar un modelo de clasificación binaria estática utilizando un dataset público de binarios limpios y maliciosos.
- **Mes 3-4:** Motor Híbrido. Integrar el modelo ONNX dentro del pipeline de Node.js, complementando la detección de firmas clásica de ClamAV con predicciones heurísticas para ataques de "Día Cero" (Zero-day).

## 5. Alcance y Limitaciones del Sistema
Es indispensable establecer las fronteras técnicas de lo que RustGuard puede y no puede hacer.

**Dentro del Alcance:**
- Escaneo asincrónico por demanda (Rápido y Completo).
- Aislamiento físico de ejecutables infectados detectados en la base local (Cuarentena).
- Generación de historiales consultables e inmutables mediante SQLite.
- Detección de cambios en carpetas predefinidas utilizando el demonio `chokidar`.

**Limitaciones / Fuera del Alcance:**
- RustGuard Antivirus **no** funciona a nivel de Kernel (Ring 0). No cuenta con un driver de sistema de archivos (MiniFilter Driver de Windows). En consecuencia, no puede interceptar una ejecución maliciosa en el mismo nanosegundo en que se lanza a memoria RAM; su protección activa reacciona a los eventos *después* de que el archivo toca el disco (mediante inotify/ReadDirectoryChangesW).
- No cuenta con un cortafuegos (Firewall) integrado para bloqueo de puertos de red.
- La velocidad del escaneo completo está supeditada directamente al hardware (HDD vs SSD) del usuario, debido a la naturaleza I/O del motor ClamAV.

## 6. Roles, Responsabilidades y Equipo

El equipo sigue pautas de marco ágil, distribuyendo la carga de trabajo en base a responsabilidades técnicas claras.

| Rol | Miembro Asignado | Responsabilidad Técnica |
|:---|:---|:---|
| **Lead Developer / Backend** | Jimmy Llica | Diseño de la arquitectura Electron. Desarrollo del Main Process. Configuración de `better-sqlite3`, `chokidar` y comunicación asincrónica IPC. |
| **Frontend / UI-UX Designer** | Iker Sierra | Diseño de la interfaz gráfica React y Tailwind CSS. Implementación de los componentes visuales (Modales, Tablas de Historial, Botones interactivos). |
| **QA / Seguridad** | Equipo Conjunto | Implementación de pruebas EICAR, validación de falsos positivos en ClamAV, control de dependencias NPM y despliegue del instalador final. |
