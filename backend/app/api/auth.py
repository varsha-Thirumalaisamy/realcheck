from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest, ResendVerificationRequest, GoogleLoginRequest
import secrets
import hashlib
from datetime import timezone
from app.core.email import send_verification_email, send_password_reset_email
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    oauth2_scheme,
    decode_access_token,
    SECRET_KEY,
    ALGORITHM
)
import jwt
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role="USER",
        email_verified=False,
        verification_token_hash=token_hash,
        verification_token_expires_at=expires_at
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        send_verification_email(new_user.email, raw_token)
    except Exception as e:
        db.delete(new_user)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

    return new_user

@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    """
    OAuth2 compatible token login, getting an access token for future requests.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before signing in."
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/google", response_model=Token)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google authentication is not configured.")
        
    try:
        idinfo = id_token.verify_oauth2_token(
            request.token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        email = idinfo['email']
        name = idinfo.get('name', '')
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password="",  # no password for google users
            role="USER",
            email_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # If they previously signed up with email/password, but now use Google, we can mark them verified
        if not user.email_verified:
            user.email_verified = True
            db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal that the user does not exist
        return {"msg": "If an account with that email exists, a password reset link has been sent."}
    
    # Generate secure reset token
    expires = timedelta(minutes=15)
    reset_token = create_access_token(
        data={"sub": user.id, "type": "reset"}, expires_delta=expires
    )
    
    try:
        send_password_reset_email(user.email, reset_token)
    except Exception as e:
        # We don't want to expose email failures directly in response for security,
        # but you might want to log it in production.
        pass
    
    return {"msg": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_access_token(request.token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        # Hash new password and update
        user.hashed_password = get_password_hash(request.new_password)
        db.commit()
        
        return {"msg": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@router.post("/verify-email")
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    user = db.query(User).filter(User.verification_token_hash == token_hash).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Account is already verified")
        
    expires_at = user.verification_token_expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if not expires_at or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Expired verification token")
        
    user.email_verified = True
    user.verification_token_hash = None
    user.verification_token_expires_at = None
    db.commit()
    
    return {"msg": "Email verified successfully"}

@router.post("/resend-verification")
def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        return {"msg": "If an account with that email exists and is unverified, a new verification link has been sent."}
        
    if user.email_verified:
        raise HTTPException(status_code=400, detail="Account is already verified")
        
    # Rate limit: allow resend if token expires in less than 23 hours and 59 minutes
    # Assuming 24 hours expiry, they can request again after 1 minute.
    if user.verification_token_expires_at:
        expires_at = user.verification_token_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        time_left = expires_at - datetime.now(timezone.utc)
        if time_left > timedelta(hours=23, minutes=59):
            raise HTTPException(status_code=429, detail="Please wait before requesting another verification email")

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    user.verification_token_hash = token_hash
    user.verification_token_expires_at = expires_at
    db.commit()
    
    try:
        send_verification_email(user.email, raw_token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {"msg": "A new verification link has been sent to your email."}
