import { doc, onSnapshot, DocumentReference, collection, query, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";

type Callback<T> = (data: T | null) => void;

export class RealtimeDocument<T> {
    private docRef: DocumentReference;
    private unsubscribe: (() => void) | null = null;

    constructor(collection: string, id: string) {
        this.docRef = doc(db, collection, id);
    }

    listen(callback: Callback<T>) {
        if (this.unsubscribe) this.unsubscribe();

        this.unsubscribe = onSnapshot(this.docRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as T);
            } else {
                callback(null);
            }
        });
    }

    stop() {
        if (this.unsubscribe) this.unsubscribe();
    }
}

// Change type for query listener
export type Change<T> = { type: "added" | "modified" | "removed"; doc: T };
type QueryCallback<T> = (changes: Change<T>[]) => void;

export class RealtimeQuery<T> {
    private collectionName: string;
    private constraints: QueryConstraint[];
    private unsubscribe: (() => void) | null = null;

    constructor(collectionName: string, constraints: QueryConstraint[] = []) {
        this.collectionName = collectionName;
        this.constraints = constraints;
    }

    listen(callback: QueryCallback<T>) {
        if (this.unsubscribe) this.unsubscribe();

        const q = query(collection(db, this.collectionName), ...this.constraints);

        this.unsubscribe = onSnapshot(q, (snapshot) => {
            const changes: Change<T>[] = snapshot.docChanges().map(change => ({
                type: change.type, // "added" | "modified" | "removed"
                doc: change.doc.data() as T
            }));
            callback(changes);
        });
    }

    stop() {
        if (this.unsubscribe) this.unsubscribe();
    }
}

export const applyChanges = <T extends { id: string }>(
    prev: Map<string, T>,
    changes: { type: "added" | "modified" | "removed"; doc: T }[]
): Map<string, T> => {
    const next = new Map(prev);
    changes.forEach(c => {
        if (c.type === "added" || c.type === "modified") next.set(c.doc.id, c.doc);
        else if (c.type === "removed") next.delete(c.doc.id);
    });
    return next;
};