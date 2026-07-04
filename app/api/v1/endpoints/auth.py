import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.utils import generate_login_id
from app.models import Company, User, UserRole
from app.schemas.auth import ChangePasswordRequest, SigninRequest, SignupRequest, Token

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_session)):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = db.exec(select(User).where(User.email == request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create Company
    company = Company(company_name=request.company_name)
    db.add(company)
    db.commit()
    db.refresh(company)

    # Generate login_id
    joining_date = datetime.date.today()
    login_id = generate_login_id(
        db, request.first_name, request.last_name, joining_date
    )

    # Create User (Admin)
    user = User(
        company_id=company.id,
        role=UserRole.ADMIN,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        login_id=login_id,
        password_hash=get_password_hash(request.password),
        is_first_login=False,
        joining_date=joining_date,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))
    return Token(
        access_token=access_token,
        token_type="bearer",
        is_first_login=user.is_first_login,
    )


@router.post("/signin", response_model=Token)
def signin(request: SigninRequest, db: Session = Depends(get_session)):
    statement = select(User).where(
        or_(
            User.login_id == request.login_id_or_email,
            User.email == request.login_id_or_email,
        )
    )
    user = db.exec(statement).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login ID/email or password",
        )

    access_token = create_access_token(subject=str(user.id))
    return Token(
        access_token=access_token,
        token_type="bearer",
        is_first_login=user.is_first_login,
    )


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if not verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    current_user.password_hash = get_password_hash(request.new_password)
    current_user.is_first_login = False

    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}
