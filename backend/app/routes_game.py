"""
Per-user habit-tracker / gamification state.

See the GameState model's docstring for why this is stored as one JSON
blob per user rather than normalized tables — short version: the
frontend's GameContext already owns this shape and a lot of derived
logic on top of it, so this endpoint's job is just to durably persist
and isolate that per account, not to re-implement it server-side.
"""

import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .deps import get_current_user

router = APIRouter(prefix="/game", tags=["game"])


@router.get("/state", response_model=schemas.GameStateOut)
def get_state(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = db.query(models.GameState).filter(models.GameState.user_id == current_user.id).first()
    if row is None:
        return schemas.GameStateOut(state=None, updated_at=None)
    return schemas.GameStateOut(state=json.loads(row.state_json), updated_at=row.updated_at)


@router.put("/state", response_model=schemas.GameStateOut)
def save_state(
    payload: schemas.GameStateIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    row = db.query(models.GameState).filter(models.GameState.user_id == current_user.id).first()
    state_json = json.dumps(payload.state)

    if row is None:
        row = models.GameState(user_id=current_user.id, state_json=state_json)
        db.add(row)
    else:
        row.state_json = state_json

    db.commit()
    db.refresh(row)
    return schemas.GameStateOut(state=payload.state, updated_at=row.updated_at)