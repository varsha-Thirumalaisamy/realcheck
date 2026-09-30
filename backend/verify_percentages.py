import os
import requests

def test_upload(url, path, mime):
    with open(path, 'rb') as f:
        r = requests.post(url, files={'file': (os.path.basename(path), f, mime)})
    assert r.status_code == 200, f'Status {r.status_code}: {r.text}'
    data = r.json()
    dp = data.get('deepfake_probability')
    ap = data.get('ai_generation_probability')
    auth = data.get('authenticity_score')
    
    raw = dp if dp is not None else ap
    if raw <= 1.0 and raw > 0:
        pct = raw * 100.0
    else:
        pct = raw
    disp_ai = round(pct)
    disp_real = 100 - disp_ai
    
    fname = os.path.basename(path)
    print(f"File: {fname}")
    print(f"  Case ID: {data.get('case_id')}")
    print(f"  Raw deepfake_probability: {dp}")
    print(f"  Raw ai_generation_probability: {ap}")
    print(f"  Authenticity score: {auth}")
    print(f"  Assessment: {data.get('assessment')}")
    print(f"  Displayed Deepfake %: {disp_ai}%")
    print(f"  Displayed Authentic %: {disp_real}%")
    print(f"  Sum check: {disp_ai + disp_real}%\n")
    return disp_ai, disp_real, data.get('case_id')

if __name__ == '__main__':
    print('=== TESTING IMAGE ANALYSES (2 DIFFERENT IMAGES) ===')
    i1_ai, i1_real, i1_id = test_upload('http://localhost:8000/api/analyze/image', 'frontend/src/assets/hero.png', 'image/png')
    i2_ai, i2_real, i2_id = test_upload('http://localhost:8000/api/analyze/image', 'backend/.venv/Lib/site-packages/sklearn/datasets/images/china.jpg', 'image/jpeg')

    assert i1_ai != i2_ai, f'Images should not have identical static percentages! {i1_ai} vs {i2_ai}'
    assert i1_id != i2_id, 'Case IDs must be unique per upload!'

    print('=== TESTING VIDEO ANALYSES (2 DIFFERENT VIDEOS) ===')
    v1_ai, v1_real, v1_id = test_upload('http://localhost:8000/api/analyze/video', 'backend/test_video_real.mp4', 'video/mp4')
    v2_ai, v2_real, v2_id = test_upload('http://localhost:8000/api/analyze/video', 'backend/test_video_fake.mp4', 'video/mp4')

    assert v1_ai != v2_ai, f'Videos should not have identical static percentages! {v1_ai} vs {v2_ai}'
    assert v1_id != v2_id, 'Case IDs must be unique per upload!'

    print('ALL MULTI-FILE AND DYNAMIC PERCENTAGE CHECKS PASSED!')
