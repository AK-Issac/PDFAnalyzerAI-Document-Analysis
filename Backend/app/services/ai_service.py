# app/services/ai_service.py
from flask import current_app
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_answer_from_llm(chunks, question: str) -> str:
    """
    Constructs an improved, more direct prompt to get a concise answer from the LLM.
    """
    context = "\n\n---\n\n".join([f"Source (Page {chunk.metadata.get('page', 'N/A')}): {chunk.page_content}" for chunk in chunks])

    # --- PROMPT IMPROVEMENT ---
    # 1. Persona: Changed from "world-class legal AI" to an assistant that "makes complex documents easy to understand."
    # 2. Constraints: Added explicit rules for being concise, using simple language, and using bullet points.
    # 3. Citation Style: Instructed to group citations at the end of a sentence for better readability.
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an expert AI assistant that makes complex documents easy to understand.

        Your task is to answer the user's question based ONLY on the provided context.

        Guidelines:
        1.  **Be Concise and Direct:** Provide a clear, straightforward answer. Use simple language and avoid jargon.
        2.  **Strictly Contextual:** Do not use any information outside of the provided "Context" section.
        3.  **Handle Missing Information:** If the answer is not in the context, you MUST state: "I could not find an answer to that question in the provided document."
        4.  **Cite Your Sources:** At the end of any sentence or paragraph that uses information from the document, add the page number(s) in parentheses, like `(Page X)`. If multiple pages are used, group them like `(Page X, Y)`.
        5.  **Use Bullet Points:** For lists of items or key points, use bullet points for readability.

        Context:
        {context}"""),
        ("human", "{question}")
    ])
    
    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)
    
    chain = prompt_template | llm | StrOutputParser()
    
    answer = chain.invoke({"context": context, "question": question})
    
    return answer

def summarize_text(text: str, description: str = "") -> str:
    """
    Summarizes the provided text using an improved prompt for clarity and structure.
    """
    # --- PROMPT IMPROVEMENT ---
    # 1. Formatting: Explicitly asks for an overview paragraph followed by a bulleted list of key takeaways.
    # 2. Persona: The persona is reinforced to focus on clarity and conciseness.
    # 3. Description Handling: The prompt for when a description is provided is more direct.
    if description:
        full_input = f"User's request: '{description}'\n\nText to summarize:\n---\n{text}"
        system_prompt = """You are an expert summarizer. Your task is to analyze the provided text and the user's specific request.

        Create a concise summary that directly addresses the user's request. If appropriate, structure your response with a brief introduction followed by key points in a bulleted list.
        """
    else:
        full_input = text
        system_prompt = """You are an expert summarizer. Your task is to condense the following text into its most important points.

        Provide a brief overview paragraph, followed by the key takeaways as a bulleted list. The goal is a quick and easy-to-understand summary.
        """

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{full_input}")
    ])
    
    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)
    
    chain = prompt_template | llm | StrOutputParser()
    
    summary = chain.invoke({"full_input": full_input})
    
    return summary