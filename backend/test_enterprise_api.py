import requests
import time
import os

BASE_URL = "http://localhost:8000/api/enterprise"
API_KEY = "rc_ent_2026_secure"
HEADERS = {"X-API-Key": API_KEY}

def test_c2pa_verify_no_c2pa():
    # Create a dummy image
    dummy_file = "dummy_no_c2pa.jpg"
    with open(dummy_file, "wb") as f:
        f.write(b"fake image data")
        
    try:
        with open(dummy_file, "rb") as f:
            files = {"file": ("dummy_no_c2pa.jpg", f, "image/jpeg")}
            response = requests.post(f"{BASE_URL}/c2pa/verify", headers=HEADERS, files=files)
            
            print(f"C2PA Verify (No C2PA) Response: {response.status_code}")
            print(response.json())
            assert response.status_code == 200
            assert response.json()["has_c2pa"] == False
            assert response.json()["status"] in ["NO_C2PA", "UNSUPPORTED", "VERIFICATION_ERROR"]
    finally:
        os.remove(dummy_file)

def test_batch_analyze():
    # Create dummy files
    f1 = "batch_1.jpg"
    f2 = "batch_2.mp4"
    with open(f1, "wb") as f: f.write(b"data1")
    with open(f2, "wb") as f: f.write(b"data2")
    
    try:
        files = [
            ("files", (f1, open(f1, "rb"), "image/jpeg")),
            ("files", (f2, open(f2, "rb"), "video/mp4"))
        ]
        data = {"texts": ["This is a test batch text analysis."]}
        
        # Start batch
        response = requests.post(f"{BASE_URL}/batch/analyze", headers=HEADERS, files=files, data=data)
        print(f"Batch Start Response: {response.status_code}")
        res = response.json()
        print(res)
        
        assert response.status_code == 200
        batch_id = res["batch_id"]
        
        # Poll for completion
        max_attempts = 10
        for _ in range(max_attempts):
            time.sleep(1)
            status_res = requests.get(f"{BASE_URL}/batch/{batch_id}", headers=HEADERS)
            status_data = status_res.json()
            print(f"Batch Status: {status_data['status']}")
            if status_data["status"] == "COMPLETED":
                print("Final Batch Jobs:")
                for job in status_data["jobs"]:
                    print(f" - Job {job['job_id']}: {job['status']}")
                break
    finally:
        os.remove(f1)
        os.remove(f2)

def test_auth_failure():
    dummy_file = "dummy_no_c2pa.jpg"
    with open(dummy_file, "wb") as f:
        f.write(b"fake image data")
        
    try:
        with open(dummy_file, "rb") as f:
            files = {"file": ("dummy_no_c2pa.jpg", f, "image/jpeg")}
            response = requests.post(f"{BASE_URL}/c2pa/verify", headers={"X-API-Key": "wrong_key"}, files=files)
            print(f"Auth Failure Response: {response.status_code}")
            assert response.status_code == 401
    finally:
        os.remove(dummy_file)

if __name__ == "__main__":
    print("Testing Auth Failure...")
    test_auth_failure()
    print("\nTesting C2PA Verify...")
    test_c2pa_verify_no_c2pa()
    print("\nTesting Batch Analyze...")
    test_batch_analyze()
