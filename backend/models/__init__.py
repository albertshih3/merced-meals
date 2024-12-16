from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_app(app):
    db.init_app(app)

# Explicitly import all models
from .user import User
from .posts import Post
from .tags import Tag
from .photo import Photo
