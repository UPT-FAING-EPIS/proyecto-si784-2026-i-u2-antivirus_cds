import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading

class MonitorHandler(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback

    def on_created(self, event):
        if not event.is_directory:
            self.callback(event.src_path)

    def on_modified(self, event):
        if not event.is_directory:
            self.callback(event.src_path)

class RealTimeMonitor:
    def __init__(self, callback, paths=["C:\\Users"]):
        self.callback = callback
        self.paths = paths
        self.observer = None
        self._started = False

    def start(self):
        if self._started:
            return  # ya está en ejecución
        self.observer = Observer()
        handler = MonitorHandler(self.callback)
        for path in self.paths:
            if os.path.exists(path):
                self.observer.schedule(handler, path, recursive=True)
        self.observer.start()
        self._started = True

    def stop(self):
        if self._started and self.observer:
            self.observer.stop()
            self.observer.join()
            self.observer = None
            self._started = False