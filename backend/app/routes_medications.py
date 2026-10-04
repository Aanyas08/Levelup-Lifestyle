"""
Medication Manager + Medication Reminders.

Scope, deliberately: this module lets a user record their own medication
routine and track whether scheduled doses were taken. It never evaluates,
recommends, or comments on the medication itself — no dosage suggestions,
no "you should take this," no interaction checking. That's a hard line
for a self-tracking tool built by a student project, not a clinical one.

Dose events (the thing "today's schedule" and "history" return) are
computed on the fly from each medication's active window
(start_date..end_date) and its schedule times, rather than being
pre-generated and stored for every future day. A row only exists in
MedicationLog once the user actually marks a dose taken/missed/skipped.
A dose with no log row is reported as "missed" once its date has passed,
or "scheduled" if it's today or in the future — see _dose_events below.
This is what keeps a medication from ever showing doses outside its
start/end window, and it's also why no background job is needed to
"generate" tomorrow's doses in advance.
"""

from datetime import date, datetime, timedelta, time, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from . import models, schemas
from .database import get_db
from .deps import get_current_user

router = APIRouter(prefix="/medications", tags=["medications"])

def _parse_time(value: str | time) -> str:
    if isinstance(value, time):
        return value.strftime("%H:%M")

    datetime.strptime(value, "%H:%M")
    return value



def _get_owned_medication(db: Session, medication_id: int, user_id: int) -> models.Medication:
    med = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.id == medication_id, models.Medication.user_id == user_id)
        .first()
    )
    if med is None:
        # Same 404 whether the medication doesn't exist or belongs to someone
        # else — never reveal which, that's an ownership leak either way.
        raise HTTPException(status_code=404, detail="Medication not found")
    return med


def _to_out(med: models.Medication) -> schemas.MedicationOut:
    return schemas.MedicationOut(
        id=med.id,
        name=med.name,
        dosage=med.dosage,
        form=med.form,
        frequency=med.frequency,
        instructions=med.instructions,
        start_date=med.start_date,
        end_date=med.end_date,
        reminder_enabled=med.reminder_enabled,
        notes=med.notes,
        times=sorted(
            s.time
            for s in med.schedules
            ),
        created_at=med.created_at,
        updated_at=med.updated_at,
    )


def _dose_events(medications: list[models.Medication], start: date, end: date, logs: dict) -> list[schemas.DoseEvent]:
    today = date.today()
    events = []
    d = start
    while d <= end:
        for med in medications:
            if d < med.start_date:
                continue
            if med.end_date is not None and d > med.end_date:
                continue
            for sched in med.schedules:
                log = logs.get((med.id, d, sched.time))
                if log:
                    status, taken_at = log.status, log.taken_at
                else:
                    status, taken_at = ("missed" if d < today else "scheduled"), None
                events.append(
                    schemas.DoseEvent(
                        medication_id=med.id,
                        medication_name=med.name,
                        dosage=med.dosage,
                        form=med.form,
                        scheduled_date=d,
                        scheduled_time=sched.time.strftime("%H:%M")
                        if isinstance(sched.time, time)
                        else str(sched.time),
                        status=status,
                        taken_at=taken_at,
                    )
                )
        d += timedelta(days=1)
    events.sort(key=lambda e: (e.scheduled_date, e.scheduled_time))
    return events


def _logs_in_range(db: Session, user_id: int, start: date, end: date) -> dict:
    rows = (
        db.query(models.MedicationLog)
        .filter(
            models.MedicationLog.user_id == user_id,
            models.MedicationLog.scheduled_date >= start,
            models.MedicationLog.scheduled_date <= end,
        )
        .all()
    )
    return {(r.medication_id, r.scheduled_date, r.scheduled_time): r for r in rows}


# --------------------------------------------------------------------------
# CRUD
# --------------------------------------------------------------------------

@router.post("", response_model=schemas.MedicationOut, status_code=201)
def create_medication(
    payload: schemas.MedicationIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = models.Medication(
        user_id=current_user.id,
        name=payload.name,
        dosage=payload.dosage,
        form=payload.form,
        frequency=payload.frequency,
        instructions=payload.instructions,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reminder_enabled=payload.reminder_enabled,
        notes=payload.notes,
    )
    med.schedules = [
    models.MedicationSchedule(time=_parse_time(t))
    for t in payload.times
]
    db.add(med)
    db.commit()
    db.refresh(med)
    return _to_out(med)


@router.get("", response_model=list[schemas.MedicationOut])
def list_medications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meds = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.user_id == current_user.id)
        .order_by(models.Medication.created_at.desc())
        .all()
    )
    return [_to_out(m) for m in meds]


@router.get("/{medication_id}", response_model=schemas.MedicationOut)
def get_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _to_out(_get_owned_medication(db, medication_id, current_user.id))


@router.put("/{medication_id}", response_model=schemas.MedicationOut)
def update_medication(
    medication_id: int,
    payload: schemas.MedicationIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = _get_owned_medication(db, medication_id, current_user.id)
    med.name = payload.name
    med.dosage = payload.dosage
    med.form = payload.form
    med.frequency = payload.frequency
    med.instructions = payload.instructions
    med.start_date = payload.start_date
    med.end_date = payload.end_date
    med.reminder_enabled = payload.reminder_enabled
    med.notes = payload.notes

    # Replace the schedule wholesale rather than diffing — simpler, and the
    # log table keys on (medication_id, date, time) rather than schedule
    # row id, so past logs aren't affected by re-creating schedule rows.
    for s in list(med.schedules):
        db.delete(s)
    med.schedules = [
    models.MedicationSchedule(time=_parse_time(t))
    for t in payload.times
]

    db.commit()
    db.refresh(med)
    return _to_out(med)


@router.delete("/{medication_id}", status_code=204)
def delete_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = _get_owned_medication(db, medication_id, current_user.id)
    db.delete(med)  # cascades to schedules + logs
    db.commit()


# --------------------------------------------------------------------------
# Today's schedule / reminders
# --------------------------------------------------------------------------

@router.get("/schedule/today", response_model=list[schemas.DoseEvent])
def get_today_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    meds = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.user_id == current_user.id)
        .all()
    )
    logs = _logs_in_range(db, current_user.id, today, today)
    return _dose_events(meds, today, today, logs)


@router.post("/log", response_model=schemas.DoseEvent)
def log_dose(
    payload: schemas.MedicationLogIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    med = _get_owned_medication(db, payload.medication_id, current_user.id)

    scheduled_time = _parse_time(payload.scheduled_time)

    if scheduled_time not in {s.time for s in med.schedules}:
        raise HTTPException(status_code=400, detail="That time isn't part of this medication's schedule")
    if payload.scheduled_date < med.start_date or (med.end_date and payload.scheduled_date > med.end_date):
        raise HTTPException(status_code=400, detail="That date is outside the medication's active period")

    row = (
        db.query(models.MedicationLog)
        .filter(
            models.MedicationLog.medication_id == med.id,
            models.MedicationLog.scheduled_date == payload.scheduled_date,
            models.MedicationLog.scheduled_time == scheduled_time,
        )
        .first()
    )
    taken_at = datetime.now(timezone.utc) if payload.status == "taken" else None

    if row is None:
        row = models.MedicationLog(
            medication_id=med.id,
            user_id=current_user.id,
            scheduled_date=payload.scheduled_date,
            scheduled_time=scheduled_time,
            status=payload.status,
            taken_at=taken_at,
        )
        db.add(row)
    else:
        # Re-marking an already-logged dose (e.g. correcting a mistake)
        # overwrites in place rather than creating a second log row for
        # the same dose — the UniqueConstraint on the model would reject
        # a duplicate insert anyway.
        row.status = payload.status
        row.taken_at = taken_at

    db.commit()
    db.refresh(row)

    return schemas.DoseEvent(
        medication_id=med.id,
        medication_name=med.name,
        dosage=med.dosage,
        form=med.form,
        scheduled_date=row.scheduled_date,
        scheduled_time=row.scheduled_time.strftime("%H:%M")
        if isinstance(row.scheduled_time, time)
        else str(row.scheduled_time),
        status=row.status,
        taken_at=row.taken_at,
    )


# --------------------------------------------------------------------------
# History / adherence
# --------------------------------------------------------------------------

@router.get("/history/all", response_model=list[schemas.DoseEvent])
def get_history(
    days: int = Query(default=30, ge=1, le=365),
    medication_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    start = today - timedelta(days=days - 1)

    q = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.user_id == current_user.id)
    )
    if medication_id is not None:
        q = q.filter(models.Medication.id == medication_id)
    meds = q.all()
    if medication_id is not None and not meds:
        raise HTTPException(status_code=404, detail="Medication not found")

    logs = _logs_in_range(db, current_user.id, start, today)
    events = _dose_events(meds, start, today, logs)
    events.sort(key=lambda e: (e.scheduled_date, e.scheduled_time), reverse=True)
    return events


@router.get("/adherence/summary", response_model=schemas.AdherenceOut)
def get_adherence(
    period: str = Query(default="week", pattern="^(week|month|all)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    meds = (
        db.query(models.Medication)
        .options(joinedload(models.Medication.schedules))
        .filter(models.Medication.user_id == current_user.id)
        .all()
    )

    if period == "week":
        start = today - timedelta(days=6)
    elif period == "month":
        start = today - timedelta(days=29)
    else:
        earliest = min((m.start_date for m in meds), default=today)
        start = max(earliest, today - timedelta(days=365))

    logs = _logs_in_range(db, current_user.id, start, today)
    # Adherence only makes sense for doses that have already come due —
    # a dose scheduled for tomorrow hasn't been missed or taken yet, so
    # it's excluded from both the numerator and denominator.
    events = [e for e in _dose_events(meds, start, today, logs) if e.status != "scheduled"]

    scheduled = len(events)
    taken = sum(1 for e in events if e.status == "taken")
    missed = sum(1 for e in events if e.status == "missed")
    skipped = sum(1 for e in events if e.status == "skipped")
    pct = round((taken / scheduled) * 100, 1) if scheduled else 0.0

    return schemas.AdherenceOut(
        period=period, start_date=start, end_date=today,
        scheduled=scheduled, taken=taken, missed=missed, skipped=skipped, adherence_pct=pct,
    )