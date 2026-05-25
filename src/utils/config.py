import json
import os
from src.database.db_manager import DatabaseManager

class Config:
    _defaults = {
        "heuristic_level": "Balanceado",
        "auto_sandbox": True,
        "threshold": 50,
        "threshold_sandbox": 0.3,
        "threshold_block": 0.7,
        "sandbox_path": "data/sandbox",
        "last_update": "Nunca"
    }

    def __init__(self):
        self.db = DatabaseManager()
        # Asegurar que existe la tabla settings
        self.db.initialize_database()
        self._load_from_db()

    def _load_from_db(self):
        cur = self.db.conn.execute("SELECT key, value FROM settings")
        self.settings = {}
        for row in cur:
            self.settings[row['key']] = row['value']
        # Aplicar defaults para claves faltantes
        for k, v in self._defaults.items():
            if k not in self.settings:
                self.settings[k] = v

    def get(self, key, default=None):
        val = self.settings.get(key, default)
        if isinstance(val, str):
            # Intentar convertir a número
            try:
                if '.' in val:
                    val = float(val)
                else:
                    val = int(val)
            except ValueError:
                pass
        return val

    def get_settings(self):
        return self.settings

    def set_last_update(self, date_str):
        self.settings['last_update'] = date_str
        self.save(self.settings)

    def get_last_update(self):
        return self.settings.get('last_update', 'Nunca')

    def save(self, values):
        for k, v in values.items():
            self.settings[k] = v
            self.db.conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)", (k, str(v)))
        self.db.conn.commit()