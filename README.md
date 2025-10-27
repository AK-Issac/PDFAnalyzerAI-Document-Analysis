

# **AI Legal Document Analyzer**

Chat with your PDFs using a powerful **Retrieval-Augmented Generation (RAG)** backend built with **Python, Flask, and LangChain**, and a responsive **React + Vite** frontend using APIs and Storage.
This project transforms how you interact with dense legal documents. Instead of manually searching through pages, you can upload a PDF and ask questions in plain English. The AI reads, locates, and cites relevant sections instantly.

*(Replace this section with a screenshot of your running app)*

---

## ✨ **Features**

* **📄 PDF Upload & Viewing:** Upload and view any legal or technical document in a clean, responsive interface.
* **🔍 Professional PDF Viewer:** Scrollable, multi-page viewer with zoom controls and navigation.
* **💬 Conversational Q&A:** Ask document-related questions and receive context-aware answers.
* **📚 Source Citations:** Every answer includes page references for easy verification.
* **✍️ On-the-Fly Summarization:** Highlight text directly on the PDF to get a summarized explanation.
* **🌓 Light & Dark Mode:** Modern UI with theme detection or manual toggle.
* **🔐 Secure & Local:** Only relevant text chunks are processed; your documents never leave the backend.

---

## ⚙️ **How It Works (Architecture)**

This project uses a **RAG (Retrieval-Augmented Generation)** approach to deliver accurate answers grounded in the source document.

### **Workflow Overview**

#### **1. Ingestion (Uploading a PDF)**

1. The React frontend sends the file to the Flask backend (`/api/upload`).
2. Flask extracts text and page numbers using **PyMuPDF**.
3. Text is split into semantic chunks.
4. Each chunk is embedded via **OpenAI Embeddings API**.
5. Embeddings are stored in a **FAISS** vector database.
6. The backend returns a unique `doc_id` to the frontend.

#### **2. Querying (Asking Questions)**

1. The user sends a question with `doc_id` to `/api/query`.
2. The backend embeds the question and retrieves the most relevant text chunks using FAISS.
3. It builds a contextual prompt combining the question and document context.
4. This is sent to **GPT-4-turbo**, which answers **only based on the retrieved content**.
5. The response (with citations) is returned to the frontend chat.

---

## 🛠️ **Tech Stack**

| Area                        | Technology                                           |
| --------------------------- | ---------------------------------------------------- |
| **Frontend**                | React, Vite, TypeScript, Tailwind CSS, react-pdf     |
| **Backend**                 | Python, Flask, LangChain, OpenAI API, PyMuPDF, FAISS |
| **Storage/Auth (optional)** | Supabase                                             |

---

## 🚀 **Getting Started**

Follow these steps to set up and run the project locally.

### **Prerequisites**

Make sure you have:

* Node.js **v18+**
* Python **v3.10+**
* `pip` and `venv`
* OpenAI API key with billing enabled

---

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### **2. Setup the Backend**

```bash
cd Backend
python -m venv venv

# Activate environment
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### **3. Setup the Frontend**

```bash
cd ../Frontend
npm install
```

---

## ⚙️ **Environment Variables**

### **Backend (`/Backend/.env`)**

```text
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### **Frontend (`/Frontend/.env.local`)**

```text
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL_HERE"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE"
```

*(If not using Supabase yet, placeholders are fine but the file must exist.)*

---

## ▶️ **Running the Application**

### **Backend**

```bash
cd Backend
# Activate venv
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
python run.py
```

Backend runs at: **[http://localhost:5000](http://localhost:5000)**

### **Frontend**

```bash
cd Frontend
npm run dev
```

Frontend runs at: **[http://localhost:5173](http://localhost:5173)**

Then open your browser and start chatting with your PDF!

---

