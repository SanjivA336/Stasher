import type { Item, Label, Member, Order, Stash, Storage } from "@/apis/schemas";
import { createContext, useContext } from "react";

export type StashContextTypeUnsafe = {
    stashId: string | null;
    setActiveStash: (id: string | null) => Promise<void>;
    stashLoading: boolean;
    stash: Stash | null;
    members: Member[];
    storages: Storage[];
    labels: Label[];
    items: Item[];
    orders: Order[];
};

export type StashContextType = {
    setActiveStash: (id: string | null) => Promise<void>;
    stash: Stash;
    members: Member[];
    storages: Storage[];
    labels: Label[];
    items: Item[];
    orders: Order[];
};

export const StashContext = createContext<StashContextTypeUnsafe | undefined>(undefined);

export const useStashSettings = (): StashContextTypeUnsafe => {
    const context = useContext(StashContext);

    if (!context) {
        throw new Error("useStashContext must be used within a StashProvider");
    }

    return context;
};

export const useStash = (): StashContextType => {
    const context = useContext(StashContext);

    if (!context) {
        throw new Error("useStash must be used within a StashProvider");
    }

    if (!context.stashId) {
        throw new Error("No stash is currently selected");
    }

    return {
        setActiveStash: context.setActiveStash,
        stash: context.stash!,
        members: context.members,
        storages: context.storages,
        labels: context.labels,
        items: context.items,
        orders: context.orders,
    } as StashContextType;
};