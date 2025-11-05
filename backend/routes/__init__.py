from backend.database import *
from backend.models import *

def changes_to_string(changes: dict) -> str:
    messages = []
    for field, (old, new) in changes.items():
        messages.append(f"- **{field}** changed from '{old}' to '{new}'")
    return "\n".join(messages)

from .container_routes import router as container_router
from .identity_routes import router as identity_router
from .inventory_routes import router as inventory_router

__all__ = [
    "container_router",
    "identity_router",
    "inventory_router",
]