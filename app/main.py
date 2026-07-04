from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router

app = FastAPI(
    title="HRMS API Backend",
    description="FastAPI Backend for Human Resource Management System",
    version="1.0.0",
)

# CORS middleware configuration
# TODO: Retrieve allowed origins from environment configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include standard api routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to the HRMS API Backend. Access documentation at /docs"}
