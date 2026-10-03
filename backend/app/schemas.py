from datetime import datetime, date

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


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


# --------------------------------------------------------------------------
# Medications
# --------------------------------------------------------------------------
# This app only records what the user tells it about their own medication
# routine and tracks whether scheduled doses were taken — it never
# recommends, evaluates, or comments on the medication itself.

import re
from typing import Literal

_TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _validate_time(v: str) -> str:
    if not _TIME_RE.match(v):
        raise ValueError('time must be in 24-hour "HH:MM" format, e.g. "08:00"')
    return v


class MedicationIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    dosage: str = Field(min_length=1, max_length=60)
    form: Literal["Tablet", "Capsule", "Syrup", "Other"] = "Tablet"
    frequency: Literal["once_daily", "twice_daily", "custom"] = "once_daily"
    instructions: str | None = Field(default=None, max_length=120)
    start_date: date
    end_date: date | None = None
    reminder_enabled: bool = True
    notes: str | None = Field(default=None, max_length=300)
    times: list[str] = Field(min_length=1, max_length=8)

    @field_validator("times")
    @classmethod
    def check_times(cls, v):
        return [_validate_time(t) for t in v]

    @model_validator(mode="after")
    def check_date_order(self):
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class MedicationOut(BaseModel):
    id: int
    name: str
    dosage: str
    form: str
    frequency: str
    instructions: str | None
    start_date: date
    end_date: date | None
    reminder_enabled: bool
    notes: str | None
    times: list[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MedicationLogIn(BaseModel):
    medication_id: int
    scheduled_date: date
    scheduled_time: str
    status: Literal["taken", "missed", "skipped"]

    @field_validator("scheduled_time")
    @classmethod
    def check_time(cls, v):
        return _validate_time(v)


class DoseEvent(BaseModel):
    """A single scheduled dose, whether or not it's been acted on yet —
    the shape returned by /today and /history alike."""

    medication_id: int
    medication_name: str
    dosage: str
    form: str
    scheduled_date: date
    scheduled_time: str
    status: Literal["scheduled", "taken", "missed", "skipped"]
    taken_at: datetime | None = None

class GameStateIn(BaseModel):
    state: dict


class GameStateOut(BaseModel):
    state: dict | None
    updated_at: datetime | None = None
    
class AIInsightOut(BaseModel):
    insight_date: date
    quote: str
    daily_insight: str
    health_advice: str
    hydration_advice: str
    medication_advice: str
    habit_advice: str
    source: str  # "gemini" | "fallback" — surfaced so the UI can show which mode it's in

    class Config:
        from_attributes = True


class AdherenceOut(BaseModel):
    period: str
    start_date: date
    end_date: date
    scheduled: int
    taken: int
    missed: int
    skipped: int
    adherence_pct: float