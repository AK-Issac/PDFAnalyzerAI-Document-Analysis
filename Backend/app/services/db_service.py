import psycopg2
import json
import uuid
from psycopg2.extras import RealDictCursor
import os

# Get the Database URL from environment variables, or use the local Docker one as fallback
DB_URL = os.environ.get("DATABASE_URL", "postgresql://admin:adminpassword@localhost:5432/legalai_db")

def get_db_connection():
    """Helper function to get a database connection."""
    return psycopg2.connect(DB_URL)

# --- AUTHENTICATION & USERS ---

def create_user(email: str, password_hash: str) -> dict:
    """Creates a new user securely."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            user_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO users (id, email, password_hash, is_onboarded)
                VALUES (%s, %s, %s, FALSE)
                RETURNING id, email, is_onboarded
            """, (user_id, email, password_hash))
            user = cursor.fetchone()
        conn.commit()
        return user
    finally:
        conn.close()

def get_user_by_email(email: str) -> dict:
    """Retrieves a user by email for login verification."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, email, password_hash, is_onboarded FROM users WHERE email = %s", (email,))
            return cursor.fetchone()
    finally:
        conn.close()

def update_user_profile(user_id: str, first_name: str, last_name: str, company: str, role: str, bio: str) -> dict:
    """Updates a user profile and marks them as onboarded."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                UPDATE users 
                SET first_name = %s, last_name = %s, company = %s, role = %s, bio = %s, is_onboarded = TRUE
                WHERE id = %s
                RETURNING id, email, is_onboarded
            """, (first_name, last_name, company, role, bio, user_id))
            user = cursor.fetchone()
        conn.commit()
        return user
    finally:
        conn.close()

def get_user_profile(user_id: str) -> dict:
    """Retrieves a user's full profile data."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT id, email, first_name, last_name, company, role, bio, is_onboarded, tier 
                FROM users 
                WHERE id = %s
            """, (user_id,))
            return cursor.fetchone()
    finally:
        conn.close()

# --- USAGE & LIMITS ---

def log_usage(user_id: str, action_type: str):
    """Logs an action performed by the user for billing/limits."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            log_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO usage_logs (id, user_id, action_type)
                VALUES (%s, %s, %s)
            """, (log_id, user_id, action_type))
        conn.commit()
    finally:
        conn.close()

def get_user_usage(user_id: str, tier: str) -> dict:
    """Calculates current document and action counts based on tier rules."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            if tier == 'free':
                # Free tier is absolute total
                cursor.execute("SELECT COUNT(*) FROM documents WHERE user_id = %s", (user_id,))
                doc_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM usage_logs WHERE user_id = %s", (user_id,))
                action_count = cursor.fetchone()[0]
            else:
                # Pro/Business tier is per month
                cursor.execute("""
                    SELECT COUNT(*) FROM documents 
                    WHERE user_id = %s AND created_at >= date_trunc('month', CURRENT_DATE)
                """, (user_id,))
                doc_count = cursor.fetchone()[0]
                
                cursor.execute("""
                    SELECT COUNT(*) FROM usage_logs 
                    WHERE user_id = %s AND created_at >= date_trunc('month', CURRENT_DATE)
                """, (user_id,))
                action_count = cursor.fetchone()[0]
                
            return {
                "doc_count": doc_count,
                "action_count": action_count
            }
    finally:
        conn.close()

# --- WORKSPACE & DOCUMENTS ---

def save_document(doc_id: str, title: str, file_data: bytes, user_id: str, folder_id: str = None):
    """Saves a new document to the database."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO documents (id, user_id, folder_id, title, file_data)
                VALUES (%s, %s, %s, %s, %s)
            """, (doc_id, user_id, folder_id, title, psycopg2.Binary(file_data)))
        conn.commit()
    finally:
        conn.close()

def create_chat(chat_id: str, doc_id: str, title: str, user_id: str):
    """Creates a new chat session for a document strictly isolated to the user."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Enforce Isolation: Ensure the document belongs to the user before creating a chat
            cursor.execute("SELECT id FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
            if not cursor.fetchone():
                raise ValueError("Unauthorized document access")

            cursor.execute("""
                INSERT INTO chats (id, user_id, document_id, title)
                VALUES (%s, %s, %s, %s)
            """, (chat_id, user_id, doc_id, title))
        conn.commit()
    finally:
        conn.close()

def save_message(chat_id: str, role: str, content: str, user_id: str, sources=None):
    """Saves a single message (user or AI) to the database, ensuring chat belongs to user."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Enforce Isolation
            cursor.execute("SELECT id FROM chats WHERE id = %s AND user_id = %s", (chat_id, user_id))
            if not cursor.fetchone():
                 raise ValueError("Unauthorized chat access")

            msg_id = str(uuid.uuid4())
            sources_json = json.dumps(sources) if sources else None
            
            cursor.execute("""
                INSERT INTO messages (id, chat_id, role, content, sources)
                VALUES (%s, %s, %s, %s, %s)
            """, (msg_id, chat_id, role, content, sources_json))
        conn.commit()
    finally:
        conn.close()

def get_workspace_data(user_id: str):
    """Retrieves all folders and documents explicitly for a user."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, name, parent_id FROM folders WHERE user_id = %s", (user_id,))
            folders = cursor.fetchall()

            # We don't select file_data here because it's too large and unnecessary for the sidebar
            cursor.execute("SELECT id, title, folder_id FROM documents WHERE user_id = %s", (user_id,))
            documents = cursor.fetchall()
            
            return {"folders": folders, "documents": documents}
    finally:
        conn.close()

def get_messages(chat_id: str, user_id: str):
    """Retrieves all messages for a given chat securely."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Enforce Isolation: Ensure user owns chat before returning messages
            cursor.execute("SELECT id FROM chats WHERE id = %s AND user_id = %s", (chat_id, user_id))
            if not cursor.fetchone():
                 return [] # unauthorized or not found

            cursor.execute("SELECT id, role, content, created_at, sources FROM messages WHERE chat_id = %s ORDER BY created_at ASC", (chat_id,))
            return cursor.fetchall()
    finally:
        conn.close()

def create_folder(name: str, user_id: str):
    """Creates a new folder for the user."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            folder_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO folders (id, user_id, name)
                VALUES (%s, %s, %s) RETURNING id
            """, (folder_id, user_id, name))
        conn.commit()
        return folder_id
    finally:
        conn.close()

def delete_document(doc_id: str, user_id: str):
    """Deletes a document strictly for the authorized user."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Thanks to ON DELETE CASCADE on chats and messages, we only need to delete the doc
            cursor.execute("DELETE FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
        conn.commit()
    finally:
        conn.close()

def get_document_file(doc_id: str, user_id: str):
    """Retrieves the binary file data of an authorized document."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT file_data FROM documents WHERE id = %s AND user_id = %s", (doc_id, user_id))
            row = cursor.fetchone()
            if row:
                return row['file_data']
            return None
    finally:
        conn.close()

def get_chat_for_document(doc_id: str, user_id: str):
    """Retrieves the chat associated with an authorized document."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id FROM chats WHERE document_id = %s AND user_id = %s ORDER BY created_at DESC LIMIT 1", (doc_id, user_id))
            row = cursor.fetchone()
            if row:
                return row['id']
            return None
    finally:
        conn.close()

def move_document(doc_id: str, folder_id: str, user_id: str):
    """Moves a document to a different folder (or root if folder_id is None)."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE documents 
                SET folder_id = %s 
                WHERE id = %s AND user_id = %s
            """, (folder_id, doc_id, user_id))
        conn.commit()
    finally:
        conn.close()

def delete_folder(folder_id: str, user_id: str):
    """Deletes a folder and all documents inside it."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Delete documents inside the folder first (since ON DELETE SET NULL is in the schema)
            cursor.execute("DELETE FROM documents WHERE folder_id = %s AND user_id = %s", (folder_id, user_id))
            # Then delete the folder
            cursor.execute("DELETE FROM folders WHERE id = %s AND user_id = %s", (folder_id, user_id))
        conn.commit()
    finally:
        conn.close()


# --- STRIPE BILLING ---

def get_stripe_customer_id(user_id: str) -> str | None:
    """Retrieves the Stripe customer ID for a given user, if it exists."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT stripe_customer_id FROM users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
            if row:
                return row[0]
            return None
    finally:
        conn.close()

def save_stripe_customer_id(user_id: str, stripe_customer_id: str):
    """Persists the Stripe customer ID onto the user record after first checkout creation."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE users SET stripe_customer_id = %s WHERE id = %s",
                (stripe_customer_id, user_id)
            )
        conn.commit()
    finally:
        conn.close()

def update_user_tier(stripe_customer_id: str, new_tier: str):
    """
    Called exclusively by the Stripe webhook to update a user's plan.
    This is the single source of truth for plan status — the backend never
    trusts the frontend to report the current plan.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE users SET tier = %s WHERE stripe_customer_id = %s",
                (new_tier, stripe_customer_id)
            )
        conn.commit()
    finally:
        conn.close()