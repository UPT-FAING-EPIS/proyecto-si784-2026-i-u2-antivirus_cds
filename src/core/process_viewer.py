import psutil
from src.database.db_manager import DatabaseManager

class ProcessViewer:
    def get_processes_with_reputation(self):
        db = DatabaseManager()
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'exe']):
            try:
                exe = proc.info['exe']
                if exe:
                    rep = db.get_process_reputation(exe)
                else:
                    rep = "unknown"
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'reputation': rep
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return processes