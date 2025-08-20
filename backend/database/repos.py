# database/base_repo.py
from typing import TypeVar, Generic, Type, List, Optional, Dict, Any
from backend.models import BaseDocument
from backend.database.firestore_wrapper import firestore_wrapper

from datetime import datetime, timezone
from uuid import uuid4

T = TypeVar("T", bound=BaseDocument)

class BaseRepo(Generic[T]):
    def __init__(self, model_cls: Type[T], collection: str):
        self._db = firestore_wrapper
        self._collection = collection
        self._model_cls = model_cls

    def get(self, id: str) -> Optional[T]:
        return self._db.get_document(self._collection, id, self._model_cls)

    def add(self, obj: T) -> Optional[T]:
        obj.id = uuid4().hex
        obj.created_at = datetime.now(timezone.utc)
        obj.updated_at = datetime.now(timezone.utc)
        if self._db.add_document(self._collection, obj):
            return self.get(obj.id)
        return None

    def update(self, obj: T) -> Optional[T]:
        obj.updated_at = datetime.now(timezone.utc)
        if self._db.update_document(self._collection, obj.id, obj.model_dump(exclude_unset=True)):
            return self.get(obj.id)
        return None

    def delete(self, id: str) -> bool:
        self._db.delete_document(self._collection, id)
        return self.get(id) is None

    def list(self, limit: Optional[int] = None) -> List[T]:
        return self._db.list_documents(self._collection, self._model_cls, limit)

    def query(self, filters: List[tuple], limit: Optional[int] = None) -> List[T]:
        return self._db.query_collection(self._collection, filters, self._model_cls, limit)


from backend.models import (
    User, Member, Kitchen, Storage, RegistryEntry, Item, Order, LogEntry
)

user_repo = BaseRepo[User](User, "users")
member_repo = BaseRepo[Member](Member, "members")
kitchen_repo = BaseRepo[Kitchen](Kitchen, "kitchens")
storage_repo = BaseRepo[Storage](Storage, "storages")
registry_repo = BaseRepo[RegistryEntry](RegistryEntry, "registry")
item_repo = BaseRepo[Item](Item, "items")
order_repo = BaseRepo[Order](Order, "orders")
log_repo = BaseRepo[LogEntry](LogEntry, "logs")