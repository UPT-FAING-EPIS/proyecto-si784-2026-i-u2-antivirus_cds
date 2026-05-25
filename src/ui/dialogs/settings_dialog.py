from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QLabel, QComboBox,
                             QDialogButtonBox, QCheckBox, QSpinBox)

class SettingsDialog(QDialog):
    def __init__(self, config):
        super().__init__()
        self.config = config
        self.setWindowTitle("Configuración Avanzada")
        layout = QVBoxLayout()

        self.level_combo = QComboBox()
        self.level_combo.addItems(["Intenso", "Balanceado", "Cauteloso"])
        current_level = config.get("heuristic_level", "Balanceado")
        self.level_combo.setCurrentText(current_level)
        layout.addWidget(QLabel("Nivel de protección heurística:"))
        layout.addWidget(self.level_combo)

        self.sandbox_check = QCheckBox("Habilitar sandbox automático")
        self.sandbox_check.setChecked(config.get("auto_sandbox", True))
        layout.addWidget(self.sandbox_check)

        self.threshold_spin = QSpinBox()
        self.threshold_spin.setRange(1, 100)
        self.threshold_spin.setValue(int(config.get("threshold", 50)))
        layout.addWidget(QLabel("Umbral de detección (1-100):"))
        layout.addWidget(self.threshold_spin)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        self.setLayout(layout)

    def get_values(self):
        return {
            "heuristic_level": self.level_combo.currentText(),
            "auto_sandbox": self.sandbox_check.isChecked(),
            "threshold": self.threshold_spin.value()
        }