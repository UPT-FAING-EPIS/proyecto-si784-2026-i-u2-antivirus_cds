import threading
import time
import os

class RansomwareShield:
    _instance = None
    _active = False

    @classmethod
    def start(cls):
        if not cls._active:
            cls._active = True
            # Iniciar monitorización en hilo separado
            monitor_thread = threading.Thread(target=cls._monitor, daemon=True)
            monitor_thread.start()

    @classmethod
    def stop(cls):
        cls._active = False

    @classmethod
    def _monitor(cls):
        # Simulación: monitorea cambios en documentos y busca cifrado masivo
        while cls._active:
            # Aquí iría lógica de detección de patrones (ej. alta tasa de escritura en archivos personales)
            time.sleep(10)
