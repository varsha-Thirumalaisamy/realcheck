import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.exc import OperationalError, ProgrammingError

def create_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "user@realcheck.com").first()
        if existing_user:
            print("User user@realcheck.com already exists!")
            return
            
        hashed_password = get_password_hash("User@123")
        
        new_user = User(
            email="user@realcheck.com",
            hashed_password=hashed_password,
            email_verified=True,
            role="USER"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"Successfully created user: {new_user.email}")
    except OperationalError as e:
        print("\n--- DATABASE CONNECTION ERROR ---")
        print("Failed to connect to Supabase. This usually means:")
        print("1. Your database password in .env is incorrect")
        print("2. Your Supabase project is paused")
        print(f"\nError details: {e}")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        if "relation" in str(e).lower() and "does not exist" in str(e).lower():
            print("\nHint: You need to run database migrations first!")
            print("Run: alembic upgrade head")
    finally:
        db.close()

if __name__ == "__main__":
    create_user()
