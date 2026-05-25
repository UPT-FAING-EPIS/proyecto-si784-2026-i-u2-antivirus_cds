import platform
import psutil
import os

class SysInspector:
    def generate_snapshot(self):
        report = []
        report.append("=== Información del Sistema ===")
        report.append(f"Sistema: {platform.system()} {platform.version()}")
        report.append(f"Procesador: {platform.processor()}")
        report.append("=== Servicios ===")
        # En Windows listar servicios con psutil o sc
        for service in psutil.win_service_iter() if hasattr(psutil, 'win_service_iter') else []:
            try:
                report.append(f"{service.name()} - {service.status()}")
            except:
                pass
        report.append("=== Procesos ===")
        for proc in psutil.process_iter(['pid', 'name']):
            report.append(f"{proc.info['pid']} {proc.info['name']}")
        report.append("=== Claves de Registro (simulado) ===")
        return "\n".join(report)
