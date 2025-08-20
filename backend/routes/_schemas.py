from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from backend.models import *

# === Config ===
EMPTY_STRING = ""
UNKNOWN = "Unknown"
UNNAMED = "Unnamed"


# === === Payloads === ===
# === User ===
class UserPayload(BaseModel):
    id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password_current: Optional[str] = None
    password_new: Optional[str] = None

    def to_model(self, model: User) -> User:
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Member ===
class MemberPayload(BaseModel):
    id: Optional[str] = None
    owner_user_id: Optional[str] = None
    kitchen_id: Optional[str] = None
    nickname: Optional[str] = None
    is_admin: Optional[bool] = None

    def to_model(self, model: Member) -> Member:
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Kitchen ===
class KitchenPayload(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    member_ids: Optional[List[str]] = None
    storage_ids: Optional[List[str]] = None
    registry_entry_ids: Optional[List[str]] = None
    settings: Optional['KitchenSettings'] = None

    def to_model(self, model: Kitchen) -> Kitchen:
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

    
# === Storage Settings ===
class StoragePayload(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    kitchen_id: Optional[str] = None
    type: Optional[StorageType] = StorageType.PANTRY
    description: Optional[str] = None
    item_ids: Optional[List[str]] = None
    ui_settings: Optional['StorageUISettings'] = None

    def to_model(self, model: 'Storage') -> 'Storage':
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Registry Entry ===
class RegistryEntryPayload(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    preferred_unit: Optional[str] = None
    kitchen_id: Optional[str] = None
    default_storage_id: Optional[str] = None
    current_quantity: Optional[float] = None
    item_ids: Optional[List[str]] = None
    food_group: Optional[str] = None

    def to_model(self, model: 'RegistryEntry') -> 'RegistryEntry':
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Item ===
class ItemPayload(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    registry_entry_id: Optional[str] = None
    storage_id: Optional[str] = None
    buyer_member_id: Optional[str] = None
    allowed_member_usage: Optional[Dict[str, float]] = None
    total_quantity: Optional[float] = None
    current_quantity: Optional[float] = None
    preferred_unit: Optional[str] = None
    cost: Optional[float] = None
    expiry_date: Optional[datetime] = None
    
    def to_model(self, model: 'Item') -> 'Item':
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Order ===
class OrderPayload(BaseModel):
    id: Optional[str] = None
    kitchen_id: Optional[str] = None
    buyer_member_id: Optional[str] = None
    status: dict[str, 'OrderStatus'] = Field(default_factory=dict)
    item_ids: Optional[List[str]] = None

    def to_model(self, model: 'Order') -> 'Order':
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === Log ===
class LogEntryPayload(BaseModel):
    id: Optional[str] = None
    kitchen_id: Optional[str] = None
    member_id: Optional[str] = None
    action: Optional[str] = None
    details: Optional[str] = None

    def to_model(self, model: 'LogEntry') -> 'LogEntry':
        update_data = self.model_dump(exclude_unset=True)
        updated_model = model.model_copy(deep=True)
        for field, value in update_data.items():
            setattr(updated_model, field, value)
        return updated_model

# === === Responses === ===
class UserProtected(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    username: str
    email: EmailStr
    member_ids: List[str] = Field(default_factory=list)
    
    @staticmethod
    def from_model(model: User) -> "UserProtected":
        schema = UserProtected(
            id=model.id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            username=model.username or UNKNOWN,
            email=model.email,
            member_ids=model.member_ids
        )
        return schema

UserPayload.model_rebuild()
MemberPayload.model_rebuild()
KitchenPayload.model_rebuild()
StoragePayload.model_rebuild()
RegistryEntryPayload.model_rebuild()
ItemPayload.model_rebuild()
OrderPayload.model_rebuild()
LogEntryPayload.model_rebuild()

UserProtected.model_rebuild()