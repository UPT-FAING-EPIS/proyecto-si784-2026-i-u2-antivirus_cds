import sqlite3
import os
import datetime
import hashlib
import shutil

class DatabaseManager:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.db_path = os.path.join("data", "db", "av_database.sqlite")
            os.makedirs(os.path.dirname(cls._instance.db_path), exist_ok=True)
            cls._instance.conn = sqlite3.connect(cls._instance.db_path, check_same_thread=False)
            cls._instance.conn.row_factory = sqlite3.Row
        return cls._instance

    def initialize_database(self):
        cursor = self.conn.cursor()
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS quarantine (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_path TEXT NOT NULL,
            quarantined_path TEXT NOT NULL,
            threat_name TEXT,
            file_hash TEXT NOT NULL,
            quarantine_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reason TEXT,
            is_encrypted INTEGER DEFAULT 1,
            status TEXT DEFAULT 'active'
        );
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            event_type TEXT NOT NULL,
            description TEXT,
            file_path TEXT,
            file_hash TEXT,
            process_name TEXT,
            action_taken TEXT,
            details TEXT
        );
        CREATE TABLE IF NOT EXISTS whitelist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_hash TEXT NOT NULL UNIQUE,
            file_path TEXT,
            reason TEXT,
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS blacklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_hash TEXT NOT NULL UNIQUE,
            threat_name TEXT NOT NULL,
            severity TEXT DEFAULT 'high',
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS reputed_processes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_name TEXT,
            executable_path TEXT,
            file_hash TEXT NOT NULL UNIQUE,
            reputation_score REAL,
            reputation_level TEXT,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            cloud_response TEXT
        );
        CREATE TABLE IF NOT EXISTS signature_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            update_version INTEGER NOT NULL,
            update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            status TEXT DEFAULT 'success'
        );
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """)
        self.conn.commit()

    def is_whitelisted(self, file_hash):
        cur = self.conn.execute("SELECT 1 FROM whitelist WHERE file_hash=?", (file_hash,))
        return cur.fetchone() is not None

    def is_blacklisted(self, file_hash):
        cur = self.conn.execute("SELECT 1 FROM blacklist WHERE file_hash=?", (file_hash,))
        return cur.fetchone() is not None

    def get_threat_name(self, file_hash):
        cur = self.conn.execute("SELECT threat_name FROM blacklist WHERE file_hash=?", (file_hash,))
        row = cur.fetchone()
        return row['threat_name'] if row else "Unknown"

    def move_to_quarantine(self, original_path, threat_name, reason):
        import shutil
        import hashlib
        quarantine_dir = os.path.join(os.path.dirname(self.db_path), "quarantine")
        os.makedirs(quarantine_dir, exist_ok=True)
        file_hash = hashlib.sha256(open(original_path, 'rb').read()).hexdigest()
        quarantined = os.path.join(quarantine_dir, file_hash)
        shutil.move(original_path, quarantined)
        self.conn.execute("INSERT INTO quarantine (original_path, quarantined_path, threat_name, file_hash, reason) VALUES (?,?,?,?,?)",
                          (original_path, quarantined, threat_name, file_hash, reason))
        self.conn.commit()

    def log_event(self, event_type, description, file_path="", action="", details=""):
        self.conn.execute("INSERT INTO logs (event_type, description, file_path, action_taken, details) VALUES (?,?,?,?,?)",
                          (event_type, description, file_path, action, details))
        self.conn.commit()

    def get_process_reputation(self, exe_path):
        if not os.path.exists(exe_path):
            return "unknown"
        file_hash = hashlib.sha256(open(exe_path, 'rb').read()).hexdigest()
        cur = self.conn.execute("SELECT reputation_level FROM reputed_processes WHERE file_hash=?", (file_hash,))
        row = cur.fetchone()
        return row['reputation_level'] if row else "unknown"
    def get_quarantine_items(self):
        cur = self.conn.execute("SELECT * FROM quarantine WHERE status='active' ORDER BY quarantine_date DESC")
        return [dict(row) for row in cur.fetchall()]

    def restore_from_quarantine(self, quarantined_path, original_path):
        import shutil
        shutil.move(quarantined_path, original_path)
        self.conn.execute("UPDATE quarantine SET status='restored' WHERE quarantined_path=?", (quarantined_path,))
        self.conn.commit()

    def delete_from_quarantine(self, quarantined_path):
        if os.path.exists(quarantined_path):
            os.remove(quarantined_path)
        self.conn.execute("DELETE FROM quarantine WHERE quarantined_path=?", (quarantined_path,))
        self.conn.commit()
