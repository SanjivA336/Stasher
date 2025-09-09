import type { Member, Stash, Label, Storage, Item, Event, Order, User } from "./_schemas";
import { MemberAPI, StashAPI, StorageAPI, LabelAPI, ItemAPI, EventAPI, OrderAPI, CurrentAPI } from "./repo_api";
import type { MemberPayload, StoragePayload, LabelPayload, ItemPayload, EventPayload, OrderPayload } from "./_schemas";
export class StashLoader {
    stash: Stash | null = null;

    private members: Record<string, Member> | null = null;
    private labels: Record<string, Label> | null = null;
    private storages: Record<string, Storage> | null = null;
    private events: Record<string, Event> | null = null;
    private orders: Record<string, Order> | null = null;
    private items: Record<string, Item> | null = null;

    private current_member_id: string | null = null;

    constructor() {
        this.clear();
    }

    async init (stashId: string, user: User) {
        try {
            const stash: Stash = await StashAPI.get(stashId);
            this.stash = stash;

            this.current_member_id = (await CurrentAPI.get_current_member(stashId))?.id || null;

            this.members = null;
            this.labels = null;
            this.storages = null;
            this.events = null;
            this.orders = null;
            this.items = null;
        } catch (error) {
            console.error("Failed to fetch stash: " + error);
            this.stash = null;
            return;
        }
    }

    clear () {
        this.stash = null;
        this.members = null;
        this.labels = null;
        this.storages = null;
        this.events = null;
        this.orders = null;
        this.items = null;
        this.current_member_id = null;
    }

    is_loaded(): this is { stash: Stash } {
        return this.stash !== null;
    }

    // Force Loaders

    private async load_members(): Promise<boolean> {
        try {
            this.members = {};
            const response: Member[] = await StashAPI.get_all_members(this.stash!.id);
            for (const member of response) {
                this.members[member.id] = member;
            }
            return true;
        } catch (error) {
            this.members = null;
            throw new Error("Failed to load members: " + error);
        }
    }

    private async load_labels(): Promise<boolean> {
        try {
            this.labels = {};
            const response: Label[] = await StashAPI.get_labels(this.stash!.id);
            for (const label of response) {
                this.labels[label.id] = label;
            }
            return true;
        } catch (error) {
            this.labels = null;
            throw new Error("Failed to load labels: " + error);
        }
    }

    private async load_storages(): Promise<boolean> {
        try {
            this.storages = {};
            const response: Storage[] = await StashAPI.get_storages(this.stash!.id);
            for (const storage of response) {
                this.storages[storage.id] = storage;
            }
            return true;
        } catch (error) {
            this.storages = null;
            throw new Error("Failed to load storages: " + error);
        }
    }

    private async load_events(): Promise<boolean> {
        try {
            this.events = {};
            const response: Event[] = await StashAPI.get_events(this.stash!.id);
            for (const event of response) {
                this.events[event.id] = event;
            }
            return true;
        } catch (error) {
            this.events = null;
            throw new Error("Failed to load events: " + error);
        }
    }

    private async load_orders(): Promise<boolean> {
        try {
            this.orders = {};
            const response: Order[] = await StashAPI.get_orders(this.stash!.id);
            for (const order of response) {
                this.orders[order.id] = order;
            }
            return true;
        } catch (error) {
            this.orders = null;
            throw new Error("Failed to load orders: " + error);
        }
    }

    private async load_items(): Promise<boolean> {
        try {
            this.items = {};
            const response: Item[] = await StashAPI.get_items(this.stash!.id);
            for (const item of response) {
                this.items[item.id] = item;
            }
            return true;
        } catch (error) {
            this.items = null;
            throw new Error("Failed to load items: " + error);
        }
    }

    // Load all data at once (even if not currently loaded)
    async load_all(): Promise<boolean> {
        try {
            const results = await Promise.all([
                this.load_members(),
                this.load_labels(),
                this.load_storages(),
                this.load_events(),
                this.load_orders(),
                this.load_items()
            ]);
            return results.every(r => r);
        } catch (error) {
            throw new Error("Failed to load all stash data: " + error);
        }
    }
    
    // Refreshers (if already loaded, reload)
    async refresh_all(): Promise<boolean> {
        if (!this.stash) {
            throw new Error("Stash not loaded");
        }

        try {
            const tasks: Promise<boolean>[] = [];

            if (this.members !== null) {
                tasks.push(this.load_members());
            }
            if (this.labels !== null) {
                tasks.push(this.load_labels());
            }
            if (this.storages !== null) {
                tasks.push(this.load_storages());
            }
            if (this.events !== null) {
                tasks.push(this.load_events());
            }
            if (this.orders !== null) {
                tasks.push(this.load_orders());
            }
            if (this.items !== null) {
                tasks.push(this.load_items());
            }

            const results = await Promise.all(tasks);
            return results.every(r => r);
        } catch (error) {
            throw new Error("Failed to refresh all loaded stash data: " + error);
        }
    }

    // General Fetchers

    async fetch_members(refresh: boolean=false, admin_only: boolean=false, active_only: boolean=true): Promise<Member[]> {
        try {
            if (!this.members || refresh) {
                await this.load_members();
            }

            let filtered = Object.values(this.members!);
            if (admin_only) filtered = filtered.filter(m => m.is_admin);
            if (active_only) filtered = filtered.filter(m => m.is_active);
            filtered.sort((a: Member, b: Member) => a.nickname.localeCompare(b.nickname));

            return filtered;
        } catch (error) {
            throw new Error("Failed to fetch members: " + error);
        }
    }

    async fetch_member(member_id: string, refresh: boolean=false): Promise<Member> {
        try {
            if (!this.members || refresh) {
                await this.load_members();
            }
            const member = this.members![member_id];
            if (member) return member;

            console.warn("Member not found in cache, retrying load...");

            await this.load_members();
            const member_retry = this.members![member_id];
            if (member_retry) return member_retry;

            throw new Error("Member not found");
        } catch (error) {
            throw new Error("Failed to fetch member: " + error);
        }
    }

    async fetch_storages(refresh: boolean=false): Promise<Storage[]> {
        try {
            if (!this.storages || refresh) {
                await this.load_storages();
            }
            return Object.values(this.storages!);
        } catch (error) {
            throw new Error("Failed to fetch storages: " + error);
        }
    }

    async fetch_storage(storage_id: string, refresh: boolean=false): Promise<Storage> {
        try {
            if (!this.storages || refresh) {
                await this.load_storages();
            }
            const storage = this.storages![storage_id];
            if (storage) return storage;

            console.warn("Storage not found in cache, retrying load...");

            await this.load_storages();
            const storage_retry = this.storages![storage_id];
            if (storage_retry) return storage_retry;

            throw new Error("Storage not found");
        } catch (error) {
            throw new Error("Failed to fetch storage: " + error);
        }
    }

    async fetch_labels(refresh: boolean=false): Promise<Label[]> {
        try {
            if (!this.labels || refresh) {
                await this.load_labels();
            }
            return Object.values(this.labels!);
        } catch (error) {
            throw new Error("Failed to fetch labels: " + error);
        }
    }

    async fetch_label(label_id: string, refresh: boolean=false): Promise<Label> {
        try {
            if (!this.labels || refresh) {
                await this.load_labels();
            }
            const label = this.labels![label_id];
            if (label) return label;

            console.warn("Label not found in cache, retrying load...");

            await this.load_labels();
            const label_retry = this.labels![label_id];
            if (label_retry) return label_retry;

            throw new Error("Label not found");
        } catch (error) {
            throw new Error("Failed to fetch label: " + error);
        }
    }

    async fetch_items(refresh: boolean=false): Promise<Item[]> {
        try {
            if (!this.items || refresh) {
                await this.load_items();
            }
            return Object.values(this.items!);
        } catch (error) {
            throw new Error("Failed to fetch items: " + error);
        }
    }

    async fetch_item(item_id: string, refresh: boolean=false): Promise<Item> {
        try {
            if (!this.items || refresh) {
                await this.load_items();
            }
            const item = this.items![item_id];
            if (item) return item;

            console.warn("Item not found in cache, retrying load...");

            await this.load_items();
            const item_retry = this.items![item_id];
            if (item_retry) return item_retry;

            throw new Error("Item not found");
        } catch (error) {
            throw new Error("Failed to fetch item: " + error);
        }
    }

    async fetch_events(refresh: boolean=false): Promise<Event[]> {
        try {
            if (!this.events || refresh) {
                await this.load_events();
            }
            return Object.values(this.events!);
        } catch (error) {
            throw new Error("Failed to fetch events: " + error);
        }
    }

    async fetch_event(event_id: string, refresh: boolean=false): Promise<Event> {
        try {
            if (!this.events || refresh) {
                await this.load_events();
            }
            const event = this.events![event_id];
            if (event) return event;

            console.warn("Event not found in cache, retrying load...");

            await this.load_events();
            const event_retry = this.events![event_id];
            if (event_retry) return event_retry;

            throw new Error("Event not found");
        } catch (error) {
            throw new Error("Failed to fetch event: " + error);
        }
    }

    async fetch_orders(refresh: boolean=false): Promise<Order[]> {
        try {
            if (!this.orders || refresh) {
                await this.load_orders();
            }
            return Object.values(this.orders!);
        } catch (error) {
            throw new Error("Failed to fetch orders: " + error);
        }
    }

    async fetch_order(order_id: string, refresh: boolean=false): Promise<Order> {
        try {
            if (!this.orders || refresh) {
                await this.load_orders();
            }
            const order = this.orders![order_id];
            if (order) return order;

            console.warn("Order not found in cache, retrying load...");

            await this.load_orders();
            const order_retry = this.orders![order_id];
            if (order_retry) return order_retry;

            throw new Error("Order not found");
        } catch (error) {
            throw new Error("Failed to fetch order: " + error);
        }
    }

    // General Updaters

    async update_member(payload: MemberPayload): Promise<Member> {
        try {
            const updated_member = await MemberAPI.update(payload);
            if (updated_member) {
                this.members![updated_member.id] = updated_member;
                return updated_member;
            }
            throw new Error("Failed to update member");
        } catch (error) {
            throw new Error("Failed to update member: " + error);
        }
    }

    async update_storage(payload: StoragePayload): Promise<Storage> {
        try {
            payload.stash_id = this.stash!.id;
            const updated_storage = await StorageAPI.update(payload);
            if (updated_storage) {
                this.storages![updated_storage.id] = updated_storage;
                return updated_storage;
            }
            throw new Error("Failed to update storage");
        } catch (error) {
            throw new Error("Failed to update storage: " + error);
        }
    }

    async update_label(payload: LabelPayload): Promise<Label> {
        try {
            payload.stash_id = this.stash!.id;
            const updated_label = await LabelAPI.update(payload);
            if (updated_label) {
                this.labels![updated_label.id] = updated_label;
                return updated_label;
            }
            throw new Error("Failed to update label");
        } catch (error) {
            throw new Error("Failed to update label: " + error);
        }
    }

    async update_item(payload: ItemPayload): Promise<Item> {
        try {
            const updated_item = await ItemAPI.update(payload);
            if (updated_item) {
                this.items![updated_item.id] = updated_item;
                return updated_item;
            }
            throw new Error("Failed to update item");
        } catch (error) {
            throw new Error("Failed to update item: " + error);
        }
    }

    async update_event(payload: EventPayload): Promise<Event> {
        try {
            const updated_event = await EventAPI.update(payload);
            if (updated_event) {
                this.events![updated_event.id] = updated_event;
                return updated_event;
            }
            throw new Error("Failed to update event");
        } catch (error) {
            throw new Error("Failed to update event: " + error);
        }
    }

    async update_order(payload: OrderPayload): Promise<Order> {
        try {
            const updated_order = await OrderAPI.update(payload);
            if (updated_order) {
                this.orders![updated_order.id] = updated_order;
                return updated_order;
            }
            throw new Error("Failed to update order");
        } catch (error) {
            throw new Error("Failed to update order: " + error);
        }
    }

    // General Creators

    async create_member(payload: MemberPayload): Promise<Member> {
        throw new Error("Not currently implemented. Coming soon! Will eventually be the join method.");
    }

    async create_storage(payload: StoragePayload): Promise<Storage> {
        try {
            payload.stash_id = this.stash!.id;
            const new_storage = await StorageAPI.create(payload);
            if (new_storage) {
                this.storages![new_storage.id] = new_storage;
                return new_storage;
            }
            throw new Error("Failed to create storage");
        } catch (error) {
            throw new Error("Failed to create storage: " + error);
        }
    }

    async create_label(payload: LabelPayload): Promise<Label> {
        try {
            payload.stash_id = this.stash!.id;
            const new_label = await LabelAPI.create(payload);
            if (new_label) {
                this.labels![new_label.id] = new_label;
                return new_label;
            }
            throw new Error("Failed to create label");
        } catch (error) {
            throw new Error("Failed to create label: " + error);
        }
    }

    async create_item(payload: ItemPayload): Promise<Item> {
        try {
            const new_item = await ItemAPI.create(payload);
            if (new_item) {
                this.items![new_item.id] = new_item;
                return new_item;
            }
            throw new Error("Failed to create item");
        } catch (error) {
            throw new Error("Failed to create item: " + error);
        }
    }

    async create_event(payload: EventPayload): Promise<Event> {
        try {
            const new_event = await EventAPI.create(payload);
            if (new_event) {
                this.events![new_event.id] = new_event;
                return new_event;
            }
            throw new Error("Failed to create event");
        } catch (error) {
            throw new Error("Failed to create event: " + error);
        }
    }

    async create_order(payload: OrderPayload): Promise<Order> {
        try {
            const new_order = await OrderAPI.create(payload);
            if (new_order) {
                this.orders![new_order.id] = new_order;
                return new_order;
            }
            throw new Error("Failed to create order");
        } catch (error) {
            throw new Error("Failed to create order: " + error);
        }
    }

    // General Deleters

    async delete_member(member_id: string): Promise<boolean> {
        try {
            const success = await MemberAPI.delete(member_id);
            if (success) {
                delete this.members![member_id];
                return true;
            }
            throw new Error("Failed to delete member");
        } catch (error) {
            throw new Error("Failed to delete member: " + error);
        }
    }

    async delete_storage(storage_id: string): Promise<boolean> {
        try {
            const success = await StorageAPI.delete(storage_id);
            if (success) {
                delete this.storages![storage_id];
                return true;
            }
            throw new Error("Failed to delete storage");
        } catch (error) {
            throw new Error("Failed to delete storage: " + error);
        }
    }

    async delete_label(label_id: string): Promise<boolean> {
        try {
            const success = await LabelAPI.delete(label_id);
            if (success) {
                delete this.labels![label_id];
                return true;
            }
            throw new Error("Failed to delete label");
        } catch (error) {
            throw new Error("Failed to delete label: " + error);
        }
    }

    async delete_item(item_id: string): Promise<boolean> {
        try {
            const success = await ItemAPI.delete(item_id);
            if (success) {
                delete this.items![item_id];
                return true;
            }
            throw new Error("Failed to delete item");
        } catch (error) {
            throw new Error("Failed to delete item: " + error);
        }
    }

    async delete_event(event_id: string): Promise<boolean> {
        try {
            const success = await EventAPI.delete(event_id);
            if (success) {
                delete this.events![event_id];
                return true;
            }
            throw new Error("Failed to delete event");
        } catch (error) {
            throw new Error("Failed to delete event: " + error);
        }
    }

    async delete_order(order_id: string): Promise<boolean> {
        try {
            const success = await OrderAPI.delete(order_id);
            if (success) {
                delete this.orders![order_id];
                return true;
            }
            throw new Error("Failed to delete order");
        } catch (error) {
            throw new Error("Failed to delete order: " + error);
        }
    }

    // Special Methods

    async fetch_items_by_storage(storage_id: string, refresh: boolean=false): Promise<Item[]> {
        try {
            if (!this.items || refresh) {
                await this.load_items();
            }
            return Object.values(this.items!).filter((item: Item) => item.storage_id === storage_id);
        } catch (error) {
            throw new Error("Failed to fetch items by storage: " + error);
        }
    }

    async fetch_items_by_label(label_id: string, refresh: boolean=false): Promise<Item[]> {
        try {
            if (!this.items || refresh) {
                await this.load_items();
            }
            return Object.values(this.items!).filter((item: Item) => item.label_id === label_id);
        } catch (error) {
            throw new Error("Failed to fetch items by label: " + error);
        }
    }

    async fetch_items_by_order(order_id: string, refresh: boolean=false): Promise<Item[]> {
        try {
            if (!this.items || refresh) {
                await this.load_items();
            }

            if (!this.orders || refresh) {
                await this.load_orders();
            }

            const order = this.orders![order_id];
            if (!order) {
                await this.load_orders();
                const order_retry = this.orders![order_id];
                if (!order_retry) throw new Error("Order not found");
                
                return Object.values(this.items!).filter((item: Item) => order_retry.item_ids.includes(item.id));
            }

            return Object.values(this.items!).filter((item: Item) => order.item_ids.includes(item.id));
        } catch (error) {
            throw new Error("Failed to fetch items by order: " + error);
        }
    }

    async fetch_events_by_member(member_id: string, refresh: boolean=false): Promise<Event[]> {
        try {
            if (!this.events || refresh) {
                await this.load_events();
            }
            return Object.values(this.events!).filter((event: Event) => event.member_id === member_id);
        } catch (error) {
            throw new Error("Failed to fetch events by member: " + error);
        }
    }

}
