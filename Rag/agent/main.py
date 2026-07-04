"""Simple RAG Pipeline — LangGraph graph with retrieve and generate nodes.

Architecture:
    User Question → [retrieve] → ChromaDB → [generate] → OpenAI LLM → Answer

No tool-calling. No ReAct agent. Just retrieve → generate.

Usage:
    python -m Rag.agent.main
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph

# ── Ensure project root is on sys.path ───────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables
load_dotenv(PROJECT_ROOT / ".env")

# ── Imports from project modules ─────────────────────────────────────────────
from Rag.agent.agentstate import AgentState
from Rag.prompts.policy_prompt import POLICY_PROMPT_TEMPLATE
from Rag.prompts.system_prompt import SYSTEM_PROMPT
from Rag.vector_store import get_retriever

# ── Configuration ────────────────────────────────────────────────────────────
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


# ── Graph Nodes ──────────────────────────────────────────────────────────────


def retrieve(state: AgentState) -> dict:
    """Retrieve relevant chunks from ChromaDB based on the user's question."""
    question = state.question
    retriever = get_retriever(k=4)
    docs = retriever.invoke(question)
    return {"context": docs}


def generate(state: AgentState) -> dict:
    """Generate an answer using retrieved context and the LLM."""
    question = state.question
    docs = state.context

    # Format the context from retrieved documents
    if docs:
        context_text = "\n\n".join(
            f"[Page {doc.metadata.get('page', 'N/A')}]: {doc.page_content}"
            for doc in docs
        )
    else:
        context_text = "No relevant information found in the Employee Handbook."

    # Build the prompt using the policy prompt template
    user_prompt = POLICY_PROMPT_TEMPLATE.format(
        context=context_text,
        question=question,
    )

    # Call the LLM
    llm = ChatOpenAI(model=MODEL_NAME, temperature=0)
    response = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    )

    return {
        "messages": [
            HumanMessage(content=question),
            AIMessage(content=response.content),
        ]
    }


# ── Build the Graph ──────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("retrieve", retrieve)
workflow.add_node("generate", generate)

# Define edges: retrieve → generate → END
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

# Compile the graph
graph = workflow.compile()


# ── Public API ───────────────────────────────────────────────────────────────


def ask(question: str) -> str:
    """Send a question to the RAG pipeline and get an answer.

    Args:
        question: The user's question about company policies/handbook.

    Returns:
        The LLM-generated answer based on retrieved handbook context.
    """
    result = graph.invoke({"question": question})

    # Extract the last AI message
    for msg in reversed(result["messages"]):
        if isinstance(msg, AIMessage) and msg.content:
            return msg.content

    return "I'm sorry, I couldn't generate a response."


# ── Interactive REPL ─────────────────────────────────────────────────────────


def interactive_repl() -> None:
    """Run an interactive REPL for testing the RAG pipeline."""
    print("=" * 60)
    print("  Ada -- Adamas HR Assistant (RAG)")
    print("=" * 60)
    print("Ask questions about the Employee Handbook.")
    print("Type 'quit' or 'exit' to stop.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "q"):
            print("\nGoodbye!")
            break

        print("\nAda: ", end="", flush=True)
        response = ask(user_input)
        print(response)
        print()


if __name__ == "__main__":
    interactive_repl()