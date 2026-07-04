"""Vector store loader — connects to the existing ChromaDB and exposes a
retriever for similarity search. Does NOT re-generate embeddings.

Usage:
    from Rag.vector_store import get_retriever
    retriever = get_retriever()
    docs = retriever.invoke("What is the notice period?")
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
CHROMA_DIR = str(BASE_DIR / "data" / "chroma_db")
COLLECTION_NAME = "employee_handbook"

# Load environment variables
load_dotenv(BASE_DIR.parent / ".env")


def get_retriever(k: int = 4):
    """Return a similarity-search retriever over the employee handbook.

    Args:
        k: Number of top-similar chunks to retrieve. Defaults to 4.

    Returns:
        A LangChain retriever backed by the ChromaDB collection.
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY not found. Set it in your .env file or environment."
        )

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
    )

    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )
