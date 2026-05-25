# Arquitectura del Sistema Antivirus Robusto

El sistema sigue un diseño modular con separación en capas: UI (PyQt5), Motor de análisis (engine), Monitor residente (core), Base de datos local (SQLite) y servicios de red.

## Flujo de un archivo
1. Intercepción por el monitor en tiempo real o solicitud de escaneo manual.
2. Verificación de listas blanca/negra locales.
3. Escaneo con firmas YARA y hashes.
4. Heurística estática.
5. Clasificador de Machine Learning.
6. Consulta de reputación (cloud / local).
7. Decisión: limpio, cuarentena o sandbox.
8. Sandbox local ejecuta en entorno aislado y reporta comportamiento.

## Componentes principales
- `ui/`: Interfaz gráfica con pestañas para cada funcionalidad.
- `engine/`: Contiene la lógica de detección.
- `core/`: Monitorización en tiempo real y visor de procesos.
- `database/`: Administración de SQLite.
- `network/`: Filtrado web y antiphishing.