import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from sqlmodel import Session

from app.core.db import get_session
from app.core.security import ALGORITHM, SECRET_KEY
from app.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin")


def get_current_user(
    db: Session = Depends(get_session), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
        )

    user = db.get(User, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    return user


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges"
        )
    return current_user


def get_current_hr_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.ADMIN, UserRole.HR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges"
        )
    return current_user
