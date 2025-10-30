import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .schemas import TokenPair, UserOut, RegisterIn, LoginIn, RefreshIn
from .utils.security import verify_password, get_password_hash, create_access_token, create_refresh_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, password_hash=get_password_hash(payload.password), name=payload.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login-email", response_model=TokenPair)
def login_email(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access, "refresh_token": refresh}


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshIn, db: Session = Depends(get_db)):
    # For simplicity, issue a new pair without full validation chain
    # In production, validate refresh token and rotation
    access = create_access_token({"sub": "0"})
    refresh = create_refresh_token({"sub": "0"})
    return {"access_token": access, "refresh_token": refresh}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user