from app.detectors.text.detector import TextDetector

def test_text_analysis():
    detector = TextDetector()
    
    # 1. Empty text
    res = detector.analyze("   ")
    assert res.assessment == "Uncertain", res.assessment
    assert res.confidence_score == 0.0

    # 2. Extremely short text
    res = detector.analyze("Hi")
    assert res.assessment == "Uncertain"
    assert res.confidence_score <= 0.2

    # 3. Normal human-written text
    human_text = "I was honestly pretty skeptical when we kicked off the project back in November. We ran into weird edge cases with the database, and half the scripts broke! But hey, after three late-night debug marathons, the pipeline stabilized. What a crazy ride."
    res = detector.analyze(human_text)
    assert res.assessment == "Human-Written", res.assessment

    # 4. Highly structured/formal text (AI)
    ai_text = "Furthermore, it is crucial to delve into this multifaceted issue. In conclusion, this is a testament to the fact that we must revolutionize the landscape. Firstly, we must ensure optimal performance."
    res = detector.analyze(ai_text)
    assert res.assessment in ["AI-Generated", "AI-Edited", "Manipulated"], res.assessment
    
    # 5. Repeated text (Manipulated)
    rep_text = "This is a test sentence. This is a test sentence. This is a test sentence. This is a test sentence."
    res = detector.analyze(rep_text)
    assert res.assessment == "Manipulated", res.assessment

    print("All tests passed.")

if __name__ == "__main__":
    test_text_analysis()

