import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def process_pdf(filepath: str):
    doc = fitz.open(filepath)

    all_docs = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text:
            all_docs.append(Document(
                page_content=text,
                metadata={
                    "page": page_num + 1,
                    "source": filepath
                }
            ))

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )

    chunks = text_splitter.split_documents(all_docs)

    # Add chunk IDs
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = f"chunk_{i}"

    print(f"Processed {filepath} into {len(chunks)} chunks")
    return chunks