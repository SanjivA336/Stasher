from fastapi import APIRouter, Depends, HTTPException
from backend.database import REPO, fs
from backend.models import *
from typing import List

from .identity_routes import get_current_member, get_current_user
from .routes_helper import changes_to_string

# region === Config === ===
router = APIRouter()
#endregion

# region === Stash API === ===
@router.get("/stash-template", response_model=Stash)
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
    import uuid
    
    if not payload.name or payload.name.strip() == "":
        raise HTTPException(status_code=400, detail="Stash name is required.")
    
    payload.join_code = uuid.uuid4().hex[:8].strip().upper()
    while len(REPO.STASHES.query([("join_code", "==", payload.join_code)])) > 0:
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
        description="My first storage.",
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
    
    batch = fs.create_batch()
    
    REPO.STASHES.batch_add(batch, stash)
    REPO.STORAGES.batch_add(batch, storage)
    REPO.MEMBERS.batch_add(batch, member)
    REPO.EVENTS.batch_add(batch, event)
    REPO.USERS.batch_update(batch, current_user)

    if fs.commit_batch(batch):
        return stash
    raise HTTPException(status_code=500, detail="Stash creation failed.")

@router.get("/stash/{stash_id}", response_model=Stash)
def stash_get(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash

@router.patch("/stash", response_model=Stash)
def stash_update(payload: StashPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required in payload for update.")

    stash = REPO.STASHES.get(payload.id)
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

    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.STASHES.batch_update(batch, updated_stash)

    if fs.commit_batch(batch):
        return stash
    raise HTTPException(status_code=500, detail="Stash update failed.")

@router.delete("/stash/{stash_id}", response_model=bool)
def stash_delete(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete the stash.")

    batch = fs.create_batch()

    stash.purge(batch)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Stash deletion failed.")

# Stash-Specific APIs

@router.get("/stash/{stash_id}/labels", response_model=List[Label])
def stash_get_labels(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_labels()

@router.get("/stash/{stash_id}/storages", response_model=List[Storage])
def stash_get_storages(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_storages()

@router.get("/stash/{stash_id}/members/{filter}", response_model=List[Member])
def stash_get_members(stash_id: str, filter: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
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
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_orders()

@router.get("/stash/{stash_id}/events", response_model=List[Event])
def stash_get_events(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_events()

@router.get("/stash/{stash_id}/items", response_model=List[Item])
def stash_get_items(stash_id: str, current_user: User = Depends(get_current_user)):
    stash = REPO.STASHES.get(stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return stash.get_items()
# endregion

# region === Storage API === ===
@router.get("/storage-template", response_model=Storage)
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

    stash = REPO.STASHES.get(payload.stash_id)
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
    
    batch = fs.create_batch()

    REPO.STORAGES.batch_add(batch, storage)
    REPO.STASHES.batch_update(batch, stash)
    REPO.EVENTS.batch_add(batch, event)

    if fs.commit_batch(batch):
        return storage
    raise HTTPException(status_code=500, detail="Storage creation failed.")

@router.get("/storage/{storage_id}", response_model=Storage)
def storage_get(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = REPO.STORAGES.get(storage_id)
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

    storage = REPO.STORAGES.get(payload.id)
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
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.STORAGES.batch_update(batch, updated_storage)

    if fs.commit_batch(batch):
        return storage
    raise HTTPException(status_code=500, detail="Storage update failed.")

@router.delete("/storage/{storage_id}", response_model=bool)
def storage_delete(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = REPO.STORAGES.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage not found.")

    stash = storage.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete storages.")

    batch = fs.create_batch()
    
    storage.purge(batch, current_member.id)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Storage deletion failed.")

# Storage-Specific APIs

@router.get("/storage/{storage_id}/stash", response_model=Stash)
def storage_get_stash(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = REPO.STORAGES.get(storage_id)
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
    storage = REPO.STORAGES.get(storage_id)
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
    storage = REPO.STORAGES.get(storage_id)
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
@router.get("/label-template", response_model=Label)
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

    stash = REPO.STASHES.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
        
    if not payload.default_storage_id or payload.default_storage_id.strip() == "":
        raise HTTPException(status_code=400, detail="Default Storage ID is required.")

    storage = REPO.STORAGES.get(payload.default_storage_id)
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
    
    batch = fs.create_batch()

    REPO.LABELS.batch_add(batch, label)
    REPO.STASHES.batch_update(batch, stash)
    REPO.EVENTS.batch_add(batch, event)

    if fs.commit_batch(batch):
        return label
    raise HTTPException(status_code=500, detail="Label creation failed.")

@router.get("/label/{label_id}", response_model=Label)
def label_get(label_id: str, current_user: User = Depends(get_current_user)):
    label = REPO.LABELS.get(label_id)
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

    label = REPO.LABELS.get(payload.id)
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
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.LABELS.batch_update(batch, updated_label)

    if fs.commit_batch(batch):
        return label
    raise HTTPException(status_code=500, detail="Label update failed.")

@router.delete("/label/{label_id}", response_model=bool)
def label_delete(label_id: str, current_user: User = Depends(get_current_user)):
    label = REPO.LABELS.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete labels.")

    batch = fs.create_batch()
    
    label.purge(batch, current_member.id)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Label deletion failed.")

# Label-Specific APIs

@router.get("/label/{label_id}/stash", response_model=Stash)
def label_get_stash(label_id: str, current_user: User = Depends(get_current_user)):
    label = REPO.LABELS.get(label_id)
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
    label = REPO.LABELS.get(label_id)
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
    label = REPO.LABELS.get(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")

    stash = label.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return label.get_items()
# endregion
