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

    const [stashId, setStashId] = useState<string | null>(null);
    const [loadingContext, setLoadingContext] = useState<boolean>(false);

    // States as Maps
    const [stash, setStash] = useState<Stash | null>(null);
    const [members, setMembers] = useState<Map<string, Member>>(new Map());
    const [storages, setStorages] = useState<Map<string, Storage>>(new Map());
    const [labels, setLabels] = useState<Map<string, Label>>(new Map());
    const [items, setItems] = useState<Map<string, Item>>(new Map());
    const [orders, setOrders] = useState<Map<string, Order>>(new Map());

    // Listeners
    const stashListener = useRef<RealtimeDocument<Stash> | null>(null);
    const membersListener = useRef<RealtimeQuery<Member> | null>(null);
    const storagesListener = useRef<RealtimeQuery<Storage> | null>(null);
    const labelsListener = useRef<RealtimeQuery<Label> | null>(null);
    const ordersListener = useRef<RealtimeQuery<Order> | null>(null);
    const itemsListeners = useRef<RealtimeQuery<Item>[] | null>(null);

    // Loading states
    const [loadingStash, setLoadingStash] = useState<boolean>(loadingContext);
    const [loadingMembers, setLoadingMembers] = useState<boolean>(loadingContext);
    const [loadingStorages, setLoadingStorages] = useState<boolean>(loadingContext);
    const [loadingLabels, setLoadingLabels] = useState<boolean>(loadingContext);
    const [loadingItems, setLoadingItems] = useState<boolean>(loadingContext);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(loadingContext);


    const setActiveStash = async (id: string | null) => {
        setLoadingContext(true);

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

        setLoadingContext(false);
    };

    useEffect(() => {
        const savedId = localStorage.getItem(STASH_ID_LOCATION);
        setActiveStash(savedId);
    }, [user]);

    useEffect(() => {
        if (!stashId) return;

        // Stash
        stashListener.current?.stop();
        setLoadingStash(true);
        stashListener.current = new RealtimeDocument<Stash>("stashes", stashId);
        stashListener.current.listen(doc => {
            setStash(doc);
            setLoadingStash(false);
        });

        // Members
        membersListener.current?.stop();
        setLoadingMembers(true);
        membersListener.current = new RealtimeQuery<Member>("members", [where("stash_id", "==", stashId)]);
        membersListener.current.listen(changes => {
            setMembers(prev => applyChanges(prev, changes));
            setLoadingMembers(false);
        });

        // Storages
        storagesListener.current?.stop();
        setLoadingStorages(true);
        storagesListener.current = new RealtimeQuery<Storage>("storages", [where("stash_id", "==", stashId)]);
        storagesListener.current.listen(changes => {
            setStorages(prev => applyChanges(prev, changes));
            setLoadingStorages(false);
        });

        // Labels
        labelsListener.current?.stop();
        setLoadingLabels(true);
        labelsListener.current = new RealtimeQuery<Label>("labels", [where("stash_id", "==", stashId)]);
        labelsListener.current.listen(changes => {
            setLabels(prev => applyChanges(prev, changes));
            setLoadingLabels(false);
        });

        // Orders
        ordersListener.current?.stop();
        setLoadingOrders(true);
        ordersListener.current = new RealtimeQuery<Order>("orders", [where("stash_id", "==", stashId)]);
        ordersListener.current.listen(changes => {
            setOrders(prev => applyChanges(prev, changes));
            setLoadingOrders(false);
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
        if (!stashId || storages.size === 0) {
            setItems(new Map());
            setLoadingItems(false);
            return;
        }

        setLoadingItems(true);

        const queries: RealtimeQuery<Item>[] = [];
        const itemMap = new Map<string, Item>();


        for (const storage of storages.values()) {
            const q = new RealtimeQuery<Item>("items", [where("storage_id", "==", storage.id)]);
            queries.push(q);

            q.listen(changes => {
                changes.forEach(c => {
                    if (c.type === "added" || c.type === "modified") itemMap.set(c.doc.id, c.doc);
                    else if (c.type === "removed") itemMap.delete(c.doc.id);
                });
                setItems(new Map(itemMap));
                setLoadingItems(false);
            });
        }

        itemsListeners.current = queries;

        return () => {
            queries.forEach(q => q.stop());
            itemsListeners.current = null;
            setLoadingItems(false);
        };
    }, [storages, stashId]);

    return (
        <StashContext.Provider
            value={{
                stashId,
                setActiveStash,
                loadingContext,

                stash,
                members,
                storages,
                labels,
                items,
                orders,

                loadingAny: loadingStash || loadingMembers || loadingStorages || loadingLabels || loadingItems || loadingOrders,
                loadingStash,
                loadingMembers,
                loadingStorages,
                loadingLabels,
                loadingItems,
                loadingOrders
            }}
        >
            {children}
        </StashContext.Provider>
    );
};
