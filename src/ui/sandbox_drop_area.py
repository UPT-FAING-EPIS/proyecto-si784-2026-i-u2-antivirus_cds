from PyQt5.QtWidgets import QLabel
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QDragEnterEvent, QDropEvent

class SandboxDropArea(QLabel):
    def __init__(self):
        super().__init__("Arrastra y suelta archivos aquí para analizar en Sandbox")
        self.setAcceptDrops(True)
        self.setAlignment(Qt.AlignCenter)
        self.setStyleSheet("border: 3px dashed #aaa; border-radius: 10px; min-height: 120px;")
        self.files = []

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self.setStyleSheet("border: 3px dashed #4CAF50; border-radius: 10px; min-height: 120px;")

    def dragLeaveEvent(self, event):
        self.setStyleSheet("border: 3px dashed #aaa; border-radius: 10px; min-height: 120px;")

    def dropEvent(self, event: QDropEvent):
        self.files = [url.toLocalFile() for url in event.mimeData().urls()]
        self.setText(f"{len(self.files)} archivo(s) listos para enviar al sandbox")
        self.setStyleSheet("border: 3px dashed #aaa; border-radius: 10px; min-height: 120px;")