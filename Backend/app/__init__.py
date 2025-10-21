import os
from flask import Flask
from flask_cors import CORS
from .routes import api_blueprint

def create_app():
    """Flask application factory."""
    app = Flask(__name__)
    
    # Enable Cross-Origin Resource Sharing (CORS).
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Load configuration from the config.py file
    app.config.from_object('config.Config')

    # Register the blueprint that contains all our API routes
    # All routes defined in routes.py will be prefixed with /api
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    # Create the 'uploads' and 'vector_stores' directories if they don't exist
    # This prevents errors on the first run.
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('vector_stores', exist_ok=True)
    
    return app
