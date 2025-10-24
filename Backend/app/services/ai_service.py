from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_answer_from_llm(chunks, question: str) -> str:
    """
    Constructs a detailed prompt and gets an answer from the LLM.
    """
    context = "\n\n---\n\n".join([f"Source (Page {chunk.metadata.get('page', 'N/A')}): {chunk.page_content}" for chunk in chunks])
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are a world-class legal AI assistant. Your task is to answer the user's question based *only* on the provided context.\n\n        Guidelines:\n        - Answer the question using only the information from the 'Context' below.\n        - Do not use any outside knowledge.\n        - If the answer is not found in the context, you must state: \"I could not find an answer in the provided document.\"\n        - For every piece of information you use, you MUST cite the page number it came from using the format (Page X). A citation is required for every claim.\n\n        Context:\n        {context}"""),
        ("human", "{question}")
    ])
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
    chain = prompt_template | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})
    return answer

def summarize_text(text: str, description: str = "") -> str:
    """
    Summarizes the provided text, using an optional description to guide the summary.
    """
    # If the user provides a description, combine it with the text for a better prompt.
    if description:
        full_input = f"User's request: '{description}'\n\nText to summarize:\n---\n{text}"
        system_prompt = "You are an expert at summarizing legal and technical documents. Provide a clear, concise summary of the following text, paying close attention to the user's specific request."
    else:
        full_input = text
        system_prompt = "You are an expert at summarizing legal text. Condense the following text into a clear, concise, and easy-to-understand summary."

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{full_input}")
    ])
    
    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)
    
    chain = prompt_template | llm | StrOutputParser()
    
    summary = chain.invoke({"full_input": full_input})
    
    return summary
