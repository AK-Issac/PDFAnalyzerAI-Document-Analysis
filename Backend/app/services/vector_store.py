import os
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

VECTOR_STORE_PATH = 'vector_stores'

# Cache for performance
# Changed cache to store by (user_id, doc_id)
VECTOR_CACHE = {}

def get_user_vector_path(user_id: str, doc_id: str) -> str:
    """Helper to ensure physical isolation of FAISS indices per user."""
    return os.path.join(VECTOR_STORE_PATH, user_id, doc_id)

def create_and_store_embeddings(doc_id: str, user_id: str, chunks):
    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_documents(chunks, embedding=embeddings)

    path = get_user_vector_path(user_id, doc_id)
    # Ensure user directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    vector_store.save_local(path)


def retrieve_relevant_chunks(doc_id: str, user_id: str, query: str, k: int = 4):
    cache_key = f"{user_id}_{doc_id}"
    
    if cache_key not in VECTOR_CACHE:
        embeddings = OpenAIEmbeddings()
        path = get_user_vector_path(user_id, doc_id)

        if not os.path.exists(path):
            raise FileNotFoundError(f"No vector store for {doc_id}")

        VECTOR_CACHE[cache_key] = FAISS.load_local(
            path,
            embeddings,
            allow_dangerous_deserialization=True
        )

    retriever = VECTOR_CACHE[cache_key].as_retriever(search_kwargs={"k": k})
    return retriever.invoke(query)