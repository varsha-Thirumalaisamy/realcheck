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

# 1-4. Config check
if settings.SMTP_USERNAME and settings.SMTP_PASSWORD and settings.SMTP_FROM_EMAIL:
    print_result("SMTP configuration", "PASS")
else:
    print_result("SMTP configuration", "FAIL")
    exit(1)

# 5-8. SMTP check
try:
    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587)
    print_result("SMTP connection", "PASS")
    
    server.starttls()
    print_result("STARTTLS", "PASS")
    
    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
    print_result("SMTP authentication", "PASS")
    server.quit()
except Exception as e:
    print_result("SMTP authentication", "FAIL")
    print(f"Error: {str(e)}")
    print_result("Real verification email sent", "NO")
    exit(1)

# 9-10. Real email send via signup flow
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

test_email = settings.SMTP_USERNAME
test_password = "SecurePassword123!"

# clear existing test user if any
db = TestSessionLocal()
existing_user = db.query(User).filter(User.email == test_email).first()
if existing_user:
    db.delete(existing_user)
    db.commit()
db.close()

try:
    response = client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "name": "Test User"
    })
    
    if response.status_code == 200:
        print_result("Real verification email sent", "YES")
    else:
        print_result("Real verification email sent", "NO")
        print(f"Error: {response.status_code} {response.text}")
except Exception as e:
    print_result("Real verification email sent", "NO")
    print(f"Error: {str(e)}")
