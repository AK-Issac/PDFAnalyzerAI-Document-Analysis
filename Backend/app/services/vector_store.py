# app/services/vector_store.py
import os
from langchain_openai import OpenAIEmbeddings
# --- THIS IS THE LINE TO CHANGE ---
from langchain_community.vectorstores import FAISS

# Define the path for storing FAISS indexes
VECTOR_STORE_PATH = 'vector_stores'

def create_and_store_embeddings(doc_id: str, chunks):
    """
    Generates embeddings for text chunks and stores them in a FAISS vector store.
    """
    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_documents(chunks, embedding=embeddings)
    
    # Save the vector store locally
    vector_store.save_local(os.path.join(VECTOR_STORE_PATH, doc_id))

def retrieve_relevant_chunks(doc_id: str, query: str, k: int = 4):
    """
    Retrieves the most relevant text chunks for a given query from the vector store.
    """
    embeddings = OpenAIEmbeddings()
    
    # Load the vector store from the local path
    vector_store_path = os.path.join(VECTOR_STORE_PATH, doc_id)
    if not os.path.exists(vector_store_path):
        raise FileNotFoundError(f"No vector store found for document ID: {doc_id}")
        
    vector_store = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
    
    # Perform a similarity search
    retriever = vector_store.as_retriever(search_kwargs={"k": k})
    relevant_chunks = retriever.invoke(query)
    
    return relevant_chunks