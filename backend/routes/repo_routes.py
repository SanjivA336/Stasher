import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.routes.auth_routes import get_current_user, hash_password, verify_password
from backend.database.repos import user_repo, member_repo, stash_repo, storage_repo, label_repo, item_repo, order_repo, event_repo
from backend.models import *
from backend.routes._schemas import *
from backend.database.firestore_wrapper import firestore_wrapper

# region === Config === ===
router = APIRouter()


#endregion

# region === Helper Methods === ===
def get_current_member(user: User, stash_id: str) -> Member:
    members = member_repo.query([("owner_user_id", "==", user.id), ("stash_id", "==", stash_id), ("is_active", "==", True)])
    if not members:
        raise HTTPException(status_code=404, detail="You do not have access to this stash.")
    
    return members[0]

def changes_to_string(changes: dict) -> str:
    messages = []
    for field, (old, new) in changes.items():
        messages.append(f"- **{field}** changed from '{old}' to '{new}'")
    return "\n".join(messages)
# endregion

# region === Current API === ===
@router.get("/current/user", response_model=User)
async def get_current_user_route(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/current/members/active", response_model=List[Member])
async def get_current_active_members(current_user: User = Depends(get_current_user)):
    return current_user.get_active_members()

@router.get("/current/stashes/active", response_model=List[Stash])
async def get_current_active_stashes(current_user: User = Depends(get_current_user)):
    members = current_user.get_active_members()
    stash_ids = [member.stash_id for member in members]
    return stash_repo.query([("id", "in", stash_ids)])

@router.get("/current/can_access/{stash_id}", response_model=bool)
async def check_access(stash_id: str, current_user: User = Depends(get_current_user)):
    members = member_repo.query([("owner_user_id", "==", current_user.id), ("stash_id", "==", stash_id), ("is_active", "==", True)])
    return len(members) > 0
# endregion

# region === User API === ===
@router.get("/user/template", response_model=UserProtected)
def user_get_template():
    raise HTTPException(status_code=200, detail="No template available for User.")

@router.post("/user", response_model=UserProtected)
def user_create(payload: UserPayload):
    raise HTTPException(status_code=200, detail="User creation is handled in auth routes.")

@router.get("/user/{user_id}", response_model=UserProtected)
def user_get(user_id: str, current_user: User = Depends(get_current_user)):
    if (user := user_repo.get(user_id)):
        return user
    raise HTTPException(status_code=404, detail="User not found.")

@router.patch("/user", response_model=UserProtected)
def user_update(payload: UserPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="User ID is required in payload for update.")

    if not current_user.id == payload.id:
        raise HTTPException(status_code=403, detail="You can only update your own user information.")

    user = user_repo.get(payload.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if payload.password_new:
        if not payload.password_current:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        
        if not verify_password(payload.password_current, user.password_hashed):
            raise HTTPException(status_code=403, detail="Current password is incorrect.")
        
        if payload.password_new == payload.password_current:
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password.")
        
        user.password_hashed = hash_password(payload.password_new)
    
    if payload.email and payload.email != user.email:
        if len(user_repo.query([('email','==', payload.email.strip().lower())])) > 0:
            raise HTTPException(status_code=400, detail="An account with that email already exists.")

    updated_user = payload.to_model(user, preserve=True)
    
    if not (changes := user.diff(updated_user)):
        return user

    if (updated_user := user_repo.update(updated_user)):
        return updated_user
    raise HTTPException(status_code=500, detail="User update failed.")

@router.delete("/user/{user_id}", response_model=bool)
def user_delete(user_id: str, current_user: User = Depends(get_current_user)):
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own user account.")
    
    batch = firestore_wrapper.create_batch()
    
    user.purge(batch)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="User deletion failed.")

# User-Specific APIs

@router.get("/user/{user_id}/members/{filter}", response_model=List[Member])
def user_get_members(user_id: str, filter: str, current_user: User = Depends(get_current_user)):
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only access your own members.")

    if filter == "all":
        return user.get_all_members()
    elif filter == "active":
        return user.get_active_members()

@router.get("/user/{user_id}/stashes/{filter}", response_model=List[Stash])
def user_get_stashes(user_id: str, filter: str, current_user: User = Depends(get_current_user)):
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only access your own stashes.")

    if filter == "all":
        return user.get_all_stashes()
    elif filter == "active":
        return user.get_active_stashes()
# endregion

# region === Member API === ===
@router.get("/member/template", response_model=Member)
def member_get_template(current_user: User = Depends(get_current_user)):
    member = Member(
        owner_user_id=current_user.id,
        stash_id="",
        nickname=current_user.username or "New Member",
        debts={},
        is_admin=False,
        is_active=True
    )
    return member

@router.post("/member", response_model=Member)
def member_create(payload: MemberPayload, current_user: User = Depends(get_current_user)):
    raise HTTPException(status_code=200, detail="Member creation is not supported directly. Create or join a stash to automatically create a member.")

@router.get("/member/{member_id}", response_model=Member)
def member_get(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    return member

@router.patch("/member", response_model=Member)
def member_update(payload: MemberPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Member ID is required in payload for update.")
    
    member = member_repo.get(payload.id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    current_member = get_current_member(current_user, member.stash_id)
    if not current_member:
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        if current_member.id != member.id:
            raise HTTPException(status_code=403, detail="Only admins can update other members.")
        
        if payload.is_admin is not None and payload.is_admin != member.is_admin:
            raise HTTPException(status_code=403, detail="Only admins can change admin status.")

    updated_member = payload.to_model(member, preserve=True)
    
    if not (changes := member.diff(updated_member)):
        return member
    
    event = Event(
        stash_id=member.stash_id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Member '{member.nickname}' Updated",
        message=changes_to_string(changes)
    )
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    member_repo.batch_update(batch, updated_member)

    if firestore_wrapper.commit_batch(batch):
        return updated_member
    raise HTTPException(status_code=500, detail="Member update failed.")

@router.delete("/member/{member_id}", response_model=bool)
def member_delete(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    current_member = get_current_member(current_user, member.stash_id)
    if not current_member:
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete members.")
    
    if member.id == current_member.id:
        raise HTTPException(status_code=403, detail="You cannot delete your own member account.")

    batch = firestore_wrapper.create_batch()
    
    member.purge(batch, current_member.id)
    
    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Member deletion failed.")

# Member-Specific APIs

@router.get("/member/{member_id}/user", response_model=UserProtected)
def member_get_user(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    user = member.get_owner
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user

@router.get("/member/{member_id}/stash", response_model=Stash)
def member_get_stash(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    stash = member.get_stash
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    return stash

@router.get("/member/{member_id}/items/{filter}", response_model=List[Item])
def member_get_items(member_id: str, filter: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if filter == "bought":
        return member.get_bought_items()
    elif filter == "used":
        return member.get_used_items()

@router.get("/member/{member_id}/orders", response_model=List[Order])
def member_get_orders(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return member.get_orders()

@router.get("/member/{member_id}/events", response_model=List[Event])
def member_get_events(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return member.get_events()
# endregion

# region === Stash API === ===
@router.get("/stash/template", response_model=Stash)
def stash_get_template(current_user: User = Depends(get_current_user)):
    stash = Stash(
        name="My Stash",
        address=None,
        member_ids=[],
        storage_ids=[],
        label_ids=[],
        join_code="",
    )
    return stash

@router.post("/stash", response_model=Stash)
def stash_create(payload: StashPayload, current_user: User = Depends(get_current_user)):
    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Stash name is required.")
    
    payload.join_code = uuid.uuid4().hex[:8].strip().upper()
    while len(stash_repo.query([("join_code", "==", payload.join_code)])) > 0:
        payload.join_code = uuid.uuid4().hex[:8].strip().upper()

    stash = Stash(
        name=payload.name.strip(),
        address=payload.address or None,
        member_ids=[],
        storage_ids=[],
        label_ids=[],
        join_code=payload.join_code
    )
    
    member = Member(
        owner_user_id=current_user.id,
        stash_id=stash.id,
        nickname=current_user.username or "Primary User",
        debts={},
        is_admin=True,
        is_active=True
    )
    
    storage = Storage(
        name="My Storage",
        stash_id=stash.id,
        type=StorageType.PANTRY,
        description="My first storage. I can edit its details later in its settings.",
        item_ids=[]
    )
    
    event = Event(
        stash_id=stash.id,
        member_id=member.id,
        type=EventType.SUCCESS,
        title="Stash Created",
        message=f"Stash '{stash.name}' created with join code '{stash.join_code}'."
    )
    
    current_user.member_ids.append(member.id)
    
    stash.member_ids.append(member.id)
    stash.storage_ids.append(storage.id)
    
    batch = firestore_wrapper.create_batch()
    
    stash_repo.batch_add(batch, stash)
    member_repo.batch_add(batch, member)
    event_repo.batch_add(batch, event)
    user_repo.batch_update(batch, current_user)
    
    if firestore_wrapper.commit_batch(batch):
        return stash
    raise HTTPException(status_code=500, detail="Stash creation failed.")

@router.get("/stash/{stash_id}", response_model=Stash)
def stash_get(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.patch("/stash", response_model=Stash)
def stash_update(payload: StashPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required in payload for update.")
    
    stash = stash_repo.get(payload.id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update the stash.")

    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Stash name is required.")

    updated_stash = payload.to_model(stash, preserve=True)
    
    if not (changes := stash.diff(updated_stash)):
        return stash
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Stash '{stash.name}' Updated",
        message=changes_to_string(changes)
    )

    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    stash_repo.batch_update(batch, updated_stash)

    if firestore_wrapper.commit_batch(batch):
        return stash
    raise HTTPException(status_code=500, detail="Stash update failed.")

@router.delete("/stash/{stash_id}", response_model=bool)
def stash_delete(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete the stash.")

    batch = firestore_wrapper.create_batch()

    stash.purge(batch)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Stash deletion failed.")

# Stash-Specific APIs

@router.get("/stash/{stash_id}/labels", response_model=List[Label])
def stash_get_labels(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_labels()

@router.get("/stash/{stash_id}/storages", response_model=List[Storage])
def stash_get_storages(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_storages()

@router.get("/stash/{stash_id}/members/{filter}", response_model=List[Member])
def stash_get_members(stash_id: str, filter: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if filter == "all":
        return stash.get_all_members()
    elif filter == "active":
        return stash.get_active_members()

@router.get("/stash/{stash_id}/orders", response_model=List[Order])
def stash_get_orders(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_orders()

@router.get("/stash/{stash_id}/events", response_model=List[Event])
def stash_get_events(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_events()

@router.get("/stash/{stash_id}/items", response_model=List[Item])
def stash_get_items(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = stash_repo.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_items()
# endregion

# region === Storage API === ===
@router.get("/storage/template", response_model=Storage)
def storage_get_template(current_user: User = Depends(get_current_user)):
    storage = Storage(
        name="My Storage",
        stash_id="",
        type=StorageType.PANTRY,
        description="A storage for my food.",
        item_ids=[]
    )
    return storage

@router.post("/storage", response_model=Storage)
def storage_create(payload: StoragePayload, current_user: User = Depends(get_current_user)):
    if not payload.stash_id or payload.stash_id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required.")
    
    stash = stash_repo.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create storages.")
    
    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Storage name is required.")
    
    storage = Storage(
        name=payload.name.strip(),
        stash_id=stash.id,
        type=payload.type or StorageType.PANTRY,
        description=payload.description or None,
        item_ids=[]
    )
    
    stash.storage_ids.append(storage.id)
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title="Storage Created",
        message=f"Storage '{storage.name}' created."
    )
    
    batch = firestore_wrapper.create_batch()
    
    storage_repo.batch_add(batch, storage)
    stash_repo.batch_update(batch, stash)
    event_repo.batch_add(batch, event)
    
    if firestore_wrapper.commit_batch(batch):
        return storage
    raise HTTPException(status_code=500, detail="Storage creation failed.")

@router.get("/storage/{storage_id}", response_model=Storage)
def storage_get(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return storage

@router.patch("/storage", response_model=Storage)
def storage_update(payload: StoragePayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Storage ID is required in payload for update.")
    
    storage = storage_repo.get(payload.id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    updated_storage = payload.to_model(storage, preserve=True)
    
    if not (changes := storage.diff(updated_storage)):
        return storage
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Storage '{storage.name}' Updated",
        message=changes_to_string(changes)
    )
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    storage_repo.batch_update(batch, updated_storage)

    if firestore_wrapper.commit_batch(batch):
        return storage
    raise HTTPException(status_code=500, detail="Storage update failed.")

@router.delete("/storage/{storage_id}", response_model=bool)
def storage_delete(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete storages.")

    batch = firestore_wrapper.create_batch()
    
    storage.purge(batch, current_member.id)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Storage deletion failed.")

# Storage-Specific APIs

@router.get("/storage/{storage_id}/stash", response_model=Stash)
def storage_get_stash(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.get("/storage/{storage_id}/items", response_model=List[Item])
def storage_get_items(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return storage.get_items()

@router.get("/storage/{storage_id}/labels", response_model=List[Label])
def storage_get_default_labels(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return storage.get_labels()
# endregion

# region === Label API === ===
@router.get("/label/template", response_model=Label)
def label_get_template(current_user: User = Depends(get_current_user)):
    label = Label(
        name="My Label",
        preferred_unit="g",
        stash_id="",
        default_storage_id="",
        current_quantity=0,
        item_ids=[],
        food_group=None,
    )
    return label

@router.post("/label", response_model=Label)
def label_create(payload: LabelPayload, current_user: User = Depends(get_current_user)):
    if not payload.stash_id or payload.stash_id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required.")
    
    stash = stash_repo.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
        
    if not payload.default_storage_id or payload.default_storage_id.strip() == "":
        raise HTTPException(status_code=400, detail="Default Storage ID is required.")
    
    storage = storage_repo.get(payload.default_storage_id)
    if not storage or storage.stash_id != stash.id:
        raise HTTPException(status_code=404, detail="Default Storage not found in the specified stash.")
    
    if storage.stash_id != stash.id:
        raise HTTPException(status_code=400, detail="Default Storage does not belong to the specified stash.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Label name is required.")
    
    if not payload.preferred_unit or payload.preferred_unit.strip() == "":
        raise HTTPException(status_code=400, detail="Preferred unit is required.")

    label = Label(
        name=payload.name,
        preferred_unit=payload.preferred_unit,
        stash_id=payload.stash_id,
        default_storage_id=payload.default_storage_id,
        current_quantity=0.0,
        item_ids=[],
        food_group=payload.food_group or None,
    )
    
    stash.label_ids.append(label.id)
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title="Label Created",
        message=f"Label '{label.name}' created."
    )
    
    batch = firestore_wrapper.create_batch()
    
    label_repo.batch_add(batch, label)
    stash_repo.batch_update(batch, stash)
    event_repo.batch_add(batch, event)
    
    if firestore_wrapper.commit_batch(batch):
        return label
    raise HTTPException(status_code=500, detail="Label creation failed.")

@router.get("/label/{label_id}", response_model=Label)
def label_get(label_id: str, current_user: User = Depends(get_current_user)):
    label = label_repo.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return label

@router.patch("/label", response_model=Label)
def label_update(payload: LabelPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Label ID is required in payload for update.")
    
    label = label_repo.get(payload.id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    updated_label = payload.to_model(label, preserve=True)
    
    if not (changes := label.diff(updated_label)):
        return label
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Label '{label.name}' Updated",
        message=changes_to_string(changes)
    )
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    label_repo.batch_update(batch, updated_label)

    if firestore_wrapper.commit_batch(batch):
        return label
    raise HTTPException(status_code=500, detail="Label update failed.")

@router.delete("/label/{label_id}", response_model=bool)
def label_delete(label_id: str, current_user: User = Depends(get_current_user)):
    label = label_repo.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete labels.")

    batch = firestore_wrapper.create_batch()
    
    label.purge(batch, current_member.id)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Label deletion failed.")

# Label-Specific APIs

@router.get("/label/{label_id}/stash", response_model=Stash)
def label_get_stash(label_id: str, current_user: User = Depends(get_current_user)):
    label = label_repo.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.get("/label/{label_id}/default_storage", response_model=Storage)
def label_get_default_storage(label_id: str, current_user: User = Depends(get_current_user)):
    label = label_repo.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return label.get_default_storage()

@router.get("/label/{label_id}/items", response_model=List[Item])
def label_get_items(label_id: str, current_user: User = Depends(get_current_user)):
    label = label_repo.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return label.get_items()
# endregion

# region === Item API === ===
@router.get("/item/template", response_model=Item)
def item_get_template(current_user: User = Depends(get_current_user)):
    item = Item(
        name="My Item",
        label_id="",
        storage_id="",
        preferred_unit="g"
    )
    return item

@router.post("/item", response_model=Item)
def item_create(payload: ItemPayload, current_user: User = Depends(get_current_user)):
    if not payload.label_id or payload.label_id.strip() == "":
        raise HTTPException(status_code=400, detail="Label ID is required.")
    
    label = label_repo.get(payload.label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")
    
    if not payload.storage_id or payload.storage_id.strip() == "":
        payload.storage_id = label.default_storage_id
    
    storage = storage_repo.get(payload.storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")
    
    if label.stash_id != storage.stash_id:
        raise HTTPException(status_code=404, detail="Label and storage are in different stashes.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Item name is required.")
    
    if not payload.preferred_unit or payload.preferred_unit.strip() == "":
        payload.preferred_unit = label.preferred_unit
    
    if payload.total_quantity is None or payload.total_quantity <= 0:
        raise HTTPException(status_code=400, detail="Total quantity must be positive.")
    
    if payload.current_quantity is not None and payload.current_quantity < 0:
        raise HTTPException(status_code=400, detail="Current quantity cannot be negative.")
    
    if not payload.allowed_member_usage or len(payload.allowed_member_usage) == 0:
        raise HTTPException(status_code=400, detail="Must select allowed members.")
    
    if payload.buyer_member_id is not None and payload.buyer_member_id.strip() != "":
        buyer_member = member_repo.get(payload.buyer_member_id)
        if not buyer_member or buyer_member.stash_id != stash.id:
            raise HTTPException(status_code=404, detail="Buyer member not found in the stash.")

    if payload.cost is not None and payload.cost < 0:
        raise HTTPException(status_code=400, detail="Cost cannot be negative.")
    
    item = Item(
        name=payload.name.strip(),
        label_id=payload.label_id,
        storage_id=payload.storage_id,
        buyer_member_id=payload.buyer_member_id or None,
        allowed_member_usage=payload.allowed_member_usage,
        preferred_unit=payload.preferred_unit,
        total_quantity=payload.total_quantity,
        current_quantity=payload.current_quantity or payload.total_quantity,
        cost=payload.cost or None,
        expiry_date=payload.expiry_date or None,
    )
    
    storage.item_ids.append(item.id)
    label.item_ids.append(item.id)
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title="Item Created",
        message=f"Item '{item.name}' created in storage '{storage.name}'."
    )
    
    batch = firestore_wrapper.create_batch()
    
    item_repo.batch_add(batch, item)
    storage_repo.batch_update(batch, storage)
    label_repo.batch_update(batch, label)
    event_repo.batch_add(batch, event)
    
    if firestore_wrapper.commit_batch(batch):
        return item
    raise HTTPException(status_code=500, detail="Item creation failed.")

@router.get("/item/{item_id}", response_model=Item)
def item_get(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item

@router.patch("/item", response_model=Item)
def item_update(payload: ItemPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Item ID is required in payload for update.")
    
    item = item_repo.get(payload.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if payload.label_id and payload.label_id.strip() != "" and payload.label_id != item.label_id:
        raise HTTPException(status_code=400, detail="Label cannot be changed once the item is created.")

    if payload.storage_id and payload.storage_id.strip() != "" and payload.storage_id != item.storage_id:
        new_storage = storage_repo.get(payload.storage_id)
        if not new_storage:
            raise HTTPException(status_code=404, detail="New storage not found.")
        
        if new_storage.stash_id != stash.id:
            raise HTTPException(status_code=400, detail="New storage does not belong to the same stash.")
        
    if payload.buyer_member_id is not None and payload.buyer_member_id.strip() != "":
        if payload.buyer_member_id != item.buyer_member_id:
            buyer_member = member_repo.get(payload.buyer_member_id)
            if not buyer_member or buyer_member.stash_id != stash.id:
                raise HTTPException(status_code=404, detail="Buyer member not found in the stash.")
            
    if payload.total_quantity is not None and payload.total_quantity <= 0:
        raise HTTPException(status_code=400, detail="Total quantity must be positive.")
    
    if payload.current_quantity is not None and payload.current_quantity < 0:
        raise HTTPException(status_code=400, detail="Current quantity cannot be negative.")
    
    if payload.allowed_member_usage is not None and len(payload.allowed_member_usage) == 0:
        raise HTTPException(status_code=400, detail="Must select allowed members.")
    
    if payload.cost is not None and payload.cost < 0:
        raise HTTPException(status_code=400, detail="Cost cannot be negative.")
    
    if payload.name is not None and payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Item name cannot be empty.")
    
    updated_item = payload.to_model(item, preserve=True)
    
    if not (changes := item.diff(updated_item)):
        return item
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Item '{item.name}' Updated",
        message=changes_to_string(changes)
    )
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    item_repo.batch_update(batch, updated_item)
    
    if firestore_wrapper.commit_batch(batch):
        return item
    raise HTTPException(status_code=500, detail="Item update failed.")

@router.delete("/item/{item_id}", response_model=bool)
def item_delete(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    batch = firestore_wrapper.create_batch()
    
    item.purge(batch, current_member.id)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Item deletion failed.")

# Item-Specific APIs

@router.get("/item/{item_id}/stash", response_model=Stash)
def item_get_stash(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.get("/item/{item_id}/label", response_model=Label)
def item_get_label(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item.get_label()

@router.get("/item/{item_id}/storage", response_model=Storage)
def item_get_storage(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item.get_storage()

@router.get("/item/{item_id}/buyer", response_model=Optional[Member])
def item_get_buyer(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item.get_buyer_member()

@router.get("/item/{item_id}/members/allowed", response_model=List[Member])
def item_get_allowed_members(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item.get_allowed_members()

@router.get("/item/{item_id}/order", response_model=Optional[Order])
def item_get_order(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return item.get_order()
#endregion

# region === Order API === ===
@router.get("/order/template", response_model=Order)
def order_get_template(current_user: User = Depends(get_current_user)):
    order = Order(
        stash_id=""
    )
    return order

@router.post("/order", response_model=Order)
def order_create(payload: OrderPayload, current_user: User = Depends(get_current_user)):
    if not payload.stash_id or payload.stash_id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required.")
    
    stash = stash_repo.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    if not payload.item_ids or len(payload.item_ids) <= 0:
        raise HTTPException(status_code=400, detail="At least one item ID is required to create an order.")
    
    for item_id in payload.item_ids:
        item = item_repo.get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with ID '{item_id}' not found.")
        
        item_stash = item.get_stash()
        if not item_stash or item_stash.id != stash.id:
            raise HTTPException(status_code=400, detail=f"Item with ID '{item_id}' does not belong to the current stash.")
        
    if payload.buyer_member_id is not None and payload.buyer_member_id.strip() != "":
        buyer_member = member_repo.get(payload.buyer_member_id)
        if not buyer_member:
            raise HTTPException(status_code=404, detail="Buyer member not found.")
        
        if buyer_member.stash_id != stash.id:
            raise HTTPException(status_code=400, detail="Buyer member does not belong to the current stash.")
    else:
        payload.buyer_member_id = None
        
    order = Order(
        stash_id=payload.stash_id,
        buyer_member_id=payload.buyer_member_id or None,
        status=payload.status or {},
        item_ids=payload.item_ids,
    )
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title="Order Created",
        message=f"Order created with {len(order.item_ids)} items."
    )
    
    batch = firestore_wrapper.create_batch()
    
    order_repo.batch_add(batch, order)
    event_repo.batch_add(batch, event)
    
    if firestore_wrapper.commit_batch(batch):
        return order
    raise HTTPException(status_code=500, detail="Order creation failed.")

@router.get("/order/{order_id}", response_model=Order)
def order_get(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return order

@router.patch("/order", response_model=Order)
def order_update(payload: OrderPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Order ID is required in payload for update.")
    
    order = order_repo.get(payload.id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    updated_order = payload.to_model(order, preserve=True)
    
    if not (changes := order.diff(updated_order)):
        return order
    
    event = Event(
        stash_id=stash.id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Order Updated",
        message=changes_to_string(changes)
    )
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)
    order_repo.batch_update(batch, updated_order)
    
    if firestore_wrapper.commit_batch(batch):
        return updated_order
    raise HTTPException(status_code=500, detail="Order update failed.")

@router.delete("/order/{order_id}", response_model=bool)
def order_delete(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete orders.")

    batch = firestore_wrapper.create_batch()
    
    order.purge(batch, current_member.id)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Order deletion failed.")

# Order-Specific APIs

@router.get("/order/{order_id}/stash", response_model=Stash)
def order_get_stash(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.get("/order/{order_id}/buyer", response_model=Optional[Member])
def order_get_buyer(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return order.get_buyer_member()

@router.get("/order/{order_id}/items", response_model=List[Item])
def order_get_items(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return order.get_items()
#endregion

# region === Event API === ===
@router.get("/event/template", response_model=Event)
def event_get_template(current_user: User = Depends(get_current_user)):
    return Event(
        stash_id="",
        member_id=current_user.id,
        type=EventType.INFO,
        title="New Event",
        message=""
    )
    return event

@router.post("/event", response_model=Event)
def event_create(payload: EventPayload, current_user: User = Depends(get_current_user)):
    if not payload.stash_id or payload.stash_id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required.")
    
    stash = stash_repo.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    event = Event(
        stash_id=payload.stash_id,
        member_id=current_member.id,
        type=payload.type or EventType.INFO,
        title=payload.title or "New Event",
        message=payload.message or "",
    )

    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_add(batch, event)

    if firestore_wrapper.commit_batch(batch):
        return event
    raise HTTPException(status_code=500, detail="Event creation failed.")
    
@router.get("/event/{event_id}", response_model=Event)
def event_get(event_id: str, current_user: User = Depends(get_current_user)):
    event = event_repo.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return event

@router.patch("/event", response_model=Event)
def event_update(payload: EventPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Event ID is required in payload for update.")
    
    event = event_repo.get(payload.id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    updated_event = payload.to_model(event, preserve=True)
    
    if not (changes := event.diff(updated_event)):
        return event
    
    batch = firestore_wrapper.create_batch()
    
    event_repo.batch_update(batch, updated_event)

    if firestore_wrapper.commit_batch(batch):
        return event
    raise HTTPException(status_code=500, detail="Event update failed.")

@router.delete("/event/{event_id}", response_model=bool)
def event_delete(event_id: str, current_user: User = Depends(get_current_user)):
    event = event_repo.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete events.")

    batch = firestore_wrapper.create_batch()
    
    event.purge(batch)

    if firestore_wrapper.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Event deletion failed.")

# Event-Specific APIs

@router.get("/event/{event_id}/stash", response_model=Stash)
def event_get_stash(event_id: str, current_user: User = Depends(get_current_user)):
    event = event_repo.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.get("/event/{event_id}/member", response_model=Member)
def event_get_member(event_id: str, current_user: User = Depends(get_current_user)):
    event = event_repo.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return current_member
#endregion