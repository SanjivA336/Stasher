import type { Item, Label, Member, Order, Stash, Storage } from "@/apis/schemas";
import { createContext, useContext } from "react";

export type StashContextTypeUnsafe = {
    stashId: string | null;
    setActiveStash: (id: string | null) => Promise<void>;
    loadingContext: boolean;

    stash: Stash | null;
    members: Map<string, Member>;
    storages: Map<string, Storage>;
    labels: Map<string, Label>;
    items: Map<string, Item>;
    orders: Map<string, Order>;

    loadingStash: boolean;
    loadingMembers: boolean;
    loadingStorages: boolean;
    loadingLabels: boolean;
    loadingItems: boolean;
    loadingOrders: boolean;
};

export type StashContextType = {
    setActiveStash: (id: string | null) => Promise<void>;
    loadingContext: boolean;

    stash: Stash;
    members: Map<string, Member>;
    storages: Map<string, Storage>;
    labels: Map<string, Label>;
    items: Map<string, Item>;
    orders: Map<string, Order>;

    loadingStash: boolean;
    loadingMembers: boolean;
    loadingStorages: boolean;
    loadingLabels: boolean;
    loadingItems: boolean;
    loadingOrders: boolean;
};

export const StashContext = createContext<StashContextTypeUnsafe | undefined>(undefined);

export const useStash = (): StashContextTypeUnsafe => {
    const context = useContext(StashContext);

    if (!context) {
        throw new Error("useStashContext must be used within a StashProvider");
    }

    return context;
};

export const useStashData = (): StashContextType => {
    const context = useContext(StashContext);

    if (!context) {
        throw new Error("useStash must be used within a StashProvider");
    }

    if (!context.stashId) {
        throw new Error("No stash is currently selected");
    }

    return {
        setActiveStash: context.setActiveStash,
        loadingContext: context.loadingContext,

        stash: context.stash!,
        members: context.members,
        storages: context.storages,
        labels: context.labels,
        items: context.items,
        orders: context.orders,

        loadingStash: context.loadingStash,
        loadingMembers: context.loadingMembers,
        loadingStorages: context.loadingStorages,
        loadingLabels: context.loadingLabels,
        loadingItems: context.loadingItems,
        loadingOrders: context.loadingOrders,
    };
};
