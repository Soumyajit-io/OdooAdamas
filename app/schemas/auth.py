from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    company_name: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str


class SigninRequest(BaseModel):
    login_id_or_email: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    is_first_login: bool
