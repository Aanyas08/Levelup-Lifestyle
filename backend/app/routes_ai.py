"""
AI Daily Insight.

Pulls together whatever the user actually has on record — today's wellness
entry and this week's medication adherence — and asks Gemini for a short,
personalized set of messages. Same once-per-day caching pattern as the
existing /quote/today endpoint (see DailyQuote), just keyed per-user
instead of global, since the content is personalized.

Habits/streaks and "goals" are NOT included here: habit/streak data lives
entirely client-side in the React app's GameContext (there's no backend
habit table to query), and this project has no goals model at all yet.
Rather than inventing a new backend system to back-fill that — which
wasn't asked for — this endpoint works with what's actually persisted
server-side (wellness + medications) and the habit_advice field below is
general encouragement rather than streak-specific. See the response notes
for how to extend this if/when habits get a backend model.

Safety: the prompt explicitly forbids diagnosis, dosage changes, and
start/stop-medication advice, and the fallback text generator (used when
Gemini is unavailable) only ever reflects the user's own logged numbers
back at them — it never invents medical guidance either.
"""

import json
import os
from datetime import date, timedelta

import google.generativeai as genai
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from . import models, schemas
from .database import get_db
from .deps import get_current_user
from .routes_quote import FALLBACK_QUOTES
from .routes_medications import _dose_events, _logs_in_range

router = APIRouter(prefix="/ai", tags=["ai"])

SAFETY_RULES = (
    "Safety rules you must always follow: never diagnose a medical condition, "
    "never suggest changing a medication dosage, never suggest starting or "
    "stopping a medication, never give treatment advice. You are a wellness "
    "tracking assistant, not a medical professional. If medication data is "
    "present, only comment on adherence/consistency (e.g. encouragement to "
    "keep to the existing schedule), never on the medication itself."
)


def _gather_context(db: Session, user: models.User) -> dict:
    today = date.today()
    week_start = today - timedelta(days=6)

    wellness = (
        db.query(models.DailyWellness)
        .filter(models.DailyWellness.user_id == user.id, models.DailyWellness.entry_date == today)
        .first()
    )

    meds = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.user_id == user.id)
        .all()
    )
    adherence = None
    if meds:
        logs = _logs_in_range(db, user.id, week_start, today)
        events = [e for e in _dose_events(meds, week_start, today, logs) if e.status != "scheduled"]
        scheduled = len(events)
        taken = sum(1 for e in events if e.status == "taken")
        adherence = {
            "scheduled": scheduled,
            "taken": taken,
            "adherence_pct": round((taken / scheduled) * 100, 1) if scheduled else None,
            "medication_count": len(meds),
        }

    return {"wellness": wellness, "adherence": adherence}


def _context_summary(ctx: dict) -> str:
    lines = []
    w = ctx["wellness"]
    if w:
        if w.sleep_hours is not None:
            lines.append(f"Sleep last night: {w.sleep_hours} hours")
        if w.hydration_ml is not None:
            target = w.hydration_target_ml or 2500
            lines.append(f"Hydration today so far: {w.hydration_ml} / {target} ml")
        if w.mood is not None:
            lines.append(f"Mood today: {w.mood}/5")
        if w.energy is not None:
            lines.append(f"Energy today: {w.energy}/5")
        if w.activity_minutes is not None:
            lines.append(f"Physical activity today: {w.activity_minutes} minutes")
        if w.steps is not None:
            lines.append(f"Steps today: {w.steps}")
        if w.meditation_minutes is not None:
            lines.append(f"Meditation today: {w.meditation_minutes} minutes")
        if w.screen_time_hours is not None:
            lines.append(f"Screen time today: {w.screen_time_hours} hours")
    else:
        lines.append("No wellness data logged yet today.")

    a = ctx["adherence"]
    if a:
        pct = f"{a['adherence_pct']}%" if a["adherence_pct"] is not None else "not enough data yet"
        lines.append(
            f"Medication adherence this week: {a['taken']} / {a['scheduled']} doses taken ({pct}) "
            f"across {a['medication_count']} medication(s)."
        )
    else:
        lines.append("No medications currently tracked.")

    return "\n".join(lines)


def _generate_with_gemini(summary: str) -> dict | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            f"{SAFETY_RULES}\n\n"
            "Here is a user's wellness data for today (and recent medication adherence, if any):\n"
            f"{summary}\n\n"
            "Using ONLY this data, write six short, warm, personalized pieces of text, each "
            "under 30 words, in the voice of a supportive wellness coach. If a field has no "
            "relevant data to draw on, give brief general encouragement instead of inventing "
            "specifics. Respond ONLY with JSON, no markdown fences, in this exact shape:\n"
            '{"quote": "...", "daily_insight": "...", "health_advice": "...", '
            '"hydration_advice": "...", "medication_advice": "...", "habit_advice": "..."}'
        )
        response = model.generate_content(prompt, request_options={"timeout": 12})
        raw = response.text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        required = {"quote", "daily_insight", "health_advice", "hydration_advice", "medication_advice", "habit_advice"}
        if isinstance(data, dict) and required.issubset(data) and all(isinstance(data[k], str) and data[k] for k in required):
            return {k: data[k] for k in required}
    except Exception:
        # Any failure — network, missing/invalid key, malformed JSON, a field
        # missing from the response — falls through to the fallback below.
        return None
    return None


def _fallback(ctx: dict) -> dict:
    """
    Rule-based fallback — only ever reflects the user's own numbers back
    at them (or gives generic encouragement when there's nothing logged),
    same "never invent, never advise medically" constraint as the Gemini
    path, just without needing the API at all.
    """
    w = ctx["wellness"]
    a = ctx["adherence"]
    pick = FALLBACK_QUOTES[date.today().toordinal() % len(FALLBACK_QUOTES)]
    quote = pick["text"] + (f" — {pick['author']}" if pick["author"] else "")

    if w and w.sleep_hours is not None:
        health_advice = (
            f"You logged {w.sleep_hours} hours of sleep — "
            + ("solid rest, keep that rhythm going." if w.sleep_hours >= 7 else "a bit short of the usual 7-9 hour range, worth an earlier night tonight.")
        )
    else:
        health_advice = "No sleep data logged yet today — logging it helps you spot your own patterns over time."

    if w and w.hydration_ml is not None:
        target = w.hydration_target_ml or 2500
        hydration_advice = (
            f"You're at {w.hydration_ml} / {target} ml today — "
            + ("right on track." if w.hydration_ml >= target else "a bit more water would get you to today's goal.")
        )
    else:
        hydration_advice = "No hydration logged yet today — a glass of water now is a good start."

    if a:
        pct = a["adherence_pct"]
        medication_advice = (
            f"You're at {pct}% adherence this week ({a['taken']}/{a['scheduled']} doses) — keep sticking to your schedule."
            if pct is not None
            else "Keep logging your doses as you take them so adherence can be tracked."
        )
    else:
        medication_advice = "No medications currently tracked."

    if w and w.mood is not None and w.energy is not None:
        daily_insight = f"Mood {w.mood}/5 and energy {w.energy}/5 today — small consistent habits move both over time."
    else:
        daily_insight = "Log a bit of today's wellness data to start seeing your own patterns here."

    habit_advice = "Consistency beats intensity — showing up for your habits today counts, even in small ways."

    return {
        "quote": quote,
        "daily_insight": daily_insight,
        "health_advice": health_advice,
        "hydration_advice": hydration_advice,
        "medication_advice": medication_advice,
        "habit_advice": habit_advice,
    }


@router.get("/daily-insight", response_model=schemas.AIInsightOut)
def get_daily_insight(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    cached = (
        db.query(models.AIInsight)
        .filter(models.AIInsight.user_id == current_user.id, models.AIInsight.insight_date == today)
        .first()
    )
    if cached:
        return cached

    ctx = _gather_context(db, current_user)
    summary = _context_summary(ctx)

    generated = _generate_with_gemini(summary)
    if generated:
        fields, source = generated, "gemini"
    else:
        fields, source = _fallback(ctx), "fallback"

    row = models.AIInsight(user_id=current_user.id, insight_date=today, source=source, **fields)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
