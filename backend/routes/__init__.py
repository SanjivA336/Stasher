from backend.database import *
from backend.models import *

def changes_to_string(changes: dict) -> str:
    messages = []
    for field, (old, new) in changes.items():
        messages.append(f"- **{field}** changed from '{old}' to '{new}'")
    return "\n".join(messages)

def get_current_member(user: User, stash_id: str) -> Member:
    members = REPO.MEMBERS.query([("owner_user_id", "==", user.id), ("stash_id", "==", stash_id), ("is_active", "==", True)])
    if not members:
        raise HTTPException(status_code=404, detail="You do not have access to this stash.")
    
    return members[0]