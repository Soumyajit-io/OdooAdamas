"""Agent state definition for the simple RAG pipeline."""

from typing import Annotated

from langchain_core.documents import Document
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field


class AgentState(BaseModel):
    """State for the RAG LangGraph pipeline.

    Attributes:
        messages: Conversation history managed by LangGraph's add_messages reducer.
        context: Retrieved document chunks from ChromaDB.
        question: The current user question being processed.
    """

    messages: Annotated[list[AnyMessage], add_messages] = Field(
        default_factory=list
    )
    context: list[Document] = Field(default_factory=list)
    question: str = ""
