# Human Resource Management System (HRMS)

> **Every workday, perfectly aligned.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/Soumyajit-io/OdooAdamas/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)](https://github.com/Soumyajit-io/OdooAdamas/blob/master/pyproject.toml)

Welcome to the **Human Resource Management System (HRMS)**! This platform is designed to digitize, streamline, and simplify core HR operations. From employee onboarding and profile management to attendance tracking, leave management, and payroll visibility, our HRMS provides a comprehensive suite of tools for both administrators and employees.

## 🚀 Key Features

Our HRMS is built with a role-based architecture to ensure secure and efficient access to relevant features.

### 👥 For Employees
- **Profile Management**: View and edit personal details, job information, and upload profile pictures.
- **Attendance Tracking**: Easily check-in and check-out. View daily and weekly attendance records.
- **Leave Management**: Apply for various types of leave (Paid, Sick, Unpaid) with an interactive calendar view and track request statuses.
- **Payroll Visibility**: Secure, read-only access to your salary structure and payroll details.
- **Personalized Dashboard**: Quick-access cards for profile, attendance, leave requests, and recent alerts.

### 🛡️ For Admins & HR Officers
- **Employee Management**: Comprehensive view and edit capabilities for all employee profiles and records.
- **Attendance Oversight**: Monitor daily and weekly attendance records across the entire organization.
- **Leave Approvals**: Review, approve, or reject leave requests with the ability to add comments.
- **Payroll Control**: Manage salary structures and ensure payroll accuracy for all employees.
- **Centralized Dashboard**: A bird's-eye view of employee lists, pending leave approvals, and overall attendance.

### 🔒 Security & Access
- **Robust Authentication**: Secure sign-up/sign-in with email, employee ID, and password.
- **Role-Based Access Control**: Strict separation of privileges between standard Employees and Admin/HR Officers.

## 🛠️ Getting Started

*(Add instructions on how to set up the project locally)*

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn or pnpm
- Database setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/hrms.git
   cd hrms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure your variables (database URL, JWT secret, etc.).

4. **Run the application:**
   ```bash
   npm run dev
   ```

## 🤖 RAG HR Assistant (Ada)

The project includes an AI-powered HR Assistant that answers questions about company policies using **Retrieval-Augmented Generation (RAG)**.

### Architecture

```
User Question → [Retrieve] ChromaDB → [Generate] OpenAI GPT-4o-mini → Answer
```

A **LangGraph** pipeline with two nodes:
- **Retrieve** — Searches the Employee Handbook (PDF) via ChromaDB similarity search
- **Generate** — Sends retrieved context + question to OpenAI for a grounded answer

### Project Structure

```
Rag/
├── ingest.py              # One-time: PDF → chunks → embeddings → ChromaDB
├── vector_store.py        # Runtime: loads ChromaDB, exposes retriever
├── agent/
│   ├── agentstate.py      # Pydantic state (question, context, messages)
│   └── main.py            # LangGraph RAG pipeline + interactive REPL
├── prompts/
│   ├── system_prompt.py   # Agent persona & rules
│   └── policy_prompt.py   # RAG prompt template
└── data/
    ├── Adamas_Employee_Handbook_2026_Detailed.pdf
    └── chroma_db/         # Generated vector store
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| LLM | OpenAI GPT-4o-mini |
| Embeddings | OpenAI text-embedding-3-small |
| Vector DB | ChromaDB |
| Orchestration | LangGraph |
| PDF Parsing | PyPDF + LangChain text splitters |

### Setup & Usage

1. **Set your OpenAI API key** in the root `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Ingest the handbook** (one-time):
   ```bash
   uv run python -m Rag.ingest
   ```

3. **Chat with Ada**:
   ```bash
   uv run python -m Rag.agent.main
   ```

### Example Questions

- *"What is the notice period?"*
- *"How many sick leaves are allowed?"*
- *"What is the work-from-home policy?"*
- *"How is HRA calculated?"*



## 🎨 Design Reference
- Excalidraw: [Link](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

---
*Built with ❤️ by the Name_not_decided Team*
