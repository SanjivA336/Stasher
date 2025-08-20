import uuid
from fastapi import APIRouter, Depends, HTTPException
from backend.routes.auth_routes import get_current_user
from backend.database.repos import user_repo, member_repo, kitchen_repo, storage_repo, registry_repo, item_repo, order_repo, log_repo
from backend.models import *
from backend.routes._schemas import *

# === Config ===
router = APIRouter()

# === Current User ===
@router.get("/fetch/current_user", response_model=UserProtected)
def fetch_current_user(current_user: User = Depends(get_current_user)):
    return UserProtected.from_model(current_user)

@router.post("/fetch/current_member", response_model=Member)
def fetch_current_member(kitchen_id: str, current_user: User = Depends(get_current_user)):
    member = current_user.get_member_for_kitchen(kitchen_id)
    if not member:
        raise HTTPException(status_code=404, detail="You do not have access to this kitchen")
    
    return member

# === Fetch Routes ===
@router.get("/fetch/user", response_model=UserProtected)
def fetch_user(user_id: str):
    user = user_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    return UserProtected.from_model(user)

@router.get("/fetch/member", response_model=Member)
def fetch_member(member_id: str, current_user: User = Depends(get_current_user)):
    member = member_repo.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member does not exist")

    kitchen = member.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")

    fetch_current_member(kitchen.id, current_user)
    
    return member

@router.get("/fetch/kitchen", response_model=Kitchen)
def fetch_kitchen(kitchen_id: str, current_user: User = Depends(get_current_user)):
    kitchen = kitchen_repo.get(kitchen_id)
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")

    if not fetch_current_member(kitchen.id, current_user):
        raise HTTPException(status_code=403, detail="You do not have access to this kitchen")
    
    return kitchen

@router.get("/fetch/storage", response_model=Storage)
def fetch_storage(storage_id: str, current_user: User = Depends(get_current_user)):
    storage = storage_repo.get(storage_id)
    if not storage:
        raise HTTPException(status_code=404, detail="Storage does not exist")

    kitchen = storage.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")

    fetch_current_member(kitchen.id, current_user)
    
    return storage

@router.get("/fetch/registry", response_model=RegistryEntry)
def fetch_registry(registry_id: str, current_user: User = Depends(get_current_user)):
    registry = registry_repo.get(registry_id)
    if not registry:
        raise HTTPException(status_code=404, detail="Registry entry does not exist")

    kitchen = registry.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")

    fetch_current_member(kitchen.id, current_user)

    return registry

@router.get("/fetch/item", response_model=Item)
def fetch_item(item_id: str, current_user: User = Depends(get_current_user)):
    item = item_repo.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item does not exist")

    kitchen = item.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")
    
    fetch_current_member(kitchen.id, current_user)

    return item

@router.get("/fetch/order", response_model=Order)
def fetch_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = order_repo.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order does not exist")

    kitchen = order.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")
    
    fetch_current_member(kitchen.id, current_user)

    return order

@router.get("/fetch/log", response_model=LogEntry)
def fetch_log(log_id: str, current_user: User = Depends(get_current_user)):
    log = log_repo.get(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log does not exist")

    kitchen = log.get_kitchen()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen does not exist")

    fetch_current_member(kitchen.id, current_user)

    return log
