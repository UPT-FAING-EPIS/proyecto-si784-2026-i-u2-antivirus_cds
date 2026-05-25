import unittest
from engine.heuristics import StaticHeuristic
import tempfile

class TestHeuristics(unittest.TestCase):
    def test_entropy_calculation(self):
        with tempfile.NamedTemporaryFile(delete=False) as f:
            f.write(b'\x00' * 1000)
            f.close()
            h = StaticHeuristic(f.name)
            score, reasons = h.analyze()
            self.assertGreaterEqual(score, 0.0)

if __name__ == '__main__':
    unittest.main()