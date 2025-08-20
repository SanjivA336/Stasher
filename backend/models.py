import uuid
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum

# === Base ===
class BaseDocument(BaseModel):
    id: str = "new"
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

    def has_changes(self, other: 'BaseDocument') -> bool:
        """
        Returns True if there is any difference between self and other.
        """
        return bool(self.diff(other))
    
# === User ===
class User(BaseDocument):
    email: EmailStr
    username: str
    password_hashed: str
    preferences: 'UserPreferences' = Field(default_factory=lambda: UserPreferences())
    member_ids: List[str] = Field(default_factory=list)
    
    def get_members(self) -> List['Member']:
        from backend.database.repos import member_repo
        members = member_repo.query([("user_id", "==", self.id)])
        return members
    
    def get_member_for_kitchen(self, kitchen_id: str) -> Optional['Member']:
        from backend.database.repos import member_repo
        members = member_repo.query([("kitchen_id", "==", kitchen_id), ("user_id", "==", self.id)])
        return members[0] if members else None
    
class UserPreferences(BaseModel):
    pass

# === Member ===
class Member(BaseDocument):
    owner_user_id: Optional[str] = None
    kitchen_id: str
    nickname: str
    debts: dict[str, float] = Field(default_factory=dict)  # {member_id: amount}
    is_admin: bool = False
    
    def get_owner(self) -> Optional[User]:
        from backend.database.repos import user_repo
        user = user_repo.get(self.owner_user_id) if self.owner_user_id else None
        return user
    
    def get_kitchen(self) -> Optional['Kitchen']:
        from backend.database.repos import kitchen_repo
        kitchen = kitchen_repo.get(self.kitchen_id)
        return kitchen
    
    def get_debt(self, member: 'Member | str') -> float:
        if isinstance(member, Member):
            return self.debts.get(member.id, 0.0)
        
        return self.debts.get(member, 0.0)
    
    def set_debt(self, member: 'Member | str', amount: float) -> None:
        if isinstance(member, Member):
            self.debts[member.id] = amount
        else:
            self.debts[member] = amount

# === Kitchen ===
class Kitchen(BaseDocument):
    name: str
    address: Optional[str] = None
    member_ids: List[str] = Field(default_factory=list)
    storage_ids: List[str] = Field(default_factory=list)
    registry_entry_ids: List[str] = Field(default_factory=list)
    join_code: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    settings: 'KitchenSettings' = Field(default_factory=lambda: KitchenSettings())
    
    def get_members(self) -> List[Member]:
        from backend.database.repos import member_repo
        members = member_repo.query([("kitchen_id", "==", self.id)])
        return members
    
    def get_storage(self) -> List['Storage']:
        from backend.database.repos import storage_repo
        storages = storage_repo.query([("kitchen_id", "==", self.id)])
        return storages
    
    def get_registry(self) -> List['RegistryEntry']:
        from backend.database.repos import registry_repo
        registry = registry_repo.query([("kitchen_id", "==", self.id)])
        return registry

class KitchenSettings(BaseModel):
    expiry_warning: int = 10  # Days before expiry to warn user
    
# === Storage ===
class Storage(BaseDocument):
    name: str
    kitchen_id: str
    type: 'StorageType' = Field(default_factory=lambda: StorageType.PANTRY)
    description: Optional[str] = None
    item_ids: List[str] = Field(default_factory=list)
    ui_settings: 'StorageUISettings' = Field(default_factory=lambda: StorageUISettings())
    
    def get_kitchen(self) -> Optional[Kitchen]:
        from backend.database.repos import kitchen_repo
        kitchen = kitchen_repo.get(self.kitchen_id)
        return kitchen
    
    def get_items(self) -> List['Item']:
        from backend.database.repos import item_repo
        items = item_repo.query([("storage_id", "==", self.id)])
        return items
    
class StorageType(str, Enum):
    FRIDGE = "fridge"
    FREEZER = "freezer"
    PANTRY = "pantry"
    GARDEN = "garden"
    OTHER = "other"
    
class StorageUISettings(BaseModel):
    custom_color: Optional[str] = None
    size: dict = Field(default_factory=lambda: {"width": 5, "height": 5})
    position: Dict[str, int] = Field(default_factory=lambda: {"x": 0, "y": 0})
    
# === Registry ===
class RegistryEntry(BaseDocument):
    name: str
    preferred_unit: str
    kitchen_id: str
    default_storage_id: str
    current_quantity: int = 0
    item_ids: List[str] = Field(default_factory=list)
    food_group: Optional[str] = None
    
    def get_kitchen(self) -> Optional[Kitchen]:
        from backend.database.repos import kitchen_repo
        kitchen = kitchen_repo.get(self.kitchen_id)
        return kitchen
    
    def get_default_storage(self) -> Optional[Storage]:
        from backend.database.repos import storage_repo
        storage = storage_repo.get(self.default_storage_id)
        return storage
    
    def get_items(self) -> List['Item']:
        from backend.database.repos import item_repo
        items = item_repo.query([("registry_entry_id", "==", self.id)])
        return items
    
# === Item ===
class Item(BaseDocument):
    name: str
    registry_entry_id: str
    storage_id: str
    buyer_member_id: Optional[str] = None
    allowed_member_usage: Dict[str, float] = Field(default_factory=dict) # {member_id: amount_used}
    total_quantity: float = 0
    current_quantity: float = 0
    preferred_unit: Optional[str]
    cost: Optional[float] = None
    expiry_date: Optional[datetime] = None
    
    def get_registry_entry(self) -> Optional[RegistryEntry]:
        from backend.database.repos import registry_repo
        entry = registry_repo.get(self.registry_entry_id)
        return entry
    
    def get_storage(self) -> Optional[Storage]:
        from backend.database.repos import storage_repo
        storage = storage_repo.get(self.storage_id)
        return storage
    
    def get_kitchen(self) -> Optional[Kitchen]:
        registry_entry = self.get_registry_entry()
        if registry_entry:
            return registry_entry.get_kitchen()
        return None
    
    def get_buyer_member(self) -> Optional[Member]:
        from backend.database.repos import member_repo
        member = member_repo.get(self.buyer_member_id) if self.buyer_member_id else None
        return member
    
    def get_allowed_members(self) -> List[Member]:
        from backend.database.repos import member_repo
        members = member_repo.query([("id", "in", list(self.allowed_member_usage.keys()))])
        return members
    
    def get_usage(self, member: 'Member | str') -> float:
        if isinstance(member, Member):
            return self.allowed_member_usage.get(member.id, 0.0)
        return self.allowed_member_usage.get(member, 0.0)
    
    def set_usage(self, member: 'Member | str', amount: float) -> None:
        if isinstance(member, Member):
            self.allowed_member_usage[member.id] = amount
        else:
            self.allowed_member_usage[member] = amount

# === Order ===
class Order(BaseDocument):
    kitchen_id: str
    buyer_member_id: Optional[str] = None
    status: dict[str, 'OrderStatus'] = Field(default_factory=dict) # {attribute: OrderStatus}
    item_ids: List[str] = Field(default_factory=list)
    
    def get_kitchen(self) -> Optional[Kitchen]:
        from backend.database.repos import kitchen_repo
        kitchen = kitchen_repo.get(self.kitchen_id)
        return kitchen
    
    def get_buyer_member(self) -> Optional[Member]:
        from backend.database.repos import member_repo
        member = member_repo.get(self.buyer_member_id) if self.buyer_member_id else None
        return member
    
    def get_items(self) -> List[Item]:
        from backend.database.repos import item_repo
        items = item_repo.query([("id", "in", self.item_ids)])
        return items
    
    def get_status_of(self, attribute: str) -> 'OrderStatus':
        return self.status.get(attribute, OrderStatus.SKIPPED)
    
    def set_status_of(self, attribute: str, status: 'OrderStatus') -> None:
        self.status[attribute] = status

class OrderStatus(str, Enum):
    SKIPPED = "skipped"
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"

# === Log ===
class LogEntry(BaseDocument):
    kitchen_id: str
    member_id: str
    type: 'LogType'
    title: str
    message: Optional[str] = ""

    def get_kitchen(self) -> Optional[Kitchen]:
        from backend.database.repos import kitchen_repo
        kitchen = kitchen_repo.get(self.kitchen_id)
        return kitchen
    
    def get_member(self) -> Optional[Member]:
        from backend.database.repos import member_repo
        member = member_repo.get(self.member_id) if self.member_id else None
        return member

class LogType(str, Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    DANGER = "danger"

User.model_rebuild()
Member.model_rebuild()
Kitchen.model_rebuild()
Storage.model_rebuild()
RegistryEntry.model_rebuild()
Item.model_rebuild()
Order.model_rebuild()
LogEntry.model_rebuild()