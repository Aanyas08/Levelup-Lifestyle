from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Date, Time, Float, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DailyQuote(Base):
    __tablename__ = "daily_quotes"

    id = Column(Integer, primary_key=True, index=True)
    quote_date = Column(Date, unique=True, index=True, nullable=False)
    text = Column(String, nullable=False)
    author = Column(String, nullable=True)
    source = Column(String, nullable=False, default="gemini")


class AIInsight(Base):
    """
    One row per user per calendar day — same once-a-day caching pattern
    as DailyQuote, except personalized per user instead of shared globally
    (since it's built from that user's own wellness/medication data), so
    it's keyed on (user_id, insight_date) rather than just insight_date.
    Generated once on first request each day, then served from here for
    every subsequent request that day — keeps Gemini calls to one per
    user per day regardless of how many times the dashboard is opened.
    """

    __tablename__ = "ai_insights"
    __table_args__ = (UniqueConstraint("user_id", "insight_date", name="uq_ai_insight_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    insight_date = Column(Date, nullable=False, index=True)

    quote = Column(String, nullable=False)
    daily_insight = Column(String, nullable=False)
    health_advice = Column(String, nullable=False)
    hydration_advice = Column(String, nullable=False)
    medication_advice = Column(String, nullable=False)
    habit_advice = Column(String, nullable=False)
    source = Column(String, nullable=False, default="gemini")  # "gemini" | "fallback"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GameState(Base):
    """
    One row per user, holding the entire habit-tracker/gamification state
    (player — level/XP/coins/streak — and the full habits array) as a
    single JSON blob.

    Why a blob instead of normalized Habit/HabitLog/Player tables: the
    frontend's GameContext already owns a rich, fast-evolving shape for
    this data (domain, schedule, per-day history, tracking-type-specific
    fields) with a lot of derived client-side computation (weekly
    progress, category breakdowns, trend charts) built directly on top of
    it. Normalizing that into relational tables would mean duplicating
    all of that logic on the backend and keeping two implementations in
    sync. Persisting the same shape the frontend already uses, as JSON,
    gets every user their own isolated, durable copy of exactly the state
    they had — which is the actual bug being fixed here — without a
    parallel rewrite of GameContext's logic. SQLite's TEXT column has no
    practical size limit for this.

    This was previously client-only: GameContext stored player/habits in
    localStorage under a fixed key, which is shared by every account that
    ever logs into the same browser — that's why a new user saw the
    previous user's habits. This table is what makes it per-account.
    """

    __tablename__ = "game_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    state_json = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

class DailyWellness(Base):
    """
    One row per user per calendar day. Every field is nullable — a day
    with only sleep logged is still a valid partial record, since the
    user builds this up incrementally over the day rather than filling
    it all in at once.

    Values are stored as real numbers (hours, ml, minutes, a 1-5 scale)
    rather than booleans/labels on purpose — see the API layer's docstring
    for why: this is what makes the data usable for pattern analysis and
    AI-driven insights later, instead of a checkbox that only records
    that *something* happened.
    """

    __tablename__ = "daily_wellness"
    __table_args__ = (UniqueConstraint("user_id", "entry_date", name="uq_wellness_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entry_date = Column(Date, nullable=False, index=True)

    sleep_hours = Column(Float, nullable=True)  # e.g. 7.2
    hydration_ml = Column(Integer, nullable=True)  # e.g. 1850
    hydration_target_ml = Column(Integer, nullable=True, default=2500)
    mood = Column(Integer, nullable=True)  # 1-5
    energy = Column(Integer, nullable=True)  # 1-5
    activity_minutes = Column(Integer, nullable=True)  # general physical activity
    workout_minutes = Column(Integer, nullable=True)
    workout_type = Column(String, nullable=True)  # e.g. "Strength", "Cardio", "Yoga"
    steps = Column(Integer, nullable=True)
    meditation_minutes = Column(Integer, nullable=True)
    screen_time_hours = Column(Float, nullable=True)
    nutrition_meals_logged = Column(Integer, nullable=True)  # simple, measurable proxy —
    # see routes_wellness.py docstring for why this beats a "good/bad" label
    nutrition_note = Column(String, nullable=True)  # optional free-text, e.g. "high protein"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )


class Medication(Base):
    """
    A medicine the user takes on a recurring basis. The recurrence itself
    (which times of day) lives in MedicationSchedule, not here — a medicine
    taken twice a day is one Medication row with two MedicationSchedule
    rows, so adding/removing a dose time never touches the medicine's own
    details.
    """

    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)  # e.g. "500 mg" — free text, not a parsed quantity
    form = Column(String, nullable=False, default="Tablet")  # Tablet | Capsule | Syrup | Other
    frequency = Column(String, nullable=False, default="once_daily")  # once_daily | twice_daily | custom
    instructions = Column(String, nullable=True)  # before_food | after_food | with_food | custom text
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # nullable = ongoing
    reminder_enabled = Column(Boolean, nullable=False, default=True)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    schedules = relationship("MedicationSchedule", back_populates="medication", cascade="all, delete-orphan")
    logs = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")


class MedicationSchedule(Base):
    """One dose time per day for a medication (e.g. "08:00"). A medicine
    taken twice daily has two of these rows."""

    __tablename__ = "medication_schedules"

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    time = Column(Time, nullable=False)  # naive time-of-day (no tz) — SQLAlchemy stores this as "HH:MM:SS" text on SQLite

    medication = relationship("Medication", back_populates="schedules")


class MedicationLog(Base):
    """
    One row per dose the user actually acted on (taken/missed/skipped).
    Doses that haven't been acted on yet deliberately have NO row here —
    "today's schedule" and "history" compute those on the fly from the
    medication's active window + schedule times instead of pre-populating
    a row for every future dose. This keeps the table only ever containing
    real user actions, which is what adherence is calculated from.
    """

    __tablename__ = "medication_logs"
    __table_args__ = (
        UniqueConstraint("medication_id", "scheduled_date", "scheduled_time", name="uq_medication_dose"),
    )

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(Time, nullable=False)  # naive time-of-day, matches MedicationSchedule.time's type
    status = Column(String, nullable=False)  # taken | missed | skipped
    taken_at = Column(DateTime, nullable=True)  # only set when status == "taken"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    medication = relationship("Medication", back_populates="logs")
