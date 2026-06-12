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

Informe de Documentación y Manual

Versión *1.0*

| CONTROL DE VERSIONES | | | | |
|:---:|:---|:---|:---|:---|
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | LLica Mamani, Jimmy Mijair | Sierra Ruiz, Iker Alberto | LLica Mamani, Jimmy Mijair | 02/06/2026 | Versión Extendida |

<div style="page-break-after: always; visibility: hidden"></div>

# **INDICE GENERAL**

[1. Introducción](#1-introducción)

[2. Documentación Técnica (JSDoc y TypeDoc)](#2-documentación-técnica-jsdoc-y-typedoc)

[3. Manual de Usuario (A partir de pruebas UI Playwright)](#3-manual-de-usuario-a-partir-de-pruebas-ui-playwright)

&nbsp;&nbsp;[3.1 Iniciar un Escaneo](#31-iniciar-un-escaneo)

&nbsp;&nbsp;[3.2 Gestión de Cuarentena](#32-gestión-de-cuarentena)

<div style="page-break-after: always; visibility: hidden"></div>

**<u>Informe de Documentación y Manual</u>**

## 1. Introducción
El presente informe engloba las normativas técnicas de documentación estática y sirve de base para el Manual de Usuario extraído a partir de las automatizaciones de Interfaz de Usuario (Playwright).

## 2. Documentación Técnica (JSDoc y TypeDoc)
Dado que RustGuard es un proyecto basado en el ecosistema Javascript/Node.js, se descarta el uso de `DocFx` (orientado a C#) y se implementa **TypeDoc** y **JSDoc**.
Todo módulo crítico está anotado con JSDoc. Esto permite que GitHub Pages y los pipelines generen una página HTML estática con la API completa de las funciones IPC (Inter-Process Communication).

Ejemplo de documentación en código fuente (`clamav.js`):
```javascript
/**
 * Inicia un escaneo completo de todo el disco utilizando ClamAV.
 * @async
 * @function fullScan
 * @returns {Promise<{files: number, threats: number}>} Retorna una promesa que se resuelve con las métricas finales.
 * @throws {Error} Lanza una excepción si ClamAV no está instalado o los permisos son insuficientes.
 */
async function fullScan() {
    // Implementación
}
```

La documentación autogenerada resultante se publica automáticamente como un artefacto estático a través del flujo de GitHub Actions (`.github/workflows/static-analysis.yml`).

## 3. Manual de Usuario (A partir de pruebas UI Playwright)

Las siguientes instrucciones operativas han sido validadas mediante tests de comportamiento automatizados en Chromium (Playwright). Las grabaciones en formato `.webm` se encuentran en el release oficial de Github.

### 3.1 Iniciar un Escaneo

1. **Abrir la Aplicación:** Haga doble clic en el ícono de RustGuard. Espere a que la ventana *Splash Screen* valide las firmas ("Firmas al día").
2. **Seleccionar Opción:** En el *Dashboard* principal, verá 3 botones azules.
3. **Escaneo Personalizado:** Si desea escanear una memoria USB, haga clic en "Escaneo Personalizado". Se abrirá la ventana de Windows; seleccione su unidad `E:/` o `D:/`.
4. **Visualizar Progreso:** La barra circular comenzará a girar. Al encontrar amenazas, el número en rojo ascenderá inmediatamente.

### 3.2 Gestión de Cuarentena

1. **Ir a la pestaña:** Haga clic en el ícono del escudo lateral izquierdo llamado "Cuarentena".
2. **Revisar Amenazas:** Verá una tabla con los virus detectados y su ruta original.
3. **Restaurar:** Si usted está seguro de que el archivo es legítimo (Falso Positivo), haga clic en el botón verde "Restaurar". RustGuard devolverá el archivo a su ubicación original.
