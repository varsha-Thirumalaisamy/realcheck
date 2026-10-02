import os
import sys
import json
import urllib.request
from pathlib import Path

BASE_URL = "http://localhost:8000/api"
SAMPLES_DIR = Path("c:/Users/ADMIN/Desktop/smartmove/frontend/public/samples")

def post_file(url, file_path):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    filename = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post_text(url, text):
    import urllib.parse
    data = urllib.parse.urlencode({"text": text}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("=== REALCHECK AI - ALL MODALITY LIVE VERIFICATION ===")

# 1. Image
print("\n--- Testing IMAGE Modality ---")
res_img_synth = post_file(f"{BASE_URL}/analyze/image", SAMPLES_DIR / "synthetic_portrait.jpg")
print(f"Synthetic Portrait -> Assessment: {res_img_synth.get('assessment')}, Score: {res_img_synth.get('authenticity_score')}, Signals: {len(res_img_synth.get('signals', []))}")
res_img_raw = post_file(f"{BASE_URL}/analyze/image", SAMPLES_DIR / "nikon_raw.jpg")
print(f"Nikon RAW -> Assessment: {res_img_raw.get('assessment')}, Score: {res_img_raw.get('authenticity_score')}, Signals: {len(res_img_raw.get('signals', []))}")

# 2. Video
print("\n--- Testing VIDEO Modality ---")
res_vid_swap = post_file(f"{BASE_URL}/analyze/video", SAMPLES_DIR / "face_swap.mp4")
print(f"Face Swap Video -> Assessment: {res_vid_swap.get('assessment')}, Score: {res_vid_swap.get('authenticity_score')}, Signals: {len(res_vid_swap.get('signals', []))}")
res_vid_auth = post_file(f"{BASE_URL}/analyze/video", SAMPLES_DIR / "authentic_video.mp4")
print(f"Authentic Video -> Assessment: {res_vid_auth.get('assessment')}, Score: {res_vid_auth.get('authenticity_score')}, Signals: {len(res_vid_auth.get('signals', []))}")

# 3. Audio
print("\n--- Testing AUDIO Modality ---")
res_aud_synth = post_file(f"{BASE_URL}/analyze/audio", SAMPLES_DIR / "synthetic_voice.wav")
print(f"Synthetic Voice -> Assessment: {res_aud_synth.get('assessment')}, Score: {res_aud_synth.get('authenticity_score')}, Signals: {len(res_aud_synth.get('signals', []))}")
res_aud_real = post_file(f"{BASE_URL}/analyze/audio", SAMPLES_DIR / "human_voice.wav")
print(f"Human Voice -> Assessment: {res_aud_real.get('assessment')}, Score: {res_aud_real.get('authenticity_score')}, Signals: {len(res_aud_real.get('signals', []))}")

# 4. Text
print("\n--- Testing TEXT Modality ---")
ai_text = "Furthermore, it is crucial to recognize that artificial intelligence plays an imperative role in shaping the paradigm of contemporary enterprise operations, underscoring multifaceted opportunities and comprehensive advancements."
res_txt_ai = post_text(f"{BASE_URL}/analyze/text", ai_text)
print(f"AI Text -> Assessment: {res_txt_ai.get('assessment')}, Score: {res_txt_ai.get('authenticity_score')}, Signals: {len(res_txt_ai.get('signals', []))}")

human_text = "I went down to the harbour this morning around six. The fog was thick as wool, cold enough to bite through my heavy wool jacket, but the old diesel engine in Frank's trawler sputtered into life on the very first crank."
res_txt_human = post_text(f"{BASE_URL}/analyze/text", human_text)
print(f"Human Text -> Assessment: {res_txt_human.get('assessment')}, Score: {res_txt_human.get('authenticity_score')}, Signals: {len(res_txt_human.get('signals', []))}")

print("\n=== ALL 4 MODALITIES COMPLETED SUCCESSFULLY ===")
