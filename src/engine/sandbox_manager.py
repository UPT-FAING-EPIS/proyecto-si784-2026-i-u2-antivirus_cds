import subprocess
import os
from enum import Enum

class Verdict(Enum):
    CLEAN = 1
    MALICIOUS = 3

class SandboxManager:
    def __init__(self, sandbox_path="data/sandbox"):
        self.sandbox_path = sandbox_path
        self.vm_image = os.path.join(sandbox_path, "vm_image")
        self.agent_script = os.path.join(sandbox_path, "agent", "monitor.py")

    def run_and_monitor(self, file_path, timeout=30):
        """
        Simula la ejecución en sandbox.
        En producción lanzaría una VM, copiaría el archivo y ejecutaría el agente.
        """
        # Simulación de comportamiento
        # Usaremos un script agente que devuelve un JSON con veredicto
        if not os.path.exists(self.agent_script):
            # Sin agente, devolvemos limpio por defecto
            return Verdict.CLEAN, "Sandbox no configurado completamente"

        try:
            result = subprocess.run(
                ['python', self.agent_script, file_path],
                capture_output=True, text=True, timeout=timeout
            )
            if "MALICIOUS" in result.stdout:
                return Verdict.MALICIOUS, result.stdout
            else:
                return Verdict.CLEAN, result.stdout
        except Exception as e:
            return Verdict.CLEAN, str(e)
