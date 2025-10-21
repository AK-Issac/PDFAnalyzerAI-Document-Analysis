from app import create_app

# Create the Flask app instance using our factory function
app = create_app()

if __name__ == '__main__':
    # This block runs the server when you execute `python run.py`
    # It will be accessible on your local network at port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
