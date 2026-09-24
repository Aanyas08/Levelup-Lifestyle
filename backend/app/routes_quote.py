import json
import os
import random
from datetime import date

import google.generativeai as genai
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db
from .deps import get_current_user

router = APIRouter(prefix="/quote", tags=["quote"])

FALLBACK_QUOTES = [
    {"text": "Discipline is choosing between what you want now and what you want most.", "author": "Abraham Lincoln"},
    {"text": "Small daily improvements are the key to staggering long-term results.", "author": None},
    {"text": "You do not rise to the level of your goals. You fall to the level of your systems.", "author": "James Clear"},
    {"text": "The habit of persistence is the habit of victory.", "author": "Herbert Kaufman"},
    {"text": "Motivation gets you started. Habit keeps you going.", "author": "Jim Ryun"},
]


def _generate_with_gemini() -> dict | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            "Give one short, original motivational quote (max 25 words) about "
            "discipline, habits, health, or self-improvement, in the voice of a wise "
            "mentor. Respond ONLY with JSON, no markdown fences, in the exact "
            'shape: {"text": "...", "author": "..." or null}'
        )
        response = model.generate_content(
            prompt, request_options={"timeout": 8}
        )
        raw = response.text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        if isinstance(data, dict) and data.get("text"):
            return {"text": data["text"], "author": data.get("author")}
    except Exception:
        return None
    return None


@router.get("/today", response_model=schemas.QuoteOut)
def get_today_quote(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    today = date.today()
    cached = db.query(models.DailyQuote).filter(models.DailyQuote.quote_date == today).first()
    if cached:
        return schemas.QuoteOut(
            text=cached.text, author=cached.author, quote_date=cached.quote_date, source=cached.source
        )

    generated = _generate_with_gemini()
    if generated:
        text, author, source = generated["text"], generated["author"], "gemini"
    else:
        pick = random.choice(FALLBACK_QUOTES)
        text, author, source = pick["text"], pick["author"], "fallback"

    row = models.DailyQuote(quote_date=today, text=text, author=author, source=source)
    db.add(row)
    db.commit()

    return schemas.QuoteOut(text=text, author=author, quote_date=today, source=source)
