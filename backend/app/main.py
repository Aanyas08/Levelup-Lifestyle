import logging
import os

from dotenv import load_dotenv

load_dotenv()  # must run before anything reads os.environ (security.py needs JWT_SECRET_KEY)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import models
from .database import Base, engine
from .routes_auth import router as auth_router
from .routes_quote import router as quote_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("levelup")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LevelUp API")

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth_router)
app.include_router(quote_router)


@app.get("/health")
def health():
    return {"status": "ok"}
