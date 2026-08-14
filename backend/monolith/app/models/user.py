from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRecord(BaseModel):
    id: str
    email: str
    password_hash: str
    full_name: str
    preferences: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class UserPublic(BaseModel):
    id: str
    email: str
    full_name: str
    preferences: list[str]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=80)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, value: str) -> str:
        if not any(c.isalpha() for c in value) or not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least one letter and one digit")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class PreferencesUpdate(BaseModel):
    preferences: list[str]
