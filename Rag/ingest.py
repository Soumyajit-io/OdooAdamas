"""One-time ingestion script: loads the Employee Handbook PDF, splits it into
chunks, generates OpenAI embeddings, and stores them in ChromaDB.

Usage:
    python -m Rag.ingest
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = BASE_DIR / "data" / "Adamas_Employee_Handbook_2026_Detailed.pdf"
CHROMA_DIR = str(BASE_DIR / "data" / "chroma_db")
COLLECTION_NAME = "employee_handbook"


def ingest() -> None:
    """Load the handbook PDF, chunk it, embed it, and persist to ChromaDB."""
    # Load environment variables (for OPENAI_API_KEY)
    load_dotenv(BASE_DIR.parent / ".env")

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY not found. Set it in your .env file or environment."
        )

    # 1. Load PDF
    print(f"[PDF] Loading PDF: {PDF_PATH}")
    loader = PyPDFLoader(str(PDF_PATH))
    documents = loader.load()
    print(f"   Loaded {len(documents)} pages.")

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    print(f"[SPLIT] Split into {len(chunks)} chunks.")

    # 3. Generate embeddings and store in ChromaDB
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    print(f"[STORE] Storing embeddings in ChromaDB at: {CHROMA_DIR}")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
    )

    print(
        f"[DONE] Ingestion complete! {vectorstore._collection.count()} vectors stored "
        f"in collection '{COLLECTION_NAME}'."
    )


if __name__ == "__main__":
    ingest()
