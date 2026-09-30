import requests
import json
import os

BASE_URL = "http://localhost:8000/api"
TEST_FILES_DIR = "c:/Users/ADMIN/Desktop/test_files"

files_to_test = [
    ("valid.wav", "audio/wav"),
    ("valid.mp3", "audio/mpeg"),
    ("corrupted.wav", "audio/wav"),
    ("unsupported.txt", "text/plain"),
    ("large.wav", "audio/wav")
]

for filename, mime_type in files_to_test:
    filepath = os.path.join(TEST_FILES_DIR, filename)
    print(f"\n{'='*50}\nTesting {filename} ({mime_type})")
    
    # Check temp dir before
    temp_files_before = set(os.listdir("C:/Users/ADMIN/AppData/Local/Temp"))
    
    try:
        with open(filepath, "rb") as f:
            files = {"file": (filename, f, mime_type)}
            response = requests.post(f"{BASE_URL}/analyze/audio", files=files)
            
        print(f"HTTP Status Code: {response.status_code}")
        
        # Check temp dir after (should be same, verifying cleanup)
        temp_files_after = set(os.listdir("C:/Users/ADMIN/AppData/Local/Temp"))
        leaked_files = temp_files_after - temp_files_before
        
        if leaked_files:
            print(f"WARNING: Temporary files left behind: {leaked_files}")
        else:
            print("Cleanup: Temporary file successfully deleted after processing.")
            
        if response.status_code == 200:
            result = response.json()
            print("API Response Fields:")
            print(f"  - Case ID: {result.get('case_id')}")
            print(f"  - Assessment: {result.get('assessment')}")
            print(f"  - Authenticity Score: {result.get('authenticity_score')}")
            print(f"  - AI Generation Probability: {result.get('ai_generation_probability')}")
            print(f"  - Limitations: {result.get('limitations')}")
            
            print("\nDetector Output Fields (Signals):")
            for idx, signal in enumerate(result.get('signals', [])):
                print(f"  [{idx+1}] {signal['name']} - {signal['status']}")
                print(f"        {signal['explanation']}")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Request Exception: {e}")
