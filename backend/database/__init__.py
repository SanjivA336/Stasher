# backend/database/__init__.py

# Allows batch imports from the database package.
from .firestore import fs

# Pre-configured repository instances for each model.
from repos import REPO

# Defines all for database package.
__all__ = [
    "fs",
    "REPO"
]

