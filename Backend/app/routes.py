import os
import uuid
import io
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash

# IMPORT THE NEW DB SERVICE HERE:
from .services import pdf_processor, vector_store, ai_service, db_service

api_blueprint = Blueprint('api', __name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
SECRET_KEY = os.environ.get("SECRET_KEY", "legalai_super_secret_dev_key_2026") # Fallback to same key in dev

# --- AUTHENTICATION MIDDLEWARE ---

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401
            
        return f(current_user_id, *args, **kwargs)
    
    return decorated

# --- AUTH ENDPOINTS ---

@api_blueprint.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
        
    # Check if user exists
    existing_user = db_service.get_user_by_email(email)
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400
        
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    
    try:
        user = db_service.create_user(email, hashed_password)
        # Create token
        token = jwt.encode({
            'user_id': user['id'],
            'is_onboarded': user['is_onboarded'],
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({'token': token}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_blueprint.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
         return jsonify({'error': 'Could not verify'}), 401
         
    user = db_service.get_user_by_email(email)
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': user['id'],
        'is_onboarded': user['is_onboarded'],
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({'token': token}), 200

@api_blueprint.route('/user/onboard', methods=['POST'])
@auth_required
def onboard_user(current_user_id):
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    company = data.get('company')
    role = data.get('role')
    bio = data.get('bio')

    if not first_name or not last_name:
        return jsonify({"error": "First name and last name are required"}), 400

    try:
        user = db_service.update_user_profile(
            user_id=current_user_id,
            first_name=first_name,
            last_name=last_name,
            company=company,
            role=role,
            bio=bio
        )
        
        token = jwt.encode({
            'user_id': user['id'],
            'is_onboarded': user['is_onboarded'],
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({'token': token, 'message': 'Onboarding complete'}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DATA ENDPOINTS ---

@api_blueprint.route('/upload', methods=['POST'])
@auth_required
def upload_file(current_user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file.content_length and file.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File too large (max 10MB)"}), 400

    if file and file.filename.endswith('.pdf'):
        doc_id = str(uuid.uuid4())
        chat_id = str(uuid.uuid4()) # Create a unique ID for the first chat
        
        # We also support a folder_id if it's passed in the form (optional)
        folder_id = request.form.get('folder_id')
        if folder_id == 'null' or not folder_id:
            folder_id = None

        os.makedirs('uploads', exist_ok=True)
        filepath = os.path.join('uploads', f"{doc_id}.pdf")

        # Read binary data for postgres
        file_data = file.read()
        
        # Write to temp file for LangChain
        with open(filepath, 'wb') as f:
            f.write(file_data)
        
        print(f"[INFO] Processing document {doc_id} for user {current_user_id}")

        try:
            # 1. Process AI chunks and embeddings isolated by user
            chunks = pdf_processor.process_pdf(filepath)
            vector_store.create_and_store_embeddings(doc_id, current_user_id, chunks)

            # 2. SAVE TO POSTGRES DATABASE
            db_service.save_document(doc_id=doc_id, title=file.filename, file_data=file_data, user_id=current_user_id, folder_id=folder_id)
            db_service.create_chat(chat_id=chat_id, doc_id=doc_id, title=f"Chat for {file.filename}", user_id=current_user_id)

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # 3. CLEAN UP DISK SPACE (CRUCIAL)
            if os.path.exists(filepath):
                os.remove(filepath)

        return jsonify({
            "message": "File processed",
            "doc_id": doc_id,
            "chat_id": chat_id # Return chat_id to the frontend
        }), 200

    return jsonify({"error": "Invalid file type"}), 400


@api_blueprint.route('/query', methods=['POST'])
@auth_required
def query_document(current_user_id):
    data = request.get_json()
    doc_id = data.get('doc_id')
    question = data.get('question')
    chat_id = data.get('chat_id') # We need chat_id to know where to save the messages

    if not doc_id or not question or not chat_id:
        return jsonify({"error": "Missing fields (doc_id, chat_id, or question)"}), 400

    try:
        # 1. SAVE USER'S QUESTION TO POSTGRES
        db_service.save_message(chat_id=chat_id, role='user', content=question, user_id=current_user_id)

        # 2. GET AI ANSWER FROM ISOLATED FAISS DB
        relevant_chunks = vector_store.retrieve_relevant_chunks(doc_id, current_user_id, question)
        answer = ai_service.get_answer_from_llm(relevant_chunks, question)

        sources = [
            {
                "text": chunk.page_content,
                "page": chunk.metadata.get("page"),
                "chunk_id": chunk.metadata.get("chunk_id")
            }
            for chunk in relevant_chunks
        ]

        # 3. SAVE AI'S ANSWER AND SOURCES TO POSTGRES
        db_service.save_message(chat_id=chat_id, role='assistant', content=answer, user_id=current_user_id, sources=sources)

        return jsonify({
            "answer": answer,
            "sources": sources
        }), 200

    except FileNotFoundError:
        return jsonify({"error": "Document not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_blueprint.route('/summarize', methods=['POST'])
@auth_required
def summarize_text(current_user_id):
    # Isolated by auth_required but uses general text context
    data = request.get_json()
    text = data.get('text')
    description = data.get('description', "")

    if not text:
        return jsonify({"error": "Text required"}), 400

    summary = ai_service.summarize_text(text, description)

    return jsonify({"summary": summary}), 200

# --- FULL STACK ENDPOINTS ---

@api_blueprint.route('/workspace', methods=['GET'])
@auth_required
def get_workspace(current_user_id):
    try:
        data = db_service.get_workspace_data(user_id=current_user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/folder', methods=['POST'])
@auth_required
def create_folder(current_user_id):
    data = request.get_json()
    name = data.get('name')
    if not name:
         return jsonify({"error": "Folder name required"}), 400
    try:
        folder_id = db_service.create_folder(name, user_id=current_user_id)
        return jsonify({"folder_id": folder_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/chat/<doc_id>', methods=['GET'])
@auth_required
def get_chat_for_document(current_user_id, doc_id):
    try:
        chat_id = db_service.get_chat_for_document(doc_id, user_id=current_user_id)
        if not chat_id:
            # If no chat exists, create a default one securely
            chat_id = str(uuid.uuid4())
            db_service.create_chat(chat_id=chat_id, doc_id=doc_id, title=f"Chat session", user_id=current_user_id)
        return jsonify({"chat_id": chat_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/messages/<chat_id>', methods=['GET'])
@auth_required
def get_messages(current_user_id, chat_id):
    try:
        messages = db_service.get_messages(chat_id, user_id=current_user_id)
        return jsonify({"messages": messages}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/document/<doc_id>', methods=['DELETE'])
@auth_required
def delete_document(current_user_id, doc_id):
    try:
        db_service.delete_document(doc_id, user_id=current_user_id)
        return jsonify({"message": "Document deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_blueprint.route('/document/<doc_id>', methods=['GET'])
@auth_required
def serve_document(current_user_id, doc_id):
    try:
        file_data = db_service.get_document_file(doc_id, user_id=current_user_id)
        if not file_data:
            return jsonify({"error": "Document not found"}), 404
        
        return send_file(
            io.BytesIO(file_data),
            mimetype='application/pdf',
            as_attachment=False,
            download_name=f"{doc_id}.pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500