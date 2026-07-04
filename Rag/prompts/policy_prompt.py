"""Prompt template for the policy search RAG tool."""

POLICY_PROMPT_TEMPLATE = """Use the following context from the Adamas Technologies
Employee Handbook to answer the user's question. Answer ONLY based on the provided
context. If the context does not contain enough information, say:
"I couldn't find specific information about that in the Employee Handbook."

Do NOT make up policies or rules that are not in the context.

---
CONTEXT:
{context}
---

Question: {question}
"""
