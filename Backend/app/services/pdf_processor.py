# app/services/pdf_processor.py
import fitz  # PyMuPDF
# --- THIS IS THE LINE TO CHANGE ---
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def process_pdf(filepath: str):
    """
    Extracts text from a PDF and splits it into semantic chunks with metadata.
    
    Args:
        filepath (str): The path to the PDF file.
        
    Returns:
        A list of LangChain Document objects, where each object is a text chunk.
    """
    doc = fitz.open(filepath)
    
    all_docs = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text:
            # Create a Document object for each page's content.
            # We include the page number in the metadata, which is crucial for citations.
            all_docs.append(Document(
                page_content=text,
                metadata={"page": page_num + 1}
            ))
    
    # Use LangChain's text splitter for intelligent chunking based on characters like "\n"
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # The size of each chunk in characters
        chunk_overlap=100 # The number of characters to overlap between chunks
    )
    
    chunks = text_splitter.split_documents(all_docs)
    
    print(f"Successfully processed '{filepath}' into {len(chunks)} chunks.")
    return chunks