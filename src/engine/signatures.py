import yara
import os

class SignatureManager:
    def __init__(self, rules_path="data/signatures/rules.yar"):
        self.rules_path = rules_path
        self.rules = None
        self.load_rules()

    def load_rules(self):
        if os.path.exists(self.rules_path):
            try:
                self.rules = yara.compile(self.rules_path)
            except Exception as e:
                print(f"Error cargando reglas YARA: {e}")
                self.rules = None

    def match_yara(self, file_path):
        if not self.rules:
            return None
        try:
            return self.rules.match(file_path)
        except:
            return None

    def update_signatures(self, new_rules_content):
        with open(self.rules_path, 'w') as f:
            f.write(new_rules_content)
        self.load_rules()
