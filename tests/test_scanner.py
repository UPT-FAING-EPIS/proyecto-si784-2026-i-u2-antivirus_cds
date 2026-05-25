import unittest
from engine.scanner import EscanearArchivo

class TestScanner(unittest.TestCase):
    def test_clean_file(self):
        # Crear archivo temporal limpio
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as f:
            f.write(b"Hola mundo")
            f.close()
            result = EscanearArchivo(f.name, {})
            self.assertEqual(result.verdict.name, "CLEAN")

if __name__ == '__main__':
    unittest.main()