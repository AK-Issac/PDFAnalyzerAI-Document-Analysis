from flask import current_app
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_answer_from_llm(chunks, question: str) -> str:
    """
    Generate an answer strictly based on retrieved chunks.
    """

    # Improved structured context
    context = "\n\n".join([
        f"[Chunk {i+1} | Page {chunk.metadata.get('page')}]\n{chunk.page_content}"
        for i, chunk in enumerate(chunks)
    ])

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an AI assistant that answers questions using ONLY the provided context.

STRICT RULES:
1. Use ONLY the context. No external knowledge.
2. If answer is not explicitly in the context, say:
   "Not found in document."
3. Be concise and precise.
4. Cite pages like (Page X).
5. Do NOT guess or infer beyond the text.

Context:
{context}
"""),
        ("human", "{question}")
    ])

    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)

    chain = prompt_template | llm | StrOutputParser()
    answer = chain.invoke({"context": context, "question": question})

    return answer


def summarize_text(text: str, description: str = "") -> str:
    if description:
        full_input = f"User's request: '{description}'\n\nText:\n{text}"
        system_prompt = """You are an expert summarizer.

Provide a concise answer addressing the request, followed by bullet points if relevant.
"""
    else:
        full_input = text
        system_prompt = """You are an expert summarizer.

Provide a short paragraph summary followed by key bullet points.
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{full_input}")
    ])

    api_key = current_app.config['OPENAI_API_KEY']
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=api_key)

    chain = prompt_template | llm | StrOutputParser()
    return chain.invoke({"full_input": full_input})