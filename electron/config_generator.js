import fs from 'fs';
import path from 'path';
import { CLAMD_CONF_PATH, FRESHCLAM_CONF_PATH, CLAMAV_DB_DIR } from './paths.js';

export function generateClamAVConfigs() {
  const clamdConfContent = `# clamd.conf for RustGuard (Auto-generated)
TCPSocket 3310
TCPAddr 127.0.0.1

# Directorio de Base de Datos (Absoluto a userData)
DatabaseDirectory "${CLAMAV_DB_DIR.replace(/\\/g, '/')}"

# Límites de Escaneo
MaxDirectoryRecursion 20
MaxRecursion 15
MaxFiles 10000
MaxFileSize 500M
MaxScanSize 500M

# Opciones de Archivos Comprimidos
ScanArchive yes
MaxEmbeddedPE 40M
MaxHTMLNormalize 10M
MaxHTMLNoTags 2M
MaxScriptNormalize 5M

# Opciones Generales
ScanPE yes
ScanELF yes
ScanOLE2 yes
ScanPDF yes
ScanSWF yes
ScanXMLDOCS yes
ScanHWP3 yes
`;

  const freshclamConfContent = `# freshclam.conf for RustGuard (Auto-generated)

DatabaseDirectory "${CLAMAV_DB_DIR.replace(/\\/g, '/')}"
DatabaseMirror database.clamav.net
ScriptedUpdates yes
CompressLocalDatabase no
Checks 24
TestDatabases yes
Bytecode yes
`;

  fs.writeFileSync(CLAMD_CONF_PATH, clamdConfContent, 'utf8');
  fs.writeFileSync(FRESHCLAM_CONF_PATH, freshclamConfContent, 'utf8');
}
