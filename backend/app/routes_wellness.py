"""
Numeric daily wellness tracking.

Every metric is stored as a real, measurable value — hours, ml, minutes,
a 1-5 scale, a step count — rather than a boolean or a label. That's a
deliberate choice: "hydration done" tells you nothing three months from
now, but "1850 / 2500 ml on a Tuesday" is a data point a pattern-analysis
or AI-insight feature can actually work with later. Nothing in this file
implements that analysis yet — it just makes sure the numbers exist and
belong to the right user.

One row per user per calendar day (see the UniqueConstraint on the
model). The single upsert endpoint below merges whatever fields are sent
into that day's row, so the frontend can save partial progress (log
sleep now, hydration after lunch) without needing separate endpoints per
metric or a full snapshot on every save.
"""

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .deps import get_current_user

router = APIRouter(prefix="/wellness", tags=["wellness"])


def _get_or_create_today(db: Session, user_id: int, entry_date: date) -> models.DailyWellness:
    row = (
        db.query(models.DailyWellness)
        .filter(models.DailyWellness.user_id == user_id, models.DailyWellness.entry_date == entry_date)
        .first()
    )
    if row is None:
        row = models.DailyWellness(user_id=user_id, entry_date=entry_date)
        db.add(row)
        db.flush()
    return row


@router.get("/today", response_model=schemas.WellnessOut)
def get_today(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(models.DailyWellness)
        .filter(models.DailyWellness.user_id == current_user.id, models.DailyWellness.entry_date == today)
        .first()
    )
    if row is None:
        # No entry yet today — return an all-empty shape rather than 404,
        # so the dashboard can render the card immediately with blanks
        # instead of branching on a missing-resource error.
        return schemas.WellnessOut(
            entry_date=today,
            sleep_hours=None,
            hydration_ml=None,
            hydration_target_ml=2500,
            mood=None,
            energy=None,
            activity_minutes=None,
            workout_minutes=None,
            workout_type=None,
            steps=None,
            meditation_minutes=None,
            screen_time_hours=None,
            nutrition_meals_logged=None,
            nutrition_note=None,
            updated_at=None,
        )
    return row


@router.put("/today", response_model=schemas.WellnessOut)
def upsert_today(
    payload: schemas.WellnessIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = _get_or_create_today(db, current_user.id, date.today())

    # Only overwrite fields the client actually sent — a partial payload
    # (e.g. just {"sleep_hours": 7.2}) must not wipe out today's other
    # already-logged values.
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(row, field, value)

    db.commit()
    db.refresh(row)
    return row


@router.get("/history", response_model=list[schemas.WellnessOut])
def get_history(
    days: int = Query(default=14, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cutoff = date.today() - timedelta(days=days - 1)
    rows = (
        db.query(models.DailyWellness)
        .filter(models.DailyWellness.user_id == current_user.id, models.DailyWellness.entry_date >= cutoff)
        .order_by(models.DailyWellness.entry_date.asc())
        .all()
    )
    return rows