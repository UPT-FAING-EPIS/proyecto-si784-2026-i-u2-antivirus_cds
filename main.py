import sys
import os
from src.ui.main_window import MainWindow
from src.database.db_manager import DatabaseManager
from src.utils.logger import setup_logger
from src.utils.config import Config

def main():
    setup_logger()
    db = DatabaseManager()
    db.initialize_database()
    from PyQt5.QtWidgets import QApplication
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()