# RustGuard - Antivirus System

RustGuard es un sistema antivirus moderno desarrollado con React, Vite y Electron, diseñado para ofrecer protección en tiempo real, escaneos rápidos y completos, y gestión de cuarentena de amenazas. 

Este proyecto se ha implementado con un flujo avanzado de CI/CD, automatización de infraestructura e integraciones de calidad de código y seguridad para garantizar la mayor confiabilidad y control.

## Arquitectura y Tecnologías
- **Frontend:** React 19, TailwindCSS 4, Vite
- **Desktop Backend:** Electron
- **Testing:** Vitest, Testing Library, Playwright (BDD & E2E)
- **Infraestructura Automática:** Terraform y GitHub Actions
- **Seguridad y Análisis Estático:** Semgrep y Snyk

## Flujos de CI/CD Automatizados (GitHub Actions)
Este proyecto cuenta con varios flujos implementados en `.github/workflows/`:

1. **Infraestructura como Código (`terraform.yml`)**: Despliega y valida los recursos necesarios en AWS.
2. **Análisis Estático (`static-analysis.yml`)**: Ejecuta **Semgrep** (exportando SARIF al dashboard de GitHub) y **Snyk** para auditar vulnerabilidades en dependencias.
3. **Cobertura de Código (`coverage.yml`)**: Ejecuta las pruebas unitarias usando `vitest` y sube un reporte HTML (>70% cobertura) a GitHub Pages.
4. **Pruebas de Mutación (`mutation.yml`)**: Utiliza `Stryker` para validar la robustez de los tests unitarios y sube el reporte a GitHub Pages.
5. **Pruebas E2E y BDD (`e2e.yml`)**: Ejecuta **Playwright** para pruebas de interfaz incluyendo captura de videos y valida los escenarios Gherkin generados mediante `playwright-bdd`.
6. **Release Automatizado (`release.yml`)**: Empaqueta binarios de Windows (.exe NSIS y Portable) mediante `electron-builder` en base a nuevos tags (ej. `v1.0.0`).

## Comandos y Scripts Locales

Para instalar dependencias:
```bash
npm install
```

Para correr en entorno de desarrollo (React + Electron):
```bash
npm run start
```

### Pruebas (Testing)

**Pruebas Unitarias y Reporte de Cobertura:**
Asegura que el código tenga más de 70% de cobertura.
```bash
npm run test:coverage
```

**Pruebas de Mutación:**
Evalúa la calidad de los tests unitarios inyectando mutaciones.
```bash
npm run test:mutation
```

**Pruebas BDD (Behavior-Driven Development) y E2E:**
Genera los pasos de BDD y los ejecuta grabando videos mediante Playwright.
```bash
npm run test:e2e
```

## Estructura del Proyecto
- `src/`: Código fuente principal de la aplicación React.
- `src/features/`: Casos de prueba BDD escritos en Gherkin (`.feature`) y _step definitions_.
- `src/test/`: Pruebas unitarias de todos los componentes de interfaz.
- `electron/`: Archivo de entrada y lógica del proceso principal de Electron.
- `terraform/`: Definición de infraestructura en HCL para AWS.
- `.github/workflows/`: Definiciones de las GitHub Actions para integración y despliegue continuo.

## Reportes Generados
- **Vitest Coverage**: `coverage/`
- **Stryker Mutation**: `reports/mutation/`
- **Playwright BDD & E2E**: `playwright-report/`

## Licencia
Propiedad del Proyecto SI784.
