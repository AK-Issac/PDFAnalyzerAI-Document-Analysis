import os
import uuid
from flask import Blueprint, request, jsonify
from .services import pdf_processor, vector_store, ai_service

# A Blueprint is a way to organize a group of related routes.
api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Handles PDF file uploads. It saves the PDF, processes it into chunks,
    creates vector embeddings, and stores them.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and file.filename.endswith('.pdf'):
        # Generate a unique, secure ID for this document
        doc_id = str(uuid.uuid4())
        filepath = os.path.join('uploads', f"{doc_id}.pdf")
        file.save(filepath)

        # 1. Call the PDF Processor Service
        chunks = pdf_processor.process_pdf(filepath)
        
        # 2. Call the Vector Store Service
        vector_store.create_and_store_embeddings(doc_id, chunks)

        # Return the unique ID to the frontend so it can be used for future queries
        return jsonify({"message": "File processed successfully", "doc_id": doc_id}), 200

    return jsonify({"error": "Invalid file type, please upload a PDF"}), 400


@api_blueprint.route('/query', methods=['POST'])
def query_document():
    """
    Handles questions about a specific document using its doc_id.
    """
    data = request.get_json()
    doc_id = data.get('doc_id')
    question = data.get('question')

    if not doc_id or not question:
        return jsonify({"error": "Both 'doc_id' and 'question' are required"}), 400

    try:
        # 1. Call the Vector Store Service to find relevant context
        relevant_chunks = vector_store.retrieve_relevant_chunks(doc_id, question)
        
        # 2. Call the AI Service to generate an answer
        answer = ai_service.get_answer_from_llm(relevant_chunks, question)

        return jsonify({"answer": answer}), 200
    except FileNotFoundError:
        return jsonify({"error": f"Document with ID '{doc_id}' not found."}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@api_blueprint.route('/summarize', methods=['POST'])
def summarize_text():
    """
    Summarizes a piece of user-selected text, with an optional description.
    """
    data = request.get_json()
    highlighted_text = data.get('text')
    description = data.get('description', "") # Default to an empty string if not provided

    if not highlighted_text:
        return jsonify({"error": "'text' is required"}), 400
        
    # Call the AI Service with both arguments
    summary = ai_service.summarize_text(text=highlighted_text, description=description)
    
    return jsonify({"summary": summary}), 200
