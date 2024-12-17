import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from backend.models.photo import Photo, db
from backend.models.posts import Post

photos_bp = Blueprint('photos', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@photos_bp.route('', methods=['GET'])
def get_photos():
    """Retrieve all photos."""
    photos = Photo.query.all()
    photos_list = [{'id': photo.id, 'url': photo.url, 'post_id': photo.post_id, 'user_id': photo.user_id} for photo in photos]
    return jsonify(photos_list)

@photos_bp.route('/<int:photo_id>', methods=['GET'])
def get_photo(photo_id):
    """Retrieve a single photo by ID."""
    photo = Photo.query.get(photo_id)
    if not photo:
        return jsonify({'error': 'Photo not found'}), 404
    photo_data = {'id': photo.id, 'url': photo.url, 'post_id': photo.post_id, 'user_id': photo.user_id}
    return jsonify(photo_data)

@photos_bp.route('', methods=['POST'])
def upload_photo():
    """Upload a photo and associate it with a post."""
    # Check for file
    if 'photo' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    post_id = request.form.get('post_id')
    user_id = request.form.get('user_id')

    # Validate required fields
    if not post_id or not user_id:
        return jsonify({'error': 'post_id and user_id are required'}), 400

    # Check if the post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    try:
        # Secure the filename
        filename = secure_filename(file.filename)

        # Set upload folder and save file
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)  # Ensure the folder exists

        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        # Optional: Store relative path if preferred
        relative_path = os.path.relpath(filepath, start=os.getcwd())

        # Add photo to the database
        new_photo = Photo(url=relative_path, post_id=post_id, user_id=user_id)
        db.session.add(new_photo)
        db.session.commit()

        return jsonify({
            'message': 'Photo uploaded successfully!',
            'photo_id': new_photo.id,
            'photo_url': relative_path
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error uploading photo', 'details': str(e)}), 500

@photos_bp.route('/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """Delete a photo by ID."""
    photo = Photo.query.get(photo_id)
    if not photo:
        return jsonify({'error': 'Photo not found'}), 404

    # Remove the file from the file system
    try:
        if os.path.exists(photo.url):
            os.remove(photo.url)
    except Exception as e:
        return jsonify({'error': 'Error deleting photo file', 'details': str(e)}), 500

    # Remove the photo from the database
    try:
        db.session.delete(photo)
        db.session.commit()
        return jsonify({'message': 'Photo deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error deleting photo', 'details': str(e)}), 500
