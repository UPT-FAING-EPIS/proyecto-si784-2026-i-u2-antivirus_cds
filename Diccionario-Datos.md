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

Diccionario de Datos

Versión *1.0*

| CONTROL DE VERSIONES | | | | |
|:---:|:---|:---|:---|:---|
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | LLica Mamani, Jimmy Mijair | Sierra Ruiz, Iker Alberto | LLica Mamani, Jimmy Mijair | 02/06/2026 | Versión Extendida |

<div style="page-break-after: always; visibility: hidden"></div>

# Diccionario de Datos: Base `rustguard.db` (SQLite)

La persistencia de RustGuard opera sobre SQLite (`better-sqlite3`). A continuación se describe la estructura física de sus tablas.

## 1. Tabla: `scan_history`
Almacena el historial y auditoría de todos los escaneos ejecutados (iniciados, cancelados o finalizados) dentro de la aplicación.

| Campo | Tipo SQL | Llave | Nulo | Descripción |
|:------|:---------|:------|:-----|:------------|
| `id` | INTEGER | PK | NO | Identificador único y autoincremental de cada sesión de escaneo. |
| `scan_type` | TEXT | | NO | Tipo de escaneo. Valores permitidos: `quick`, `full`, `custom`, `background`. |
| `started_at` | DATETIME | | NO | Fecha y hora en la que se inició el escaneo (Formato `YYYY-MM-DD HH:MM:SS` Local Time). |
| `finished_at` | DATETIME | | SI | Fecha y hora en la que el escaneo concluyó de manera exitosa o falló. |
| `files_scanned` | INTEGER | | NO | Cantidad total de archivos leídos y procesados en la sesión. (Default 0). |
| `threats_found` | INTEGER | | NO | Cantidad total de malware o amenazas identificadas. (Default 0). |
| `log_file` | TEXT | | SI | Ruta absoluta del archivo de registro (.txt) donde ClamAV volcó el detalle completo. |
| `status` | TEXT | | NO | Estado del escaneo. Valores permitidos: `running`, `done`, `error`. |

## 2. Tabla: `quarantine`
Mantiene un registro de la correspondencia lógica entre el archivo original malicioso y el archivo físico encriptado o asilado en la bóveda de cuarentena del antivirus.

| Campo | Tipo SQL | Llave | Nulo | Descripción |
|:------|:---------|:------|:-----|:------------|
| `id` | INTEGER | PK | NO | Identificador único y autoincremental del archivo aislado. |
| `original_path` | TEXT | | NO | Ruta original completa donde se ubicaba el malware (ej. `C:\Users\Admin\Downloads\virus.exe`). |
| `quarantine_path` | TEXT | | NO | Ruta dentro del baúl de cuarentena oculto (ej. `.rustguard_quarantine\e3b0c442...`). |
| `threat_name` | TEXT | | NO | Firma específica del virus identificada por ClamAV (ej. `Win.Trojan.Generic`). |
| `quarantined_at`| DATETIME | | NO | Marca de tiempo exacta en que el archivo fue aislado del sistema de ficheros del usuario. |
| `restored` | BOOLEAN | | NO | Bandera que indica si el usuario restauró este fichero. `0` = No restaurado, `1` = Restaurado a su lugar. |
| `scan_id` | INTEGER | FK | SI | Llave foránea hacia `scan_history.id`. Indica qué escaneo encontró esta amenaza. |
