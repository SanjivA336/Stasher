import uuid
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum

# === Base ===
class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def diff(self, other: 'BaseDocument') -> dict[str, tuple[Any, Any]]:
        if not isinstance(other, type(self)):
            raise ValueError(f"Cannot diff {type(self)} with {type(other)}")

        changes = {}
        for field in type(self).model_fields:
            old_val = getattr(self, field)
            new_val = getattr(other, field)
            if old_val != new_val:
                changes[field] = (old_val, new_val)
        return changes
    
# === User ===
class User(BaseDocument):
    email: EmailStr
    username: str
    password_hashed: str
    member_ids: List[str] = Field(default_factory=list)
    
    def get_all_members(self) -> List['Member']:
        from backend.database import REPO
        members = REPO.MEMBERS.query([("owner_user_id", "==", self.id)])
        return members
    
    def get_active_members(self) -> List['Member']:
        from backend.database import REPO
        members = REPO.MEMBERS.query([("owner_user_id", "==", self.id), ("is_active", "==", True)])
        return members
    
    def get_all_stashes(self) -> List['Stash']:
        from backend.database import REPO
        members = self.get_all_members()
        stash_ids = list(set(member.stash_id for member in members))
        stashes = REPO.STASHES.query([("id", "in", stash_ids)]) if stash_ids else []
        return stashes
    
    def get_active_stashes(self) -> List['Stash']:
        from backend.database import REPO
        members = self.get_active_members()
        stash_ids = list(set(member.stash_id for member in members))
        stashes = REPO.STASHES.query([("id", "in", stash_ids)]) if stash_ids else []
        return stashes
    
    def purge(self, batch):
        from backend.database import fs, REPO

        if REPO.USERS.get(self.id) is None:
            raise ValueError("User does not exist.")

        _batch = batch if batch else fs.create_batch()

        members = self.get_all_members()
        for member in members:
            member.is_active = False
            member.owner_user_id = None
            REPO.MEMBERS.batch_update(_batch, member)

        REPO.USERS.batch_delete(_batch, self.id)

        return _batch

# === Member ===
class Member(BaseDocument):
    owner_user_id: Optional[str] = None
    stash_id: str
    nickname: str
    debts: dict[str, float] = Field(default_factory=dict)  # {member_id: amount_owed}
    is_admin: bool = False
    is_active: bool = True
    
    def get_owner(self) -> Optional[User]:
        from backend.database import REPO
        user = REPO.USERS.get(self.owner_user_id) if self.owner_user_id else None
        return user
    
    def get_stash(self) -> Optional['Stash']:
        from backend.database import REPO
        stash = REPO.STASHES.get(self.stash_id)
        return stash
    
    def get_debt(self, member: 'Member | str') -> float:
        if isinstance(member, Member):
            return self.debts.get(member.id, 0.0)
        
        return self.debts.get(member, 0.0)
    
    def set_debt(self, member: 'Member | str', amount: float) -> None:
        if isinstance(member, Member):
            self.debts[member.id] = amount
        else:
            self.debts[member] = amount
    
    def get_bought_items(self) -> List['Item']:
        from backend.database import REPO
        items = REPO.ITEMS.query([("buyer_member_id", "==", self.id)])
        return items
    
    def get_used_items(self) -> List['Item']:
        from backend.database import REPO
        items = REPO.ITEMS.query([("allowed_member_usage." + self.id, ">", 0)])
        return items
    
    def get_orders(self) -> List['Order']:
        from backend.database import REPO
        orders = REPO.ORDERS.query([("buyer_member_id", "==", self.id)])
        return orders
    
    def get_events(self) -> List['Event']:
        from backend.database import REPO
        events = REPO.EVENTS.query([("member_id", "==", self.id)])
        return events

    def purge(self, batch, deleter_id: Optional[str]):
        from backend.database import fs, REPO

        if REPO.MEMBERS.get(self.id) is None:
            raise ValueError("Member does not exist.")

        _batch = batch if batch else fs.create_batch()

        user = self.get_owner()
        if user:
            user.member_ids.remove(self.id)
            REPO.USERS.batch_update(_batch, user)

        stash = self.get_stash()
        if stash:
            stash.member_ids.remove(self.id)
            REPO.STASHES.batch_update(_batch, stash)

        bought_items = REPO.ITEMS.query([("buyer_member_id", "==", self.id)])
        for item in bought_items:
            item.buyer_member_id = None
            REPO.ITEMS.batch_update(_batch, item)

        orders = REPO.ORDERS.query([("buyer_member_id", "==", self.id)])
        for order in orders:
            order.buyer_member_id = None
            REPO.ORDERS.batch_update(_batch, order)

        event = Event(
            stash_id=self.stash_id,
            member_id=deleter_id or "",
            type=EventType.SUCCESS,
            title=f"Member '{self.nickname}' Deleted",
            message="This member has been deleted and is no longer active."
        )
        REPO.EVENTS.batch_add(_batch, event)

        REPO.MEMBERS.batch_delete(_batch, self.id)
        
        return _batch

# === Stash ===
class Stash(BaseDocument):
    name: str
    address: Optional[str] = None
    member_ids: List[str] = Field(default_factory=list)
    storage_ids: List[str] = Field(default_factory=list)
    label_ids: List[str] = Field(default_factory=list)
    join_code: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    
    def get_all_members(self) -> List[Member]:
        from backend.database import REPO
        members = REPO.MEMBERS.query([("stash_id", "==", self.id)])
        return members
    
    def get_active_members(self) -> List[Member]:
        from backend.database import REPO
        members = REPO.MEMBERS.query([("stash_id", "==", self.id), ("is_active", "==", True)])
        return members
    
    def get_all_users(self) -> List[User]:
        from backend.database import REPO
        members = self.get_all_members()
        user_ids = list(set(member.owner_user_id for member in members if member.owner_user_id))
        users = REPO.USERS.query([("id", "in", user_ids)]) if user_ids else []
        return users
    
    def get_active_users(self) -> List[User]:
        from backend.database import REPO
        members = self.get_active_members()
        user_ids = list(set(member.owner_user_id for member in members if member.owner_user_id))
        users = REPO.USERS.query([("id", "in", user_ids)]) if user_ids else []
        return users
    
    def get_storages(self) -> List['Storage']:
        from backend.database import REPO
        storages = REPO.STORAGES.query([("stash_id", "==", self.id)])
        return storages
    
    def get_labels(self) -> List['Label']:
        from backend.database import REPO
        labels = REPO.LABELS.query([("stash_id", "==", self.id)])
        return labels
    
    def get_orders(self) -> List['Order']:
        from backend.database import REPO
        orders = REPO.ORDERS.query([("stash_id", "==", self.id)])
        return orders
    
    def get_events(self) -> List['Event']:
        from backend.database import REPO
        events = REPO.EVENTS.query([("stash_id", "==", self.id)])
        return events
    
    def get_items(self) -> List['Item']:
        from backend.database import REPO
        labels = self.get_labels()
        label_ids = [label.id for label in labels]
        items = REPO.ITEMS.query([("label_id", "in", label_ids)]) if label_ids else []
        return items
    
    def purge(self, batch):
        from backend.database import fs, REPO
        
        if REPO.STASHES.get(self.id) is None:
            raise ValueError("stash does not exist.")

        _batch = batch if batch else fs.create_batch()

        members = self.get_all_members()
        for member in members:
            user = member.get_owner()
            if user:
                user.member_ids.remove(member.id)
                REPO.USERS.batch_update(_batch, user)

            REPO.MEMBERS.batch_delete(_batch, member.id)

        storages = self.get_storages()
        for storage in storages:
            REPO.STORAGES.batch_delete(_batch, storage.id)

        labels = self.get_labels()
        for label in labels:
            items = label.get_items()
            for item in items:
                REPO.ITEMS.batch_delete(_batch, item.id)
            REPO.LABELS.batch_delete(_batch, label.id)

        orders = self.get_orders()
        for order in orders:
            REPO.ORDERS.batch_delete(_batch, order.id)

        events = self.get_events()
        for event in events:
            REPO.EVENTS.batch_delete(_batch, event.id)

        REPO.STASHES.batch_delete(_batch, self.id)
        
        return _batch

# === Storage ===
class Storage(BaseDocument):
    name: str
    stash_id: str
    type: 'StorageType' = Field(default_factory=lambda: StorageType.PANTRY)
    description: Optional[str] = None
    item_ids: List[str] = Field(default_factory=list)
    
    def get_stash(self) -> Optional[Stash]:
        from backend.database import REPO
        stash = REPO.STASHES.get(self.stash_id)
        return stash
    
    def get_items(self) -> List['Item']:
        from backend.database import REPO
        items = REPO.ITEMS.query([("storage_id", "==", self.id)])
        return items
    
    def get_labels(self) -> List['Label']:
        from backend.database import REPO
        entries = REPO.LABELS.query([("default_storage_id", "==", self.id)])
        return entries

    def purge(self, batch, deleter_id: Optional[str]):
        from backend.database import fs, REPO

        if REPO.STORAGES.get(self.id) is None:
            raise ValueError("Storage does not exist.")
        
        items = self.get_items()
        if items:
            raise ValueError("Cannot delete storage with associated items.")

        labels = REPO.LABELS.query([("default_storage_id", "==", self.id)])
        if labels:
            raise ValueError("Cannot delete storage that is set as default in a label.")

        _batch = batch if batch else fs.create_batch()

        stash = self.get_stash()
        if stash:
            if len(stash.storage_ids) <= 1:
                raise ValueError("Stash must have at least one storage.")
            
            stash.storage_ids.remove(self.id)
            REPO.STASHES.batch_update(_batch, stash)

            event = Event(
                stash_id=stash.id,
                member_id=deleter_id or "",
                type=EventType.SUCCESS,
                title=f"Storage '{self.name}' Deleted",
                message="This storage has been deleted and is no longer active."
            )
            REPO.EVENTS.batch_add(_batch, event)

        REPO.STORAGES.batch_delete(_batch, self.id)

        return _batch
    
class StorageType(str, Enum):
    FRIDGE = "Fridge"
    FREEZER = "Freezer"
    PANTRY = "Pantry"
    GARDEN = "Garden"
    OTHER = "Other"

# === Label ===
class Label(BaseDocument):
    name: str
    preferred_unit: str
    stash_id: str
    default_storage_id: str
    current_quantity: float = 0.0
    item_ids: List[str] = Field(default_factory=list)
    food_group: Optional[str] = None
    
    def get_stash(self) -> Optional[Stash]:
        from backend.database import REPO
        stash = REPO.STASHES.get(self.stash_id)
        return stash
    
    def get_default_storage(self) -> Optional[Storage]:
        from backend.database import REPO
        storage = REPO.STORAGES.get(self.default_storage_id)
        return storage
    
    def get_items(self) -> List['Item']:
        from backend.database import REPO
        items = REPO.ITEMS.query([("label_id", "==", self.id)])
        return items

    def purge(self, batch, deleter_id: Optional[str]):
        from backend.database import fs, REPO

        if REPO.LABELS.get(self.id) is None:
            raise ValueError("Label does not exist.")
        
        items = self.get_items()
        if items:
            raise ValueError("Cannot delete label with associated items.")
        
        _batch = batch if batch else fs.create_batch()
        
        stash = self.get_stash()
        if stash:
            stash.label_ids.remove(self.id)
            REPO.STASHES.batch_update(_batch, stash)

            event = Event(
                stash_id=stash.id,
                member_id=deleter_id or "",
                type=EventType.SUCCESS,
                title=f"Label '{self.name}' Deleted",
                message="This label has been deleted and is no longer active."
            )
            REPO.EVENTS.batch_add(_batch, event)

        REPO.LABELS.batch_delete(_batch, self.id)

        return _batch
    
# === Item ===
class Item(BaseDocument):
    name: str
    label_id: str
    storage_id: str
    buyer_member_id: Optional[str] = None
    allowed_member_usage: Dict[str, float] = Field(default_factory=dict) # {member_id: amount_used}
    total_quantity: float = 0
    current_quantity: float = 0
    preferred_unit: Optional[str] = None
    cost: Optional[float] = None
    expiry_date: Optional[datetime] = None
    
    def get_label(self) -> Optional[Label]:
        from backend.database import REPO
        label = REPO.LABELS.get(self.label_id)
        return label
    
    def get_storage(self) -> Optional[Storage]:
        from backend.database import REPO
        storage = REPO.STORAGES.get(self.storage_id)
        return storage
    
    def get_order(self) -> Optional['Order']:
        from backend.database import REPO
        orders = REPO.ORDERS.query([("item_ids", "array_contains", self.id)])
        return orders[0] if orders else None
    
    def get_stash(self) -> Optional[Stash]:
        label = self.get_label()
        if label:
            return label.get_stash()
        
        storage = self.get_storage()
        if storage:
            return storage.get_stash()
        
        return None
    
    def get_buyer_member(self) -> Optional[Member]:
        from backend.database import REPO
        member = REPO.MEMBERS.get(self.buyer_member_id) if self.buyer_member_id else None
        return member
    
    def get_allowed_members(self) -> List[Member]:
        from backend.database import REPO
        members = REPO.MEMBERS.query([("id", "in", list(self.allowed_member_usage.keys()))])
        return members
    
    def get_all_usage(self) -> Dict[Member | None, float]:
        from backend.database import REPO
        usage = {}
        for member_id, amount in self.allowed_member_usage.items():
            member = REPO.MEMBERS.get(member_id)
            usage[member] = amount
        return usage
    
    def get_usage(self, member: 'Member | str') -> float:
        if isinstance(member, Member):
            return self.allowed_member_usage.get(member.id, 0.0)
        return self.allowed_member_usage.get(member, 0.0)
    
    def set_usage(self, member: 'Member | str', amount: float) -> None:
        if isinstance(member, Member):
            self.allowed_member_usage[member.id] = amount
        else:
            self.allowed_member_usage[member] = amount

    def purge(self, batch, deleter_id: Optional[str]):
        from backend.database import fs, REPO

        if REPO.ITEMS.get(self.id) is None:
            raise ValueError("Item does not exist.")

        _batch = batch if batch else fs.create_batch()

        label = self.get_label()
        if label:
            if self.id in label.item_ids:
                label.item_ids.remove(self.id)
                REPO.LABELS.batch_update(_batch, label)

        storage = self.get_storage()
        if storage:
            if self.id in storage.item_ids:
                storage.item_ids.remove(self.id)
                REPO.STORAGES.batch_update(_batch, storage)

        order = self.get_order()
        if order:
            order.item_ids.remove(self.id)
            REPO.ORDERS.batch_update(_batch, order)

        stash = self.get_stash()
        if stash:
            event = Event(
                stash_id=stash.id,
                member_id=deleter_id or "",
                type=EventType.SUCCESS,
                title=f"Item '{self.name}' Deleted",
                message="This item has been deleted and is no longer active."
            )
            REPO.EVENTS.batch_add(_batch, event)

        REPO.ITEMS.batch_delete(_batch, self.id)

        return _batch

# === Order ===
class Order(BaseDocument):
    stash_id: str
    buyer_member_id: Optional[str] = None
    status: dict[str, 'OrderStatus'] = Field(default_factory=dict) # {attribute: OrderStatus}
    item_ids: List[str] = Field(default_factory=list)
    
    def get_stash(self) -> Optional[Stash]:
        from backend.database import REPO
        stash = REPO.STASHES.get(self.stash_id)
        return stash
    
    def get_buyer_member(self) -> Optional[Member]:
        from backend.database import REPO
        member = REPO.MEMBERS.get(self.buyer_member_id) if self.buyer_member_id else None
        return member
    
    def get_items(self) -> List[Item]:
        from backend.database import REPO
        items = REPO.ITEMS.query([("id", "in", self.item_ids)])
        return items
    
    def get_status_of(self, attribute: str) -> 'OrderStatus':
        return self.status.get(attribute, OrderStatus.SKIPPED)
    
    def set_status_of(self, attribute: str, status: 'OrderStatus') -> None:
        self.status[attribute] = status

    def purge(self, batch, deleter_id: Optional[str]):
        from backend.database import fs, REPO

        if REPO.ORDERS.get(self.id) is None:
            raise ValueError("Order does not exist.")

        _batch = batch if batch else fs.create_batch()

        items = self.get_items()
        for item in items:
            if item.current_quantity <= 0:
                REPO.ITEMS.batch_delete(_batch, item.id)

        REPO.ORDERS.batch_delete(_batch, self.id)
        
        stash = self.get_stash()
        if stash:
            event = Event(
                stash_id=stash.id,
                member_id=deleter_id or "",
                type=EventType.SUCCESS,
                title=f"Order '{self.created_at.date()}' Deleted",
                message="This order has been deleted and is no longer active."
            )
            REPO.EVENTS.batch_add(_batch, event)

        return _batch

class OrderStatus(str, Enum):
    SKIPPED = "skipped"
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"

# === Event ===
class Event(BaseDocument):
    stash_id: str
    member_id: str
    type: 'EventType'
    title: str
    message: Optional[str] = ""

    def get_stash(self) -> Optional[Stash]:
        from backend.database import REPO
        stash = REPO.STASHES.get(self.stash_id)
        return stash
    
    def get_member(self) -> Optional[Member]:
        from backend.database import REPO
        member = REPO.MEMBERS.get(self.member_id) if self.member_id else None
        return member
    
    def purge(self, batch):
        from backend.database import fs, REPO
        
        _batch = batch if batch else fs.create_batch()

        REPO.EVENTS.batch_delete(_batch, self.id)
        
        return _batch

class EventType(str, Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    DANGER = "danger"

User.model_rebuild()
Member.model_rebuild()
Stash.model_rebuild()
Storage.model_rebuild()
Label.model_rebuild()
Item.model_rebuild()
Order.model_rebuild()
Event.model_rebuild()