from flask import Blueprint, request, jsonify
from backend.models.tags import Tag, db
from backend.models.posts import Post

# Define the Blueprint for tag routes
tags_bp = Blueprint('tags', __name__)

@tags_bp.route('', methods=['GET'])
def get_tags():
    """Retrieve all tags."""
    tags = Tag.query.all()
    tags_list = [{'id': tag.id, 'name': tag.name, 'user_id': tag.user_id} for tag in tags]
    return jsonify(tags_list)

@tags_bp.route('/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    """Retrieve a specific tag by ID."""
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    tag_data = {'id': tag.id, 'name': tag.name, 'user_id': tag.user_id}
    return jsonify(tag_data)

@tags_bp.route('', methods=['POST'])
def create_tag():
    """Create a new tag."""
    data = request.get_json()
    if not data.get('name') or not data.get('user_id'):
        return jsonify({'error': 'Name and user_id are required'}), 400

    new_tag = Tag(name=data['name'], user_id=data['user_id'])
    try:
        db.session.add(new_tag)
        db.session.commit()
        return jsonify({'message': 'Tag created successfully!', 'tag_id': new_tag.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creating tag', 'details': str(e)}), 500

@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    """Delete a tag by ID."""
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    try:
        db.session.delete(tag)
        db.session.commit()
        return jsonify({'message': 'Tag deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error deleting tag', 'details': str(e)}), 500

@tags_bp.route('/<int:tag_id>/associate/<int:post_id>', methods=['POST'])
def associate_tag_with_post(tag_id, post_id):
    """Associate a tag with a post."""
    tag = Tag.query.get(tag_id)
    post = Post.query.get(post_id)

    if not tag:
        return jsonify({'error': 'Tag not found'}), 404
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    try:
        post.tags.append(tag)
        db.session.commit()
        return jsonify({'message': 'Tag associated with post successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error associating tag with post', 'details': str(e)}), 500
