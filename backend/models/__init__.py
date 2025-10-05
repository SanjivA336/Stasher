from models import (
    # Base/Core Models
    BaseDocument,

    # Identity Models
    User, 
    Member,

    # Structural Models
    Stash, 
    Storage,
    Label,
    
    # Transactional Models
    Item, 
    Order, 
    Event,
    
    # Supporting Models
    StorageType,
    OrderStatus,
    EventType,
)

from schemas import (
    # Base/Core Schemas
    BasePayload,
    
    # Special Response Schemas
    UserProtected,
    
    # Identity Schemas
    UserPayload,
    MemberPayload,
    
    # Structural Schemas
    StashPayload,
    StoragePayload,
    LabelPayload,
    
    # Transactional Schemas
    ItemPayload,
    OrderPayload,
    EventPayload,
)


BASE = [BaseDocument, BasePayload]

IDENTITY_MODELS = [User, Member]
STRUCTURAL_MODELS = [Stash, Storage, StorageType, Label]
TRANSACTIONAL_MODELS = [Item, Order, OrderStatus, Event, EventType]

IDENTITY_SCHEMAS = [UserProtected, UserPayload, MemberPayload]
STRUCTURAL_SCHEMAS = [StashPayload, StoragePayload, StorageType, LabelPayload]
TRANSACTIONAL_SCHEMAS = [ItemPayload, OrderPayload, OrderStatus, EventPayload, EventType]

IDENTITY_ALL = IDENTITY_MODELS + IDENTITY_SCHEMAS + BASE
STRUCTURAL_ALL = STRUCTURAL_MODELS + STRUCTURAL_SCHEMAS + BASE
TRANSACTIONAL_ALL = TRANSACTIONAL_MODELS + TRANSACTIONAL_SCHEMAS + BASE

MODELS_ALL = IDENTITY_ALL + STRUCTURAL_ALL + TRANSACTIONAL_ALL + [BaseDocument]
SCHEMAS_ALL = IDENTITY_SCHEMAS + STRUCTURAL_SCHEMAS + TRANSACTIONAL_SCHEMAS + [BasePayload]

__all__ = [
    "BaseDocument",
    "BasePayload",
    "User",
    "Member",
    "Stash",
    "Storage",
    "StorageType",
    "Label",
    "Item",
    "Order",
    "OrderStatus",
    "Event",
    "EventType",
    "UserProtected",
    "UserPayload",
    "MemberPayload",
    "StashPayload",
    "StoragePayload",
    "LabelPayload",
    "ItemPayload",
    "OrderPayload",
    "EventPayload",
]