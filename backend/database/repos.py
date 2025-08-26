# database/base_repo.py
from typing import TypeVar, Generic, Type, List, Optional, Dict, Any
from backend.models import BaseDocument
from backend.database.firestore_wrapper import firestore_wrapper
from google.cloud import firestore

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
    
    def batch_add(self, batch: firestore.WriteBatch, obj: T):
        obj.created_at = datetime.now(timezone.utc)
        obj.updated_at = datetime.now(timezone.utc)
        doc_ref = self._db._db.collection(self._collection).document(obj.id)
        batch.set(doc_ref, obj.model_dump())

    def batch_update(self, batch: firestore.WriteBatch, obj: T):
        obj.updated_at = datetime.now(timezone.utc)
        doc_ref = self._db._db.collection(self._collection).document(obj.id)
        batch.update(doc_ref, obj.model_dump(exclude_unset=True))
    
    def batch_delete(self, batch: firestore.WriteBatch, doc_id: str):
        doc_ref = self._db._db.collection(self._collection).document(doc_id)
        batch.delete(doc_ref)
    
from backend.models import (
    User, Member, Stash, Storage, Label, Item, Order, Event
)

user_repo = BaseRepo[User](User, "users")
member_repo = BaseRepo[Member](Member, "members")
stash_repo = BaseRepo[Stash](Stash, "stashes")
storage_repo = BaseRepo[Storage](Storage, "storages")
label_repo = BaseRepo[Label](Label, "labels")
item_repo = BaseRepo[Item](Item, "items")
order_repo = BaseRepo[Order](Order, "orders")
event_repo = BaseRepo[Event](Event, "events")