import os
from flask import Flask
from flask_cors import CORS
from .routes import api_blueprint

def create_app():
    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.config.from_object('config.Config')

    app.register_blueprint(api_blueprint, url_prefix='/api')

    os.makedirs('uploads', exist_ok=True)
    os.makedirs('vector_stores', exist_ok=True)

    return app