from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .deps import get_current_user
from .security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=str(user.id))
    return schemas.TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    invalid = HTTPException(status_code=401, detail="Incorrect email or password")
    if not user or not verify_password(payload.password, user.hashed_password):
        raise invalid

    token = create_access_token(subject=str(user.id))
    return schemas.TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/diagnostic-account")
def diagnostic_account(db: Session = Depends(get_db)):
    email = "aanya08@gmail.com"

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    return {
        "account_exists": user is not None,
        "account_id": user.id if user else None,
        "database_check": "completed",
    }
