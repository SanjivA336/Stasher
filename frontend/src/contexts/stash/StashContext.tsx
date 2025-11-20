import { useState, useEffect, useRef } from "react";
import { useAuth } from "@contexts/auth/AuthContextValue";
import { CurrentAPI } from "@apis/identityApi";
import { useToast } from "@contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { StashContext } from "./StashContextValue";
import type { Item, Label, Member, Order, Stash, Storage } from "@/apis/schemas";
import { applyChanges, RealtimeDocument, RealtimeQuery } from "@/apis/listeners";
import { where } from "firebase/firestore";

const STASH_ID_LOCATION = "activeStashId";

export const StashProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [stashId, setStashId] = useState<string | null>(null);

    const [stash, setStash] = useState<Stash | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [storages, setStorages] = useState<Storage[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Single listeners
    const stashListener = useRef<RealtimeDocument<Stash> | null>(null);
    const membersListener = useRef<RealtimeQuery<Member> | null>(null);
    const storagesListener = useRef<RealtimeQuery<Storage> | null>(null);
    const labelsListener = useRef<RealtimeQuery<Label> | null>(null);
    const ordersListener = useRef<RealtimeQuery<Order> | null>(null);

    // Multi listener for items
    const itemsListeners = useRef<RealtimeQuery<Item>[] | null>(null);

    const setActiveStash = async (id: string | null) => {
        setLoading(true);

        try {
            if (id) {
                const response: boolean = await CurrentAPI.check_access(id);
                if (response) {
                    setStashId(id);
                    localStorage.setItem(STASH_ID_LOCATION, id);
                } else {
                    setStashId(null);
                    localStorage.removeItem(STASH_ID_LOCATION);
                }
            } else {
                setStashId(null);
                localStorage.removeItem(STASH_ID_LOCATION);
            }
        } catch (error) {
            if (user) toast("danger", getError(error));
            setStashId(null);
            localStorage.removeItem(STASH_ID_LOCATION);
        }

        setLoading(false);
    };

    useEffect(() => {
        const savedId = localStorage.getItem(STASH_ID_LOCATION);
        setActiveStash(savedId);
    }, [user]);

    useEffect(() => {
        if (!stashId) return;

        // Stash
        stashListener.current?.stop();
        stashListener.current = new RealtimeDocument<Stash>("stashes", stashId);
        stashListener.current.listen(setStash);

        // Members
        membersListener.current?.stop();
        membersListener.current = new RealtimeQuery<Member>(
            "members",
            [where("stash_id", "==", stashId)]
        );
        membersListener.current.listen(changes => {
            setMembers(prev => applyChanges(prev, changes));
        });

        // Storages
        storagesListener.current?.stop();
        storagesListener.current = new RealtimeQuery<Storage>(
            "storages",
            [where("stash_id", "==", stashId)]
        );
        storagesListener.current.listen(changes => {
            setStorages(prev => applyChanges(prev, changes));
        });

        // Labels
        labelsListener.current?.stop();
        labelsListener.current = new RealtimeQuery<Label>(
            "labels",
            [where("stash_id", "==", stashId)]
        );
        labelsListener.current.listen(changes => {
            setLabels(prev => applyChanges(prev, changes));
        });

        // Orders
        ordersListener.current?.stop();
        ordersListener.current = new RealtimeQuery<Order>(
            "orders",
            [where("stash_id", "==", stashId)]
        );
        ordersListener.current.listen(changes => {
            setOrders(prev => applyChanges(prev, changes));
        });

        return () => {
            stashListener.current?.stop();
            membersListener.current?.stop();
            storagesListener.current?.stop();
            labelsListener.current?.stop();
            ordersListener.current?.stop();
        };
    }, [stashId]);

    useEffect(() => {
        if (!stashId || storages.length === 0) {
            setItems([]);
            return;
        }

        const queries: RealtimeQuery<Item>[] = [];

        const itemMap = new Map<string, Item>();

        for (const storage of storages) {
            const q = new RealtimeQuery<Item>("items", [where("storage_id", "==", storage.id)]);
            queries.push(q);

            q.listen((changes) => {
                // Apply each change type to the map
                changes.forEach(change => {
                    if (change.type === "added" || change.type === "modified") {
                        itemMap.set(change.doc.id, change.doc);
                    } else if (change.type === "removed") {
                        itemMap.delete(change.doc.id);
                    }
                });

                setItems(Array.from(itemMap.values()));
            });
        }

        itemsListeners.current = queries;

        return () => {
            queries.forEach(q => q.stop());
        };
    }, [storages, stashId]);


    return (
        <StashContext.Provider
            value={{
                stashId,
                setActiveStash,
                stashLoading: loading,
                stash,
                members,
                storages,
                labels,
                items,
                orders
            }}
        >
            {children}
        </StashContext.Provider>
    );
};
