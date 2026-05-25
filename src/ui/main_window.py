import sys
import os
import threading
import datetime
import psutil
import string
from PyQt5.QtWidgets import (QApplication, QMainWindow, QTabWidget, QWidget,
                             QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
                             QRadioButton, QGroupBox, QTextEdit, QFileDialog,
                             QMessageBox, QListWidget, QGridLayout, QProgressBar,
                             QCheckBox, QSpinBox, QComboBox, QFrame, QSplitter,
                             QTreeWidget, QTreeWidgetItem, QHeaderView)
from PyQt5.QtCore import Qt, QTimer, pyqtSignal, QObject, pyqtSlot
from PyQt5.QtGui import QFont, QIcon, QDragEnterEvent, QDropEvent, QColor, QPalette

from src.ui.sandbox_drop_area import SandboxDropArea
from src.engine.scanner import EscanearArchivo, Verdict
from src.database.db_manager import DatabaseManager
from src.utils.get_ip import get_local_ips, get_public_ip
from src.utils.config import Config
from src.core.monitor import RealTimeMonitor
from src.core.process_viewer import ProcessViewer
from src.network.web_filter import WebFilter
from src.engine.ransomware_shield import RansomwareShield
from src.utils.sysinspector import SysInspector

# Señal personalizada para actualizar la GUI desde hilos
class ScannerSignals(QObject):
    progress = pyqtSignal(int)
    status = pyqtSignal(str)
    log = pyqtSignal(str)
    finished = pyqtSignal()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Antivirus Robusto - Protección Total")
        self.setMinimumSize(1000, 700)

        # Configurar estilo oscuro moderno
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1e1e2e;
            }
            QTabWidget::pane {
                border: 1px solid #3a3a5a;
                background-color: #252540;
                border-radius: 8px;
            }
            QTabBar::tab {
                background-color: #2a2a40;
                color: #cdd6f4;
                padding: 8px 16px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                margin-right: 2px;
            }
            QTabBar::tab:selected {
                background-color: #45475a;
                color: #ffffff;
                font-weight: bold;
            }
            QLabel {
                color: #cdd6f4;
            }
            QPushButton {
                background-color: #45475a;
                color: #cdd6f4;
                border: 1px solid #585b70;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #585b70;
            }
            QPushButton:pressed {
                background-color: #6c7086;
            }
            QProgressBar {
                border: 1px solid #585b70;
                border-radius: 5px;
                text-align: center;
                background-color: #313244;
                color: #cdd6f4;
            }
            QProgressBar::chunk {
                background-color: #89b4fa;
                border-radius: 4px;
            }
            QListWidget, QTextEdit, QTreeWidget {
                background-color: #313244;
                color: #cdd6f4;
                border: 1px solid #585b70;
                border-radius: 5px;
            }
            QComboBox, QSpinBox {
                background-color: #313244;
                color: #cdd6f4;
                border: 1px solid #585b70;
                padding: 4px;
                border-radius: 4px;
            }
            QCheckBox {
                color: #cdd6f4;
            }
            QGroupBox {
                color: #cdd6f4;
                border: 1px solid #585b70;
                border-radius: 6px;
                margin-top: 8px;
                padding-top: 12px;
                font-weight: bold;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
            }
        """)

        self.db = DatabaseManager()
        self.config = Config()
        self.signals = ScannerSignals()
        self.monitor = RealTimeMonitor(self.on_file_event)
        self.current_scan_thread = None
        self.scan_abort = False

        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)

        self.tab_home = self._create_home_tab()
        self.tab_scan = self._create_scan_tab()
        self.tab_sandbox = self._create_sandbox_tab()
        self.tab_quarantine = self._create_quarantine_tab()
        self.tab_processes = self._create_processes_tab()
        self.tab_network = self._create_network_tab()
        self.tab_ransomware = self._create_ransomware_tab()
        self.tab_settings = self._create_settings_tab()
        self.tab_updates = self._create_updates_tab()
        self.tab_diag = self._create_diag_tab()

        self.tabs.addTab(self.tab_home, "Inicio")
        self.tabs.addTab(self.tab_scan, "Escaneo")
        self.tabs.addTab(self.tab_sandbox, "Sandbox")
        self.tabs.addTab(self.tab_quarantine, "Cuarentena")
        self.tabs.addTab(self.tab_processes, "Procesos")
        self.tabs.addTab(self.tab_network, "Red")
        self.tabs.addTab(self.tab_ransomware, "Anti-Ransomware")
        self.tabs.addTab(self.tab_settings, "Configuración")
        self.tabs.addTab(self.tab_updates, "Actualización")
        self.tabs.addTab(self.tab_diag, "Diagnóstico")

        # Conectar señales
        self.signals.progress.connect(self.update_progress)
        self.signals.status.connect(self.update_status)
        self.signals.log.connect(self.append_log)
        self.signals.finished.connect(self.scan_finished)

        # Iniciar monitor si está configurado
        if self.config.get('realtime_enabled', True):
            self.monitor.start()

    # ===================== PESTAÑA INICIO =====================
    def _create_home_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        title = QLabel("Protección del Sistema")
        title.setFont(QFont("Segoe UI", 18, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        status_frame = QFrame()
        status_frame.setFrameShape(QFrame.StyledPanel)
        status_layout = QHBoxLayout()
        self.protection_status = QLabel("Monitor en tiempo real: Activo")
        self.protection_status.setStyleSheet("font-weight: bold; color: #a6e3a1;")
        status_layout.addWidget(self.protection_status)
        btn_toggle_monitor = QPushButton("Activar/Desactivar")
        btn_toggle_monitor.clicked.connect(self.toggle_monitor)
        status_layout.addWidget(btn_toggle_monitor)
        status_frame.setLayout(status_layout)
        layout.addWidget(status_frame)

        # Acciones rápidas
        actions_group = QGroupBox("Acciones rápidas")
        actions_layout = QVBoxLayout()
        btn_quick_scan = QPushButton("🔍 Exploración rápida (carpetas críticas)")
        btn_quick_scan.clicked.connect(self.start_quick_scan)
        actions_layout.addWidget(btn_quick_scan)

        btn_full_scan = QPushButton("🔎 Exploración completa del sistema")
        btn_full_scan.clicked.connect(lambda: self.start_scan("C:\\", "Completa"))
        actions_layout.addWidget(btn_full_scan)

        btn_custom_scan = QPushButton("📂 Exploración personalizada...")
        btn_custom_scan.clicked.connect(self.start_custom_scan)
        actions_layout.addWidget(btn_custom_scan)

        btn_removable_scan = QPushButton("💾 Explorar medios extraíbles")
        btn_removable_scan.clicked.connect(self.start_removable_scan)
        actions_layout.addWidget(btn_removable_scan)

        actions_group.setLayout(actions_layout)
        layout.addWidget(actions_group)

        layout.addStretch()
        w.setLayout(layout)
        return w

    # ===================== PESTAÑA ESCANEO =====================
    def _create_scan_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        header = QLabel("Progreso del escaneo")
        header.setFont(QFont("Segoe UI", 14, QFont.Bold))
        layout.addWidget(header)

        self.scan_status_label = QLabel("Listo para iniciar")
        layout.addWidget(self.scan_status_label)

        self.scan_progress = QProgressBar()
        self.scan_progress.setValue(0)
        layout.addWidget(self.scan_progress)

        self.scan_log = QTextEdit()
        self.scan_log.setReadOnly(True)
        layout.addWidget(self.scan_log)

        btn_group = QHBoxLayout()
        self.btn_abort_scan = QPushButton("Detener escaneo")
        self.btn_abort_scan.clicked.connect(self.abort_scan)
        self.btn_abort_scan.setEnabled(False)
        btn_group.addWidget(self.btn_abort_scan)
        layout.addLayout(btn_group)

        w.setLayout(layout)
        return w

    # ===================== PESTAÑA SANDBOX (mejorada) =====================
    def _create_sandbox_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.sandbox_area = SandboxDropArea()
        layout.addWidget(self.sandbox_area)
        btn_send = QPushButton("Enviar archivo(s) al Sandbox para análisis")
        btn_send.clicked.connect(self.on_send_to_sandbox)
        layout.addWidget(btn_send)
        self.sandbox_result = QLabel("Resultados del análisis aparecerán aquí")
        layout.addWidget(self.sandbox_result)
        layout.addStretch()
        w.setLayout(layout)
        return w

    # ===================== PESTAÑA CUARENTENA =====================
    def _create_quarantine_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.quarantine_list = QTreeWidget()
        self.quarantine_list.setHeaderLabels(["Archivo original", "Amenaza", "Fecha", "Ruta en cuarentena"])
        self.quarantine_list.setColumnWidth(0, 250)
        self.quarantine_list.setColumnWidth(1, 150)
        self.quarantine_list.setColumnWidth(2, 150)
        layout.addWidget(self.quarantine_list)

        btn_layout = QHBoxLayout()
        btn_refresh_quar = QPushButton("Actualizar lista")
        btn_refresh_quar.clicked.connect(self.refresh_quarantine)
        btn_restore = QPushButton("Restaurar seleccionado")
        btn_restore.clicked.connect(self.restore_from_quarantine)
        btn_delete = QPushButton("Eliminar definitivamente")
        btn_delete.clicked.connect(self.delete_from_quarantine)
        btn_layout.addWidget(btn_refresh_quar)
        btn_layout.addWidget(btn_restore)
        btn_layout.addWidget(btn_delete)
        layout.addLayout(btn_layout)

        self.refresh_quarantine()
        w.setLayout(layout)
        return w

    # ===================== PESTAÑA PROCESOS =====================
    def _create_processes_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.process_list = QTreeWidget()
        self.process_list.setHeaderLabels(["Nombre", "PID", "Ruta", "Reputación"])
        self.process_list.setColumnWidth(0, 200)
        self.process_list.setColumnWidth(1, 70)
        self.process_list.setColumnWidth(2, 400)
        btn_refresh = QPushButton("Actualizar lista de procesos")
        btn_refresh.clicked.connect(self.on_refresh_processes)
        layout.addWidget(btn_refresh)
        layout.addWidget(self.process_list)
        self.on_refresh_processes()
        w.setLayout(layout)
        return w

    # ===================== PESTAÑA RED =====================
    def _create_network_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.url_input = QTextEdit()
        self.url_input.setPlaceholderText("Ingresa una URL para verificar...")
        btn_check = QPushButton("Verificar URL")
        btn_check.clicked.connect(self.on_check_url)
        self.url_result = QLabel("")
        layout.addWidget(QLabel("Defensa Web y Antiphishing"))
        layout.addWidget(self.url_input)
        layout.addWidget(btn_check)
        layout.addWidget(self.url_result)
        layout.addStretch()
        w.setLayout(layout)
        return w

    # ===================== ANTI-RANSOMWARE =====================
    def _create_ransomware_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.ransom_status = QLabel("Protección Anti-Ransomware: Activa")
        btn_toggle = QPushButton("Activar/Desactivar")
        btn_toggle.clicked.connect(self.toggle_ransomware)
        layout.addWidget(self.ransom_status)
        layout.addWidget(btn_toggle)
        layout.addStretch()
        w.setLayout(layout)
        return w

    # ===================== CONFIGURACIÓN AVANZADA =====================
    def _create_settings_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        scroll = QWidget()
        form = QVBoxLayout()

        # Heurística
        heur_group = QGroupBox("Análisis heurístico")
        heur_layout = QGridLayout()
        heur_layout.addWidget(QLabel("Nivel:"), 0, 0)
        self.heur_level = QComboBox()
        self.heur_level.addItems(["Intenso", "Balanceado", "Cauteloso"])
        self.heur_level.setCurrentText(self.config.get('heuristic_level', 'Balanceado'))
        heur_layout.addWidget(self.heur_level, 0, 1)
        heur_layout.addWidget(QLabel("Umbral sandbox (0-100):"), 1, 0)
        self.threshold_sandbox = QSpinBox()
        self.threshold_sandbox.setRange(0, 100)
        self.threshold_sandbox.setValue(int(float(self.config.get('threshold_sandbox', 0.3)) * 100))
        heur_layout.addWidget(self.threshold_sandbox, 1, 1)
        heur_layout.addWidget(QLabel("Umbral bloqueo (0-100):"), 2, 0)
        self.threshold_block = QSpinBox()
        self.threshold_block.setRange(0, 100)
        self.threshold_block.setValue(int(float(self.config.get('threshold_block', 0.7)) * 100))
        heur_layout.addWidget(self.threshold_block, 2, 1)
        heur_group.setLayout(heur_layout)
        form.addWidget(heur_group)

        # Monitor en tiempo real
        monitor_group = QGroupBox("Monitor en tiempo real")
        monitor_layout = QVBoxLayout()
        self.realtime_check = QCheckBox("Habilitar protección en tiempo real")
        self.realtime_check.setChecked(str(self.config.get('realtime_enabled', True)).lower() == 'true')
        monitor_layout.addWidget(self.realtime_check)
        self.realtime_paths = QTextEdit()
        self.realtime_paths.setPlaceholderText("Rutas a monitorear (una por línea)\nPor defecto: C:\\Users")
        self.realtime_paths.setText("\n".join(self.config.get('monitor_paths', ['C:\\Users'])))
        monitor_layout.addWidget(self.realtime_paths)
        monitor_group.setLayout(monitor_layout)
        form.addWidget(monitor_group)

        # Exclusiones
        excl_group = QGroupBox("Exclusiones")
        excl_layout = QVBoxLayout()
        self.exclusions_edit = QTextEdit()
        self.exclusions_edit.setPlaceholderText("Carpetas o archivos a excluir (uno por línea)")
        excl_layout.addWidget(self.exclusions_edit)
        excl_group.setLayout(excl_layout)
        form.addWidget(excl_group)

        scroll.setLayout(form)
        layout.addWidget(scroll)

        btn_save = QPushButton("Guardar configuración")
        btn_save.clicked.connect(self.save_settings)
        layout.addWidget(btn_save)
        w.setLayout(layout)
        return w

    # ===================== ACTUALIZACIÓN =====================
    def _create_updates_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        lbl = QLabel("Última actualización de firmas:")
        self.lbl_update_date = QLabel(self.config.get('last_update', 'Nunca'))
        layout.addWidget(lbl)
        layout.addWidget(self.lbl_update_date)
        btn = QPushButton("Buscar actualizaciones ahora")
        btn.clicked.connect(self.update_signatures)
        layout.addWidget(btn)
        layout.addStretch()
        w.setLayout(layout)
        return w

    # ===================== DIAGNÓSTICO =====================
    def _create_diag_tab(self):
        w = QWidget()
        layout = QVBoxLayout()
        self.diag_text = QTextEdit()
        self.diag_text.setReadOnly(True)
        btn_ip = QPushButton("Obtener IPs del sistema")
        btn_ip.clicked.connect(self.show_ip_info)
        btn_sys = QPushButton("Generar SysInspector snapshot")
        btn_sys.clicked.connect(self.show_sysinspector)
        layout.addWidget(btn_ip)
        layout.addWidget(btn_sys)
        layout.addWidget(self.diag_text)
        w.setLayout(layout)
        return w

    # ===================== MÉTODOS DE ESCANEO =====================
    def start_scan(self, path, scan_type):
        if self.current_scan_thread and self.current_scan_thread.is_alive():
            QMessageBox.warning(self, "Escaneo en curso", "Ya hay un escaneo en ejecución.")
            return
        self.scan_abort = False
        self.scan_log.clear()
        self.scan_progress.setValue(0)
        self.btn_abort_scan.setEnabled(True)
        self.signals.status.emit(f"Iniciando exploración {scan_type}...")
        self.current_scan_thread = threading.Thread(target=self._scan_path, args=(path,), daemon=True)
        self.current_scan_thread.start()

    def start_quick_scan(self):
        # Ubicaciones críticas: carpeta de usuario, archivos temporales, registry (simulado)
        paths = [os.path.expanduser("~"), os.environ.get("TEMP", "C:\\Windows\\Temp")]
        self.start_scan(";".join(paths), "Rápida")

    def start_custom_scan(self):
        folder = QFileDialog.getExistingDirectory(self, "Seleccionar carpeta")
        if folder:
            self.start_scan(folder, "Personalizada")

    def start_removable_scan(self):
        # Detectar unidades extraíbles
        drives = []
        for part in psutil.disk_partitions():
            if 'removable' in part.opts.lower() or 'cdrom' in part.opts.lower():
                drives.append(part.device)
        if not drives:
            QMessageBox.information(self, "Medios extraíbles", "No se encontraron unidades extraíbles.")
            return
        self.start_scan(";".join(drives), "Medios extraíbles")

    def _scan_path(self, path_str):
        paths = path_str.split(";")
        total_files = 0
        scanned = 0
        # Contar archivos primero para la barra de progreso
        for p in paths:
            for root, dirs, files in os.walk(p):
                total_files += len(files)
        if total_files == 0:
            self.signals.finished.emit()
            return
        self.signals.progress.emit(0)
        for p in paths:
            for root, dirs, files in os.walk(p):
                if self.scan_abort:
                    self.signals.status.emit("Escaneo abortado.")
                    self.signals.finished.emit()
                    return
                for file in files:
                    full = os.path.join(root, file)
                    try:
                        res = EscanearArchivo(full, self.config.get_settings())
                        if res.verdict == Verdict.MALICIOUS:
                            self.signals.log.emit(f"[MALICIOSO] {full} - {res.threat_name}")
                        elif res.verdict == Verdict.SUSPICIOUS:
                            self.signals.log.emit(f"[SOSPECHOSO] {full} - {res.details}")
                    except Exception as e:
                        pass
                    scanned += 1
                    percent = int(scanned * 100 / total_files)
                    self.signals.progress.emit(percent)
                    self.signals.status.emit(f"Escaneando: {full} ({scanned}/{total_files})")
        self.signals.finished.emit()

    def abort_scan(self):
        self.scan_abort = True
        self.signals.status.emit("Abortando escaneo...")

    @pyqtSlot(int)
    def update_progress(self, value):
        self.scan_progress.setValue(value)

    @pyqtSlot(str)
    def update_status(self, text):
        self.scan_status_label.setText(text)

    @pyqtSlot(str)
    def append_log(self, text):
        self.scan_log.append(text)

    @pyqtSlot()
    def scan_finished(self):
        self.btn_abort_scan.setEnabled(False)
        if not self.scan_abort:
            self.signals.status.emit("Escaneo completado.")
            self.signals.log.emit("--- Escaneo finalizado ---")
        self.current_scan_thread = None

    # ===================== MÉTODOS DE CUARENTENA =====================
    def refresh_quarantine(self):
        self.quarantine_list.clear()
        items = self.db.get_quarantine_items()
        for item in items:
            tree_item = QTreeWidgetItem([
                item['original_path'],
                item['threat_name'],
                item['quarantine_date'],
                item['quarantined_path']
            ])
            self.quarantine_list.addTopLevelItem(tree_item)

    def restore_from_quarantine(self):
        selected = self.quarantine_list.currentItem()
        if not selected:
            QMessageBox.warning(self, "Cuarentena", "Selecciona un archivo.")
            return
        orig = selected.text(0)
        quar_path = selected.text(3)
        try:
            self.db.restore_from_quarantine(quar_path, orig)
            self.refresh_quarantine()
            QMessageBox.information(self, "Cuarentena", "Archivo restaurado a su ubicación original.")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"No se pudo restaurar: {e}")

    def delete_from_quarantine(self):
        selected = self.quarantine_list.currentItem()
        if not selected:
            return
        quar_path = selected.text(3)
        if QMessageBox.question(self, "Eliminar", "¿Eliminar definitivamente este archivo?", 
                               QMessageBox.Yes | QMessageBox.No) == QMessageBox.Yes:
            try:
                self.db.delete_from_quarantine(quar_path)
                self.refresh_quarantine()
            except Exception as e:
                QMessageBox.critical(self, "Error", str(e))

    # ===================== OTROS MÉTODOS =====================
    def on_send_to_sandbox(self):
        files = self.sandbox_area.files
        if not files:
            QMessageBox.warning(self, "Sandbox", "Arrastra archivos primero.")
            return
        from src.engine.sandbox_manager import SandboxManager
        sandbox = SandboxManager(self.config.get('sandbox_path', 'data/sandbox'))
        results = []
        for f in files:
            verdict, log = sandbox.run_and_monitor(f)
            results.append(f"{os.path.basename(f)}: {verdict.name} - {log[:100]}")
        self.sandbox_result.setText("\n".join(results))

    def on_refresh_processes(self):
        viewer = ProcessViewer()
        processes = viewer.get_processes_with_reputation()
        self.process_list.clear()
        for p in processes:
            item = QTreeWidgetItem([p['name'], str(p['pid']), p.get('exe', ''), p['reputation']])
            self.process_list.addTopLevelItem(item)

    def on_check_url(self):
        url = self.url_input.toPlainText().strip()
        if url:
            wf = WebFilter()
            safe = wf.check_url(url)
            self.url_result.setText("✔ URL segura" if safe else "✖ URL bloqueada (phishing/malware)")
            self.url_result.setStyleSheet("color: #a6e3a1;" if safe else "color: #f38ba8; font-weight: bold;")

    def toggle_monitor(self):
        if self.monitor._started:
            self.monitor.stop()
            self.protection_status.setText("Monitor en tiempo real: Inactivo")
            self.protection_status.setStyleSheet("color: #f38ba8; font-weight: bold;")
        else:
            self.monitor.start()
            self.protection_status.setText("Monitor en tiempo real: Activo")
            self.protection_status.setStyleSheet("color: #a6e3a1; font-weight: bold;")

    def toggle_ransomware(self):
        # Alternar
        if RansomwareShield._active:
            RansomwareShield.stop()
            self.ransom_status.setText("Protección Anti-Ransomware: Inactiva")
        else:
            RansomwareShield.start()
            self.ransom_status.setText("Protección Anti-Ransomware: Activa")

    def save_settings(self):
        settings = {
            'heuristic_level': self.heur_level.currentText(),
            'threshold_sandbox': self.threshold_sandbox.value() / 100.0,
            'threshold_block': self.threshold_block.value() / 100.0,
            'realtime_enabled': self.realtime_check.isChecked(),
            'monitor_paths': [p.strip() for p in self.realtime_paths.toPlainText().splitlines() if p.strip()],
            'exclusions': [e.strip() for e in self.exclusions_edit.toPlainText().splitlines() if e.strip()]
        }
        self.config.save(settings)
        # Aplicar cambios al monitor
        if settings['realtime_enabled']:
            self.monitor.paths = settings['monitor_paths']
            if not self.monitor._started:
                self.monitor.start()
        else:
            self.monitor.stop()
        QMessageBox.information(self, "Configuración", "Configuración guardada correctamente.")

    def update_signatures(self):
        now = datetime.datetime.now().strftime("%d-%m-%Y %H:%M")
        self.config.set_last_update(now)
        self.lbl_update_date.setText(now)
        QMessageBox.information(self, "Actualización", "Firmas actualizadas (simulado).")

    def show_ip_info(self):
        local = get_local_ips()
        public = get_public_ip()
        report = "=== IPs Locales ===\n" + "\n".join(local) + "\n"
        report += f"IP Pública: {public}\n"
        self.diag_text.setText(report)

    def show_sysinspector(self):
        inspector = SysInspector()
        self.diag_text.setText(inspector.generate_snapshot())

    def on_file_event(self, event_path):
        # Callback del monitor en tiempo real
        res = EscanearArchivo(event_path, self.config.get_settings())
        self.db.log_event("realtime", f"Monitor: {event_path}", event_path, res.verdict.name)
        if res.verdict == Verdict.MALICIOUS:
            self.db.move_to_quarantine(event_path, res.threat_name, res.details)