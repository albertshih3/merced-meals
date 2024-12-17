from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.models.user import User, db

# Define the Blueprint for user routes
users_bp = Blueprint('users', __name__)

# ---------------- Existing Routes ----------------

@users_bp.route('', methods=['GET'])
def get_users():
    """Retrieve a list of all users."""
    users = User.query.all()
    users_list = [{'id': user.id, 'name': user.name, 'email': user.email} for user in users]
    return jsonify(users_list)

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Retrieve details of a single user by ID."""
    user = User.query.get(user_id)
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    user_data = {'id': user.id, 'name': user.name, 'email': user.email}
    return jsonify(user_data)

@users_bp.route('', methods=['POST'])
def create_user():
    """Create a new user."""
    data = request.get_json()
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = User(name=data['name'], email=data['email'], password_hash=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creating user', 'details': str(e)}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user by ID."""
    user = User.query.get(user_id)
    if user is None:
        return jsonify({'error': 'User not found'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error deleting user', 'details': str(e)}), 500

# ---------------- New Login and Register Routes ----------------

@users_bp.route('/register', methods=['POST'])
def register_user():
    """Register a new user."""
    data = request.get_json()
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    # Check if the email is already in use
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Hash the password and create the user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(name=data['name'], email=data['email'], password_hash=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error during registration', 'details': str(e)}), 500

@users_bp.route('/login', methods=['POST'])
def login_user():
    """Login a user and return an access token."""
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Validate the user's credentials
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create an access token for the user
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        }
    }), 200
