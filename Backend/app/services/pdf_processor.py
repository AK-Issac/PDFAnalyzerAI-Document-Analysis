import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
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
            all_docs.append(Document(
                page_content=text,
                metadata={"page": page_num + 1}
            ))
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    chunks = text_splitter.split_documents(all_docs)
    print(f"Successfully processed '{filepath}' into {len(chunks)} chunks.")
    return chunks
