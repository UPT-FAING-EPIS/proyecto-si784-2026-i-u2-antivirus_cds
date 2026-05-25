import os
import joblib

class MLClassifier:
    def __init__(self, model_path="data/ml_models/classifier.pkl"):
        self.model_path = model_path
        self.model = None
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
            except:
                self.model = None

    def predict_proba(self, features):
        if self.model:
            try:
                return self.model.predict_proba([features])[0][1]  # Probabilidad clase maliciosa
            except:
                pass
        return 0.5  # neutro si no hay modelo
