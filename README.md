# PDFAnalyzerAI - Enterprise-Grade Document Intelligence

[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)](#)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61dafb)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-lightgrey)](https://flask.palletsprojects.com/)
[![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)

PDFAnalyzerAI is a secure, multi-tenant RAG (Retrieval-Augmented Generation) system engineered for high-precision PDF document analysis. It bridges the gap between raw PDF data and actionable insights using a zero-hallucination architecture and strict data isolation.

![Demo](./demo.gif)
*Note: Add a 60-second walkthrough GIF here to showcase the UI and AI interaction.*

---

## 2. System Architecture

![Architecture](./Architecture.png)


The system follows a modern decoupled architecture:
- **Frontend:** React (Vite) SPA for a responsive, stateful user experience.
- **Backend:** Flask REST API handling authentication, document processing, and AI orchestration.
- **Data Layer:** 
    - **PostgreSQL:** Persistent storage for user metadata, usage logs, and binary document data (`BYTEA`).
    - **FAISS:** High-performance vector indices for semantic search, physically isolated per tenant.
- **AI Engine:** LangChain orchestration with `gpt-4-turbo` for superior reasoning and citation accuracy.

---

## 3. 🛡️ Architecture & Security Decisions

### **Multi-Tenant Data Isolation**
Data leakage is the primary risk in RAG applications. This project implements **strict isolation at two layers**:
- **Application Layer:** Every database query (SQL) is scoped using a mandatory `WHERE user_id = %s` clause, preventing cross-tenant access.
- **Storage Layer:** Unlike generic implementations that store all vectors in one index, PDFAnalyzerAI uses `get_user_vector_path` to create **physical FAISS index separation**. Each user's knowledge base resides in a unique directory, ensuring zero cross-pollination of sensitive data.

### **Authentication Trade-offs**
The system uses a custom `PyJWT` + `werkzeug` integration.
- **Current State:** Stateless JWTs are used for portfolio simplicity and horizontal scalability.
- **Engineering Trade-off:** While stateless JWTs reduce DB overhead, they lack immediate revocation capabilities. A true enterprise production environment would migrate to **Refresh Tokens stored in HttpOnly/Secure cookies** with a server-side "Deny List" to handle session invalidation.

### **RAG Hygiene & Hallucination Control**
To maintain the integrity required for PDF analysis, the RAG pipeline is "hardened":
- **Deterministic Citations:** The prompt engineering enforces a strict "ONLY context" rule, requiring the model to cite specific sources (e.g., `(Page X)`).
- **Source-to-UI Bridge:** The backend returns chunk metadata (page numbers and indices) allowing the frontend to programmatically scroll and highlight the exact source in the PDF viewer—eliminating the "black box" AI experience.

### **Storage & Performance Strategy**
- **Database-Centric Storage:** PDFs are stored as `BYTEA` in Postgres. This was chosen over local disk storage to ensure atomicity, simplified backups, and easier cloud migration (e.g., to AWS RDS).
- **Vector Caching:** To minimize expensive disk I/O when loading FAISS indices, the system implements a `VECTOR_CACHE` in `vector_store.py`, significantly reducing latency for subsequent queries in a single session.

---

## 4. 💼 Product & Business Logic

PDFAnalyzerAI is built with a **Product-First mindset**, moving beyond a simple "AI Chat" script:
- **Tier-Based Limit System:** Implements a full usage tracking engine (`usage_logs`) that enforces document and action limits for `Free`, `Pro`, and `Business` tiers.
- **Internationalization (i18n):** Fully integrated support for English and French (using `react-i18next`), ready for global market expansion.
- **Onboarding Flow:** A dedicated state-machine for user onboarding that updates profiles and session tokens dynamically.

---

## 5. Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, TailwindCSS, i18next |
| **Backend** | Python, Flask, PyJWT, LangChain |
| **AI/ML** | OpenAI (GPT-4 Turbo), FAISS, OpenAIEmbeddings |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose |

---

## 6. Local Setup & Deployment

Ensure you have Docker and an OpenAI API Key.

1. **Clone the repo**
2. **Configure Environment:**
   Create a `.env` in the `Backend` folder:
   ```env
   OPENAI_API_KEY=your_key_here
   DATABASE_URL=postgresql://admin:adminpassword@postgres:5432/legalai_db
   SECRET_KEY=your_secret
   ```
3. **Spin up the stack:**
   ```bash
   docker-compose up -d --build
   ```
   *The API will be available at `localhost:5000` and the Frontend at `localhost:5173`.*
