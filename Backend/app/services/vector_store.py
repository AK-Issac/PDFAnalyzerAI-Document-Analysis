import os
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS

VECTOR_STORE_PATH = 'vector_stores'

def create_and_store_embeddings(doc_id: str, chunks):
    """
    Generates embeddings for text chunks and stores them in a local FAISS vector store.
    """
    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_documents(chunks, embedding=embeddings)
    # Save the vector store to a local file, named after the doc_id
    vector_store.save_local(os.path.join(VECTOR_STORE_PATH, doc_id))

def retrieve_relevant_chunks(doc_id: str, query: str, k: int = 4):
    """
    Loads a vector store and retrieves the top-k most relevant text chunks for a query.
    """
    embeddings = OpenAIEmbeddings()
    vector_store_path = os.path.join(VECTOR_STORE_PATH, doc_id)
    if not os.path.exists(vector_store_path):
        raise FileNotFoundError(f"No vector store found for document ID: {doc_id}")
    vector_store = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
    retriever = vector_store.as_retriever(search_kwargs={"k": k})
    relevant_chunks = retriever.invoke(query)
    return relevant_chunks
