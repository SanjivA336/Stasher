import os
import json
import logging
from typing import Optional, List, Dict, Any, Type, TypeVar
from datetime import datetime, timezone

from google.cloud import firestore
from google.oauth2 import service_account
from backend.models import BaseDocument

# Create a type variable for typed model return
T = TypeVar("T", bound=BaseDocument)

class FirestoreWrapper:
    """
    A wrapper class for Firestore operations with logging.
    Works with typed Pydantic models based on BaseDocument.
    """

    def __init__(self):
        self._db = self._get_firestore_client()
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(name)s - %(message)s'
        )
        self._logger = logging.getLogger(__name__)

    def _get_firestore_client(self) -> firestore.Client:
        creds_json = os.environ.get("FIREBASE_CREDENTIALS")
        if creds_json:
            try:
                service_account_info = json.loads(creds_json)
                credentials = service_account.Credentials.from_service_account_info(service_account_info)
                return firestore.Client(credentials=credentials, project=service_account_info.get("project_id"))
            except Exception as e:
                raise RuntimeError("Failed to parse FIREBASE_CREDENTIALS: " + str(e))

        creds_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "backend/Keys/pantry-firebase-serviceAccount.json")
        if os.path.exists(creds_path):
            try:
                credentials = service_account.Credentials.from_service_account_file(creds_path)
                return firestore.Client(credentials=credentials)
            except Exception as e:
                raise RuntimeError("Failed to load credentials from file: " + str(e))

        raise RuntimeError("No Firestore credentials found.")

    # ----------------
    # CRUD Operations
    # ----------------

    def add_document(self, collection: str, model: T) -> Optional[str]:
        """
        Adds a new BaseDocument model to a collection.
        Fails if document with same ID already exists.
        """
        try:
            model.created_at = datetime.now(timezone.utc)
            data = model.model_dump()
            self._db.collection(collection).document(model.id).create(data)
            self._logger.info(f"Added document to {collection}/{model.id}")
            return model.id
        except Exception as e:
            self._logger.error(f"Error adding document to {collection}: {e}")
            return None

    def get_document(self, collection: str, doc_id: str, model_class: Type[T]) -> Optional[T]:
        """
        Retrieves a document from a collection and parses it into the given model class.
        """
        try:
            doc_ref = self._db.collection(collection).document(doc_id)
            doc = doc_ref.get()
            if not doc.exists:
                self._logger.warning(f"Document not found: {collection}/{doc_id}")
                return None

            data = doc.to_dict()
            data = doc.to_dict()
            if isinstance(data, dict):
                return model_class(**data)
        except Exception as e:
            self._logger.error(f"Failed to get document {collection}/{doc_id}: {e}")
            return None

    def update_document(self, collection: str, doc_id: str, updates: Dict[str, Any]) -> bool:
        """
        Updates a document's fields and sets updated_at.
        """
        try:
            updates["updated_at"] = datetime.now(timezone.utc)
            self._db.collection(collection).document(doc_id).update(updates)
            self._logger.info(f"Updated document in {collection}/{doc_id}: {list(updates.keys())}")
            return True
        except Exception as e:
            self._logger.error(f"Error updating document {collection}/{doc_id}: {e}")
            return False

    def delete_document(self, collection: str, doc_id: str) -> bool:
        try:
            self._db.collection(collection).document(doc_id).delete()
            self._logger.info(f"Deleted document from {collection}/{doc_id}")
            return True
        except Exception as e:
            self._logger.error(f"Failed to delete document {collection}/{doc_id}: {e}")
            return False

    def list_documents(self, collection: str, model_class: Type[T], limit: Optional[int] = None) -> List[T]:
        """
        Returns all documents in a collection (up to limit) parsed as model objects.
        """
        try:
            ref = self._db.collection(collection)
            docs = ref.limit(limit).stream() if limit else ref.stream()
            results = [model_class(**doc.to_dict()) for doc in docs if doc.exists]
            self._logger.info(f"Retrieved {len(results)} documents from {collection}")
            return results
        except Exception as e:
            self._logger.error(f"Error listing documents in {collection}: {e}")
            return []

    def query_collection(
        self,
        collection: str,
        filters: List[tuple],
        model_class: Type[T],
        limit: Optional[int] = None,
    ) -> List[T]:
        """
        Returns filtered and typed list of documents from a collection.
        `filters` = List of tuples like: [("type", "==", "weapon")]
        """
        try:
            ref = self._db.collection(collection)
            q = ref
            for field, op, value in filters:
                q = q.where(field, op, value)
            if limit:
                q = q.limit(limit)
            docs = q.stream()
            results = [model_class(**doc.to_dict()) for doc in docs if doc.exists]
            self._logger.info(f"Query on {collection} returned {len(results)} results.")
            return results
        except Exception as e:
            self._logger.error(f"Error querying {collection} with {filters}: {e}")
            return []
        
    # ----------------
    # Batch Operations
    # ----------------
    def create_batch(self) -> firestore.WriteBatch:
        """
        Creates a new Firestore batch for atomic operations.
        """
        return self._db.batch()
    
    def commit_batch(self, batch: firestore.WriteBatch) -> bool:
        """
        Commits a Firestore batch operation.
        Returns True if successful, False otherwise.
        """
        try:
            batch.commit()
            self._logger.info("Batch commit successful.")
            return True
        except Exception as e:
            self._logger.error(f"Batch commit failed: {e}")
            return False

    def run_transaction(self, transaction_callable) -> Optional[Any]:
        """
        Runs a transaction with retries.
        `transaction_func` should accept a transaction object as its first argument.
        """
        transaction = self._db.transaction()
        try:
            result = transaction_callable(transaction)
            self._logger.info("Transaction completed successfully.")
            return result
        except Exception as e:
            self._logger.error(f"Transaction failed: {e}")
            return None

# Global importable instance
firestore_wrapper = FirestoreWrapper()
