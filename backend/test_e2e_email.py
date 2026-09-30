import os
import smtplib
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import get_db, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import secrets
from app.models.user import User

load_dotenv()

def print_result(step, status):
    print(f"{step}: {status}")

# Setup test DB
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

print("Starting Email Verification Tests...")

# 1. Check Configuration
if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
    print_result("SMTP Configuration", "FAIL")
    print("Missing SMTP configuration variables.")
    exit(1)
else:
    print_result("SMTP Configuration", "PASS")

# 2. Test SMTP Connection
try:
    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587)
    server.starttls()
    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
    server.quit()
    print_result("SMTP Connection", "PASS")
except Exception as e:
    print_result("SMTP Connection", f"FAIL ({str(e)})")
    print("Stopping tests due to SMTP authentication failure.")
    exit(1)

# To capture raw token, we patch the send_verification_email function
import app.api.auth as auth_api
original_send_verification_email = auth_api.send_verification_email

captured_tokens = []

def mock_send_verification_email(to_email, token):
    captured_tokens.append(token)
    # Still call original to send real email
    original_send_verification_email(to_email, token)

auth_api.send_verification_email = mock_send_verification_email

# 3. Create a NEW test account & 4. Send real email & 5. Confirm SMTP success
test_email = settings.SMTP_USERNAME
if not test_email or "@" not in test_email:
    test_email = "testuser@gmail.com"
test_password = "SecurePassword123!"

# clear existing test user if any
db = TestSessionLocal()
existing_user = db.query(User).filter(User.email == test_email).first()
if existing_user:
    db.delete(existing_user)
    db.commit()

unverified_email = "unverified_" + test_email
existing_unverified = db.query(User).filter(User.email == unverified_email).first()
if existing_unverified:
    db.delete(existing_unverified)
    db.commit()

db.close()

try:
    response = client.post("/auth/register", json={
        "email": test_email,
        "password": test_password
    })
    
    if response.status_code == 200:
        print_result("Real Email Send", "PASS")
    else:
        print_result("Real Email Send", f"FAIL (Status: {response.status_code}, {response.text})")
        exit(1)
except Exception as e:
    print_result("Real Email Send", f"FAIL ({str(e)})")
    exit(1)

# 6 & 7 & 8. Verify the email
if not captured_tokens:
    print_result("Email Verification", "FAIL (No token captured)")
    exit(1)

token = captured_tokens[-1]
print(f"Token Captured. Simulating opening link: {settings.FRONTEND_URL}/verify-email?token={token}")

response = client.post("/auth/verify-email", json={"token": token})
if response.status_code == 200:
    print_result("Email Verification", "PASS")
else:
    print_result("Email Verification", f"FAIL (Status: {response.status_code}, {response.text})")

# 9. Sign in
response = client.post("/auth/login", json={
    "email": test_email,
    "password": test_password
})
if response.status_code == 200 and "access_token" in response.json():
    print_result("Sign In After Verification", "PASS")
else:
    print_result("Sign In After Verification", f"FAIL (Status: {response.status_code}, {response.text})")

# 10. Test Resend
captured_tokens.clear()
response = client.post("/auth/register", json={
    "email": unverified_email,
    "password": test_password
})
if response.status_code == 200:
    captured_tokens.clear() # clear the token from registration
    resend_resp = client.post("/auth/resend-verification", json={"email": unverified_email})
    if resend_resp.status_code == 200 and len(captured_tokens) > 0:
        print_result("Resend Email", "PASS")
    else:
        print_result("Resend Email", f"FAIL (Status: {resend_resp.status_code}, {resend_resp.text})")
else:
    print_result("Resend Email", "FAIL (Could not create unverified account)")

print("Tests completed.")
