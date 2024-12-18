from flask import Blueprint, request, jsonify
from backend.models.posts import Post, db
from backend.models.user import User  # Add this import
from backend.models.photo import Photo

# Define the Blueprint for post routes
posts_bp = Blueprint('posts', __name__)

@posts_bp.route('', methods=['GET'])
def get_posts():
    """Retrieve all posts with their associated photos and user information."""
    posts = Post.query.all()
    posts_list = []
    
    for post in posts:
        # Get the associated photo
        photo = Photo.query.filter_by(post_id=post.id).first()
        # Get the user information
        user = User.query.get(post.user_id)
        
        post_dict = {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'upvotes': post.upvotes,
            'downvotes': post.downvotes,
            'user': {
                'name': user.name if user else 'Unknown',
                'email': user.email if user else ''
            },
            'image_url': f'/api/photos/file/{photo.url}' if photo else None
        }
        posts_list.append(post_dict)
    
    return jsonify(posts_list)

@posts_bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Retrieve a single post by ID."""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    post_data = {
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'upvotes': post.upvotes,
        'downvotes': post.downvotes,
        'user_id': post.user_id
    }
    return jsonify(post_data)

@posts_bp.route('', methods=['POST'])
def create_post():
    """Create a new post."""
    data = request.get_json()
    if not data.get('title') or not data.get('content') or not data.get('user_id'):
        return jsonify({'error': 'Title, content, and user_id are required'}), 400

    new_post = Post(
        title=data['title'],
        content=data['content'],
        user_id=data['user_id']
    )
    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({
            'message': 'Post created successfully!',
            'id': new_post.id,  # Return the ID of the newly created post
            'data': {
                'id': new_post.id,
                'title': new_post.title,
                'content': new_post.content,
                'user_id': new_post.user_id
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creating post', 'details': str(e)}), 500

@posts_bp.route('/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Update a post by ID."""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    data = request.get_json()
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)

    try:
        db.session.commit()
        return jsonify({'message': 'Post updated successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error updating post', 'details': str(e)}), 500

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post by ID."""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    try:
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error deleting post', 'details': str(e)}), 500

@posts_bp.route('/<int:post_id>/upvote', methods=['POST'])
def upvote_post(post_id):
    """Upvote a post by ID."""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    post.upvotes += 1
    try:
        db.session.commit()
        return jsonify({'message': 'Post upvoted successfully!', 'upvotes': post.upvotes}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error upvoting post', 'details': str(e)}), 500

@posts_bp.route('/<int:post_id>/downvote', methods=['POST'])
def downvote_post(post_id):
    """Downvote a post by ID."""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    post.downvotes += 1
    try:
        db.session.commit()
        return jsonify({'message': 'Post downvoted successfully!', 'downvotes': post.downvotes}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error downvoting post', 'details': str(e)}), 500
