import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.detectors.text.detector import TextDetector

detector = TextDetector()

def run_test(text, expected):
    result = detector.analyze(text)
    print(f"[{expected}] -> Classification: {result.assessment} (Conf: {result.confidence_score*100:.1f}%)")
    print(f"Perplexity: {result.text_metrics.get('perplexity_score')}")
    print("Signals:", [s.name for s in result.signals])
    print("-" * 40)

# 1. Short text
run_test("Hello.", "Uncertain")

# 2. Human text
run_test("I can't believe it's raining again today. We didn't plan for this weather. Oh well, I guess I'm going to stay inside and read a book instead. It's actually quite cozy.", "Human-Written")

# 3. AI text
run_test("Furthermore, it is crucial to delve into the multifaceted nature of this landscape. In conclusion, this is a testament to the intricate tapestry of society.", "AI-Generated")

# 4. Long text (constrained vocab)
run_test("The cat sat on the mat. The cat was fat. The fat cat sat on the mat. The cat liked the mat. The mat was flat. The fat cat sat on the flat mat.", "AI-Generated or Uncertain")
