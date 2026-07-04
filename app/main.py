from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.api.v1.api import api_router
from app.core.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title="HRMS API Backend",
    description="FastAPI Backend for Human Resource Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include standard api routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to the HRMS API Backend. Access documentation at /docs"}
