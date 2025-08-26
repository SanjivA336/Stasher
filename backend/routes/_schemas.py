from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from backend.models import *

# === Config ===
EMPTY_STRING = ""
UNKNOWN = "Unknown"
UNNAMED = "Unnamed"



# === === Responses === ===

# === User (Protected) ===
class UserProtected(BaseDocument):
    username: str
    email: EmailStr
    member_ids: List[str] = Field(default_factory=list)

    @staticmethod
    def from_model(model: User) -> 'UserProtected':
        
        schema = UserProtected(
            id=model.id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            username=model.username or UNKNOWN,
            email=model.email,
            member_ids=model.member_ids or []
        )
        return schema



# === === Payloads === ===

# === Base ===
class BasePayload(BaseModel):
    id: Optional[str] = None

# === User ===
class UserPayload(BasePayload):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password_current: Optional[str] = None
    password_new: Optional[str] = None
    member_ids: Optional[List[str]] = None

    def to_model(self, model: User, preserve: bool) -> User:
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Member ===
class MemberPayload(BasePayload):
    owner_user_id: Optional[str] = None
    stash_id: Optional[str] = None
    nickname: Optional[str] = None
    debts: Optional[dict[str, float]] = None # {member_id: amount_owed}
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None

    def to_model(self, model: Member, preserve: bool) -> Member:
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Stash ===
class StashPayload(BasePayload):
    name: Optional[str] = None
    address: Optional[str] = None
    member_ids: Optional[List[str]] = None
    storage_ids: Optional[List[str]] = None
    label_ids: Optional[List[str]] = None
    join_code: Optional[str] = None
    
    def to_model(self, model: Stash, preserve: bool) -> Stash:
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

    
# === Storage Settings ===
class StoragePayload(BasePayload):
    name: Optional[str] = None
    stash_id: Optional[str] = None
    type: Optional[StorageType] = StorageType.PANTRY
    description: Optional[str] = None
    item_ids: Optional[List[str]] = None

    def to_model(self, model: 'Storage', preserve: bool) -> 'Storage':
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Label ===
class LabelPayload(BasePayload):
    name: Optional[str] = None
    preferred_unit: Optional[str] = None
    stash_id: Optional[str] = None
    default_storage_id: Optional[str] = None
    current_quantity: Optional[float] = None
    item_ids: Optional[List[str]] = None
    food_group: Optional[str] = None

    def to_model(self, model: 'Label', preserve: bool) -> 'Label':
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Item ===
class ItemPayload(BasePayload):
    name: Optional[str] = None
    label_id: Optional[str] = None
    storage_id: Optional[str] = None
    buyer_member_id: Optional[str] = None
    allowed_member_usage: Optional[Dict[str, float]] = None
    total_quantity: Optional[float] = None
    current_quantity: Optional[float] = None
    preferred_unit: Optional[str] = None
    cost: Optional[float] = None
    expiry_date: Optional[datetime] = None

    def to_model(self, model: 'Item', preserve: bool) -> 'Item':
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Order ===
class OrderPayload(BasePayload):
    stash_id: Optional[str] = None
    buyer_member_id: Optional[str] = None
    status: dict[str, 'OrderStatus'] = Field(default_factory=dict)
    item_ids: Optional[List[str]] = None

    def to_model(self, model: 'Order', preserve: bool) -> 'Order':
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model

# === Event ===
class EventPayload(BasePayload):
    stash_id: Optional[str] = None
    member_id: Optional[str] = None
    type: Optional['EventType'] = None
    title: Optional[str] = None
    message: Optional[str] = None

    def to_model(self, model: 'Event', preserve: bool) -> 'Event':
        update_data = self.model_dump(exclude_unset=True)
        if preserve:
            updated_model = model.model_copy(deep=True)
            for field, value in update_data.items():
                setattr(updated_model, field, value)
            return updated_model
        else:
            for field, value in update_data.items():
                setattr(model, field, value)
            return model



# === === Pydantic Model Rebuilds === ===

UserProtected.model_rebuild()

UserPayload.model_rebuild()
MemberPayload.model_rebuild()
StashPayload.model_rebuild()
StoragePayload.model_rebuild()
LabelPayload.model_rebuild()
ItemPayload.model_rebuild()
OrderPayload.model_rebuild()
EventPayload.model_rebuild()

