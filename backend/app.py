import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from backend.models import init_app, db
from backend.models import user, posts, tags, photo  # Explicit imports
from backend.routes.users import users_bp
from backend.routes.posts import posts_bp
from backend.routes.tags import tags_bp
from backend.routes.photos import photos_bp


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_app():
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    # Default configuration
    app.config.from_mapping(
        SECRET_KEY='mealsonwheels',
        SQLALCHEMY_DATABASE_URI='sqlite:///mealdb.sqlite',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        DATABASE=os.path.join(app.instance_path, 'mealdb.sqlite'),
        UPLOAD_FOLDER=UPLOAD_FOLDER,
    )

    # Override configuration from a config file if it exists
    app.config.from_pyfile('config.py', silent=True)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Ensure the upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    init_app(app)

    # Create the database tables
    with app.app_context():
        print("SQLAlchemy metadata tables:", db.metadata.tables.keys())
        db.create_all()
        print("Database tables created!")
        
        
    # Register route blueprints
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(tags_bp, url_prefix='/api/tags')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')

    # Simple route for testing
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    @app.route('/upload', methods=['POST'])
    def upload_photo():
        if 'photo' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['photo']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Add database logic here if needed

            return jsonify({"message": "Photo uploaded", "photo_url": filepath}), 201

        return jsonify({"error": "Invalid file type"}), 400

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
