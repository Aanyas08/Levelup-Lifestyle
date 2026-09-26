from datetime import datetime, date

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class QuoteOut(BaseModel):
    text: str
    author: str | None = None
    quote_date: date
    source: str


class WellnessIn(BaseModel):
    """
    Every field optional — the wellness card supports partial saves (log
    sleep now, hydration later), and the upsert endpoint below merges
    whatever's sent into the day's existing row rather than requiring a
    full snapshot every time.
    """

    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    hydration_ml: int | None = Field(default=None, ge=0, le=15000)
    hydration_target_ml: int | None = Field(default=None, ge=0, le=15000)
    mood: int | None = Field(default=None, ge=1, le=5)
    energy: int | None = Field(default=None, ge=1, le=5)
    activity_minutes: int | None = Field(default=None, ge=0, le=1440)
    workout_minutes: int | None = Field(default=None, ge=0, le=1440)
    workout_type: str | None = Field(default=None, max_length=40)
    steps: int | None = Field(default=None, ge=0, le=200_000)
    meditation_minutes: int | None = Field(default=None, ge=0, le=1440)
    screen_time_hours: float | None = Field(default=None, ge=0, le=24)
    nutrition_meals_logged: int | None = Field(default=None, ge=0, le=20)
    nutrition_note: str | None = Field(default=None, max_length=200)


class WellnessOut(BaseModel):
    entry_date: date
    sleep_hours: float | None
    hydration_ml: int | None
    hydration_target_ml: int | None
    mood: int | None
    energy: int | None
    activity_minutes: int | None
    workout_minutes: int | None
    workout_type: str | None
    steps: int | None
    meditation_minutes: int | None
    screen_time_hours: float | None
    nutrition_meals_logged: int | None
    nutrition_note: str | None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True