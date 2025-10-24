# app/services/ai_service.py
from flask import current_app
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_answer_from_llm(chunks, question: str) -> str:
    """
    Constructs a detailed prompt and gets an answer from the LLM.
    """
    # Combine the content of the retrieved chunks into a single context string.
    # We include the page number metadata to help the LLM with citations.
    context = "\n\n---\n\n".join([f"Source (Page {chunk.metadata.get('page', 'N/A')}): {chunk.page_content}" for chunk in chunks])

    # The prompt template is the instruction manual for the AI.
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are a world-class legal AI assistant. Your task is to answer the user's question based *only* on the provided context.

        Guidelines:
        - Answer the question using only the information from the 'Context' below.
        - Do not use any outside knowledge.
        - If the answer is not found in the context, you must state: "I could not find an answer in the provided document."
        - For every piece of information you use, you MUST cite the page number it came from using the format (Page X). A citation is required for every claim.

        Context:
        {context}"""),
        ("human", "{question}")
    ])
    
    # --- THIS IS THE FIX ---
    # We explicitly get the API key from the Flask app's configuration.
    api_key = current_app.config['OPENAI_API_KEY']
    
    # We pass the key directly when initializing the ChatOpenAI client.
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)
    
    # Create the processing chain.
    chain = prompt_template | llm | StrOutputParser()
    
    # Invoke the chain with the necessary information.
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
    
    # This part is already correct from the previous fix.
    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)
    
    chain = prompt_template | llm | StrOutputParser()
    
    summary = chain.invoke({"full_input": full_input})
    
    return summary