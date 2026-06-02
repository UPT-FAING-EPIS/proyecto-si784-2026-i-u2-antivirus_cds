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

Informe de Factibilidad

Versión *1.0*

| CONTROL DE VERSIONES | | | | |
|:---:|:---|:---|:---|:---|
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | LLica Mamani, Jimmy Mijair | Sierra Ruiz, Iker Alberto | LLica Mamani, Jimmy Mijair | 02/06/2026 | Versión Extendida |

<div style="page-break-after: always; visibility: hidden"></div>

# **INDICE GENERAL**

[1. Descripción del Proyecto](#1-descripción-del-proyecto)

[2. Riesgos y Mitigación](#2-riesgos-y-mitigación)

[3. Análisis de la Situación actual](#3-análisis-de-la-situación-actual)

[4. Estudio de Factibilidad](#4-estudio-de-factibilidad)

&nbsp;&nbsp;[4.1 Factibilidad Técnica](#41-factibilidad-técnica)

&nbsp;&nbsp;[4.2 Factibilidad económica](#42-factibilidad-económica)

&nbsp;&nbsp;[4.3 Factibilidad Operativa](#43-factibilidad-operativa)

&nbsp;&nbsp;[4.4 Factibilidad Legal](#44-factibilidad-legal)

&nbsp;&nbsp;[4.5 Factibilidad Social](#45-factibilidad-social)

&nbsp;&nbsp;[4.6 Factibilidad Ambiental](#46-factibilidad-ambiental)

[5. Análisis Financiero](#5-análisis-financiero)

&nbsp;&nbsp;[5.1 Justificación de la Inversión](#51-justificación-de-la-inversión)

&nbsp;&nbsp;&nbsp;&nbsp;[5.1.1 Beneficios Tangibles e Intangibles](#511-beneficios-tangibles-e-intangibles)

&nbsp;&nbsp;&nbsp;&nbsp;[5.1.2 Criterios y Métricas de Inversión](#512-criterios-y-métricas-de-inversión)

&nbsp;&nbsp;&nbsp;&nbsp;[5.1.3 Análisis Económico en la Nube e Infraestructura (Terraform)](#513-análisis-económico-en-la-nube-e-infraestructura-terraform)

[6. Conclusiones](#6-conclusiones)

<div style="page-break-after: always; visibility: hidden"></div>

**<u>Informe de Factibilidad</u>**

## 1. Descripción del Proyecto

### 1.1. Nombre del proyecto

RustGuard Antivirus

### 1.2. Duración del proyecto

El proyecto tendrá una duración estimada de 16 semanas, distribuidas en 5 fases de ingeniería y desarrollo conforme al cronograma metodológico del curso. Estas fases abarcan el diseño de arquitectura, programación del core con Node.js, elaboración del frontend en React y el empaquetado final del ejecutable mediante Electron Builder.

### 1.3. Descripción

El proyecto RustGuard Antivirus consiste en el desarrollo de una solución de ciberseguridad híbrida de escritorio orientada al consumidor final. Construido con una base sólida que acopla tecnologías web ultra-rápidas (React, Vite, Tailwind CSS) y un motor interno backend mediante Electron (Node.js). Este producto en su núcleo envuelve e invoca rutinas del robusto motor de código abierto **ClamAV**. A través de esta arquitectura se busca entregar un escaneo profundo basado en firmas de malware, escaneo en tiempo real vigilando los cambios del disco y gestión integral de amenazas puestas en cuarentena, todo centralizado en una base de datos local SQLite (better-sqlite3) rápida y transaccional.

### 1.4. Objetivos

#### 1.4.1 Objetivo general

Desarrollar y entregar un software antivirus ligero, eficiente y sin dependencia estricta a Internet que permita a los usuarios detectar, gestionar y aislar amenazas informáticas mediante un motor de firmas (ClamAV) y monitoreo de procesos, demostrando la aplicación de metodologías de calidad de software y pruebas unitarias/dinámicas.

#### 1.4.2 Objetivos Específicos

- **Módulo de Escaneo:** Implementar algoritmos de invocación optimizada de `clamscan` para proveer modalidades de "Escaneo Rápido", "Escaneo Completo" y "Escaneo Personalizado por Carpetas".
- **Interfaz de Usuario (UX/UI):** Diseñar y codificar una interfaz "frameless" atractiva, soportando modo oscuro/claro y métricas interactivas en tiempo real para hacer intuitiva la detección de amenazas.
- **Trazabilidad y Persistencia:** Integrar SQLite local (`better-sqlite3`) para registrar fielmente cada ejecución de escaneo (historial), fechas, resultados, y las firmas identificadas en los archivos enviados a cuarentena.
- **Protección Activa:** Implementar un servicio residente en memoria usando `chokidar` en Node.js que escuche las adiciones de archivos a rutas vulnerables (Descargas, Documentos) para escaneos silenciosos en background.

<div style="page-break-after: always; visibility: hidden"></div>

## 2. Riesgos y Mitigación

La gestión de riesgos es vital en un software de seguridad. A continuación, se identifican las amenazas al proyecto y cómo RustGuard aborda cada riesgo:

| Código | Riesgo Identificado | Impacto | Probabilidad | Estrategia de Mitigación y Contingencia |
|:------:|:--------------------|:-------:|:------------:|:----------------------------------------|
| R-01 | Falsos positivos por firmas heurísticas de ClamAV aislando archivos de uso legítimo del usuario. | Crítico | Media | Implementación obligatoria de una pestaña "Cuarentena" donde todo archivo se aísle encriptado temporalmente, permitiendo una restauración de ruta en 1 clic. |
| R-02 | Consumo excesivo de memoria RAM (Overhead de Electron + Chromium) ralentizando la PC. | Alto | Alta | Optimizar el proceso renderizador en React para evitar re-renders. Limitar el número de hilos simultáneos asignados al motor ClamAV. |
| R-03 | Denegación de permisos `EACCES` de Node.js al intentar aislar/eliminar un virus que está en uso o alojado en "System32". | Alto | Media | Capturar todas las excepciones de `fs.rename`. Notificar al usuario mediante un modal si requiere iniciar RustGuard como Administrador / root. |
| R-04 | Desactualización de firmas si el comando `freshclam` falla por interrupción de conexión a Internet. | Medio | Baja | Registrar la fecha de la última actualización en base de datos. Informar mediante UI al usuario que su base de datos tiene días de antigüedad mediante advertencias visuales. |

<div style="page-break-after: always; visibility: hidden"></div>

## 3. Análisis de la Situación actual

Actualmente, las pymes y usuarios domésticos cuentan con Windows Defender de manera predeterminada. Sin embargo, en escenarios donde se necesita una segunda opinión técnica, escaneos paralelos o entornos donde se usan sistemas Linux (donde la oferta es limitada), los usuarios optan por suites costosas bajo modelo de suscripción anual que terminan consumiendo severos recursos del sistema debido a sus servicios en la nube intrusivos. 
RustGuard surge en un mercado donde la necesidad de privacidad local es alta. RustGuard no sube archivos confidenciales a servidores para analizarlos; todo el análisis de ClamAV se realiza enteramente en el procesador del usuario, garantizando que el usuario mantiene posesión del 100% de sus datos personales.

<div style="page-break-after: always; visibility: hidden"></div>

## 4. Estudio de Factibilidad

### 4.1. Factibilidad Técnica

Desde la perspectiva técnica, el equipo cuenta con total solvencia sobre las tecnologías aplicadas:
- **Core Desktop:** Electron provee los bindings nativos C++ necesarios hacia el sistema operativo para manipulación de procesos e interceptación de eventos I/O.
- **Frontend UI:** Vite en combinación con React es altamente escalable y compila a un bundle estático ultra rápido para su embebido.
- **Base de Datos Local:** `better-sqlite3` es sincrónico y posee altísimo rendimiento (cientos de consultas/ms) idóneo para logging de miles de archivos escaneados.
- **Monitoreo Continuo:** La librería `chokidar` (Node.js) resuelve los problemas nativos de `fs.watch` cross-platform, logrando estabilidad de monitoreo sin fugas de memoria.
- **Core de Seguridad:** ClamAV es un estándar industrial; no requiere licencias y provee bases actualizadas por CISCO. **Veredicto: Totalmente factible.**

### 4.2. Factibilidad Económica

La construcción del software requiere recursos de desarrollo pero **no tiene costos por licenciamiento**. Si simulamos los costos de 16 semanas:
- **Costos de Desarrollo:** S/. 6,000.00 (Mano de obra estudiantil).
- **Herramientas de Desarrollo:** S/. 0.00 (Visual Studio Code, Github, npm son gratis).
- **Costos Administrativos Operativos:** S/. 400.00 (Energía, Internet).
**Conclusión Económica:** El costo de S/. 6,400.00 es una inversión en horas de trabajo justificable dado que es un proyecto Open Source académico libre de rentas futuras.

### 4.3. Factibilidad Operativa
RustGuard Antivirus puede ser instalado por cualquier usuario sin experiencia técnica mediante un instalador `.exe` estándar provisto por `electron-builder`. Su interfaz limpia descarta complejidades al brindar resúmenes amigables. El sistema mantendrá viabilidad operativa en el largo plazo siempre que los repositorios de ClamAV sigan activos.

### 4.4. Factibilidad Legal
El proyecto cumple la Ley de Protección de Datos Personales (Ley N° 29733) peruana y GDPR internacional. **Cero recolección oculta**. Todas las dependencias (React, Vite, Electron) usan licenciamiento MIT y BSD permitiendo distribución. ClamAV utiliza GPL, lo que se debe respetar proporcionando mención y código en el repositorio GitHub.

### 4.5. Factibilidad Social
A nivel de proyección social, este software promueve la alfabetización en seguridad informática en sectores educativos y familiares sin imponerles tarifas ocultas, reduciendo la brecha tecnológica y protegiéndolos contra ransomware.

### 4.6. Factibilidad Ambiental
Se enfoca en un escaneo programable (Background) lo que impide que la CPU opere al 100% todo el día y se sobrecaliente, ayudando marginalmente a ahorrar el uso energético y extendiendo la vida del silicio.

<div style="page-break-after: always; visibility: hidden"></div>

## 5. Análisis Financiero

### 5.1 Justificación de la Inversión
A nivel universitario, la inversión es de tiempo, esfuerzo e investigación; el proyecto certifica el dominio en control de calidad, asegurando competitividad profesional. A nivel comercial, RustGuard abre un mercado freemium de ciberseguridad.

#### 5.1.1 Beneficios Tangibles e Intangibles
**Tangibles:**
- Reducción neta de costos para micro-empresas que instalarían RustGuard (Ahorro de $40 a $60 USD anuales por PC).
- Eliminación de tiempos de downtime provocados por PC infectadas, que suelen generar costos en reparación de S/. 150 por incidente.

**Intangibles:**
- Privacidad absoluta; confianza del usuario.
- Aportación y buena reputación técnica en la comunidad open-source.

#### 5.1.2 Criterios y Métricas de Inversión
Asumiendo un mercado ficticio interno donde RustGuard se instala en 100 estaciones de laboratorios en la universidad, ahorrando licenciamiento:
- **Flujo de Beneficios Anuales:** Ahorro total = 100 x 150 = S/. 15,000 al año.
- **Costo (1° año):** S/. 6,400 (Desarrollo). Costo (Año 2 y 3): S/. 1,000 (Mantenimiento iterativo).
- Al calcular el VAN (Valor Actual Neto) con una tasa de descuento del 10%, el proyecto genera un valor económico positivo considerablemente más alto que los costos operativos de mantenimiento de software.

#### 5.1.3 Análisis Económico en la Nube e Infraestructura (Terraform)
En versiones futuras (v2.0), RustGuard podría requerir proveer sus propias firmas a través de analistas o recolectar métricas operativas centralizadas (telemetría opcional) para crear un mapa global de amenazas. A continuación se proyecta la factibilidad de esta arquitectura empleando Amazon Web Services y Terraform:

**Estructura HCL (Terraform) para Despliegue en AWS:**

```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project = "RustGuard"
      Environment = "Production"
    }
  }
}

# -------------------------------------------------------------
# 1. Bucket S3 para alojar instaladores (.exe, .dmg) y Firmas Custom
# -------------------------------------------------------------
resource "aws_s3_bucket" "rustguard_assets" {
  bucket = "rustguard-assets-prod"
}

# Configuración de políticas de acceso público de lectura 
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.rustguard_assets.id
  block_public_acls       = false
  block_public_policy     = false
}

# -------------------------------------------------------------
# 2. Base de datos RDS PostgreSQL (Telemetría de amenazas)
# -------------------------------------------------------------
resource "aws_db_instance" "rustguard_telemetry" {
  identifier           = "rustguard-telemetry-db"
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  db_name              = "rustguard_telemetry"
  username             = "admin"
  password             = var.db_password # Variable Inyectada segura
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# -------------------------------------------------------------
# 3. AWS Lambda Serverless para Endpoint de Recepción de Logs
# -------------------------------------------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "rustguard_lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_lambda_function" "api_endpoint" {
  function_name = "rustguard_receive_telemetry"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs18.x"
  handler       = "index.handler"
  filename      = "backend_lambda.zip"
}
```

**Desglose y Resumen de Costos Nube (Cálculo AWS):**
- **Amazon S3 (Almacenamiento y Transferencia):** Estimado $2.50 USD/mes por la descarga del ejecutable de instaladores.
- **Amazon RDS (db.t3.micro instanciada):** Aprox $14.50 USD/mes para mantener la base de datos de telemetría activa.
- **AWS Lambda & API Gateway (Millón de peticiones):** ~$1.20 USD/mes operando bajo demanda.
- **Total Mensual Estimado:** ~$18.20 USD.
**Factibilidad de Infraestructura:** El bajo costo de ~$18/mes ratifica que se puede sostener el backend en producción indefinidamente con una pequeña campaña de donaciones Patreon de la comunidad RustGuard.

<div style="page-break-after: always; visibility: hidden"></div>

## 6. Conclusiones
Luego de una revisión integral de las diferentes esferas del proyecto, **RustGuard Antivirus es viable, sustentable y altamente factible.**

- **Técnicamente**, el stack Vite/React + Electron/Node y SQLite es el estado del arte para construir aplicaciones de escritorio de alto rendimiento de manera cruzada (Windows/Linux/Mac).
- **Operativamente**, reduce el dolor que tienen los usuarios regulares con los falsos positivos e interfaces lentas, proveyendo un esquema UI "frameless" robusto.
- **Económicamente**, al ser 100% de código abierto bajo infraestructura local, el costo operativo es cero para el usuario. Incluso en el peor escenario donde requiera métricas en la nube, la solución propuesta en AWS Terraform confirma que los costos son despreciables frente a los beneficios a la ciberseguridad que otorga al sector.
Se recomienda aprobar el inicio ininterrumpido de las fases de desarrollo (Sprints).
