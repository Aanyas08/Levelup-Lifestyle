from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Date

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
