import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class UserBase(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format.")
        return cleaned


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters")


class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthSessionResponse(BaseModel):
    user: UserResponse
    message: str = "Authenticated successfully"
