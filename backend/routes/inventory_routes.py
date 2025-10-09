from fastapi import APIRouter, Depends, HTTPException
from backend.database import REPO, fs
from backend.models import *
from typing import List, Optional

from identity_routes import get_current_member, get_current_user

# region === Config === ===
router = APIRouter()
#endregion

# region === Helper Methods === ===
def changes_to_string(changes: dict) -> str:
    messages = []
    for field, (old, new) in changes.items():
        messages.append(f"- **{field}** changed from '{old}' to '{new}'")
    return "\n".join(messages)
# endregion

# region === Item API === ===
@router.get("/item-template", response_model=Item)
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
    
    label = REPO.LABELS.get(payload.label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found.")
    
    if not payload.storage_id or payload.storage_id.strip() == "":
        payload.storage_id = label.default_storage_id

    storage = REPO.STORAGES.get(payload.storage_id)
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
        buyer_member = REPO.MEMBERS.get(payload.buyer_member_id)
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
    
    batch = fs.create_batch()

    REPO.ITEMS.batch_add(batch, item)
    REPO.STORAGES.batch_update(batch, storage)
    REPO.LABELS.batch_update(batch, label)
    REPO.EVENTS.batch_add(batch, event)

    if fs.commit_batch(batch):
        return item
    raise HTTPException(status_code=500, detail="Item creation failed.")

@router.get("/item/{item_id}", response_model=Item)
def item_get(item_id: str, current_user: User = Depends(get_current_user)):
    item = REPO.ITEMS.get(item_id)
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

    item = REPO.ITEMS.get(payload.id)
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
        new_storage = REPO.STORAGES.get(payload.storage_id)
        if not new_storage:
            raise HTTPException(status_code=404, detail="New storage not found.")
        
        if new_storage.stash_id != stash.id:
            raise HTTPException(status_code=400, detail="New storage does not belong to the same stash.")
        
    if payload.buyer_member_id is not None and payload.buyer_member_id.strip() != "":
        if payload.buyer_member_id != item.buyer_member_id:
            buyer_member = REPO.MEMBERS.get(payload.buyer_member_id)
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
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.ITEMS.batch_update(batch, updated_item)

    if fs.commit_batch(batch):
        return item
    raise HTTPException(status_code=500, detail="Item update failed.")

@router.delete("/item/{item_id}", response_model=bool)
def item_delete(item_id: str, current_user: User = Depends(get_current_user)):
    item = REPO.ITEMS.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    stash = item.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    batch = fs.create_batch()
    
    item.purge(batch, current_member.id)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Item deletion failed.")

# Item-Specific APIs

@router.get("/item/{item_id}/stash", response_model=Stash)
def item_get_stash(item_id: str, current_user: User = Depends(get_current_user)):
    item = REPO.ITEMS.get(item_id)
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
    item = REPO.ITEMS.get(item_id)
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
    item = REPO.ITEMS.get(item_id)
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
    item = REPO.ITEMS.get(item_id)
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
    item = REPO.ITEMS.get(item_id)
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
    item = REPO.ITEMS.get(item_id)
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
@router.get("/order-template", response_model=Order)
def order_get_template(current_user: User = Depends(get_current_user)):
    order = Order(
        stash_id=""
    )
    return order

@router.post("/order", response_model=Order)
def order_create(payload: OrderPayload, current_user: User = Depends(get_current_user)):
    if not payload.stash_id or payload.stash_id.strip() == "":
        raise HTTPException(status_code=400, detail="Stash ID is required.")

    stash = REPO.STASHES.get(payload.stash_id)
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")
    
    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    if not payload.item_ids or len(payload.item_ids) <= 0:
        raise HTTPException(status_code=400, detail="At least one item ID is required to create an order.")
    
    for item_id in payload.item_ids:
        item = REPO.ITEMS.get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with ID '{item_id}' not found.")
        
        item_stash = item.get_stash()
        if not item_stash or item_stash.id != stash.id:
            raise HTTPException(status_code=400, detail=f"Item with ID '{item_id}' does not belong to the current stash.")
        
    if payload.buyer_member_id is not None and payload.buyer_member_id.strip() != "":
        buyer_member = REPO.MEMBERS.get(payload.buyer_member_id)
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
    
    batch = fs.create_batch()

    REPO.ORDERS.batch_add(batch, order)
    REPO.EVENTS.batch_add(batch, event)

    if fs.commit_batch(batch):
        return order
    raise HTTPException(status_code=500, detail="Order creation failed.")

@router.get("/order/{order_id}", response_model=Order)
def order_get(order_id: str, current_user: User = Depends(get_current_user)):
    order = REPO.ORDERS.get(order_id)
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

    order = REPO.ORDERS.get(payload.id)
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
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.ORDERS.batch_update(batch, updated_order)

    if fs.commit_batch(batch):
        return updated_order
    raise HTTPException(status_code=500, detail="Order update failed.")

@router.delete("/order/{order_id}", response_model=bool)
def order_delete(order_id: str, current_user: User = Depends(get_current_user)):
    order = REPO.ORDERS.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    stash = order.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete orders.")

    batch = fs.create_batch()
    
    order.purge(batch, current_member.id)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Order deletion failed.")

# Order-Specific APIs

@router.get("/order/{order_id}/stash", response_model=Stash)
def order_get_stash(order_id: str, current_user: User = Depends(get_current_user)):
    order = REPO.ORDERS.get(order_id)
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
    order = REPO.ORDERS.get(order_id)
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
    order = REPO.ORDERS.get(order_id)
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
@router.get("/event-template", response_model=Event)
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

    stash = REPO.STASHES.get(payload.stash_id)
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

    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)

    if fs.commit_batch(batch):
        return event
    raise HTTPException(status_code=500, detail="Event creation failed.")
    
@router.get("/event/{event_id}", response_model=Event)
def event_get(event_id: str, current_user: User = Depends(get_current_user)):
    event = REPO.EVENTS.get(event_id)
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

    event = REPO.EVENTS.get(payload.id)
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
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_update(batch, updated_event)

    if fs.commit_batch(batch):
        return event
    raise HTTPException(status_code=500, detail="Event update failed.")

@router.delete("/event/{event_id}", response_model=bool)
def event_delete(event_id: str, current_user: User = Depends(get_current_user)):
    event = REPO.EVENTS.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete events.")

    batch = fs.create_batch()
    
    event.purge(batch)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Event deletion failed.")

# Event-Specific APIs

@router.get("/event/{event_id}/stash", response_model=Stash)
def event_get_stash(event_id: str, current_user: User = Depends(get_current_user)):
    event = REPO.EVENTS.get(event_id)
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
    event = REPO.EVENTS.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    stash = event.get_stash()
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    if not (current_member := get_current_member(current_user, stash.id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return current_member
#endregion