import os
from dotenv import load_dotenv

# This line finds and loads the variables from your .env file
load_dotenv()

class Config:
    """Holds all configuration variables for the application."""
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
