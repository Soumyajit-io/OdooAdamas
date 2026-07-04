import os

from dotenv import load_dotenv
from sqlmodel import Session, create_engine

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Initialize SQLModel engine
# echo=True prints all SQL queries to console (useful for development/debugging)
engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    """
    FastAPI dependency yielding a database session context.
    """
    with Session(engine) as session:
        yield session
