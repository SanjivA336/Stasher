import { GET_ENDPOINT, BaseAPI } from "@apis/apiCore";
import type { Member, Stash, Label, Storage, Item, Event, Order, StashPayload, LabelPayload, StoragePayload } from "@apis/schemas";

// === Stash ===
export class StashAPI extends BaseAPI {
    static override endpoint = "stash";

    static async get_template(): Promise<Stash> {
        return await this._get_template<Stash>();
    }

    // === Single CRU Operations ===

    static async create(payload: StashPayload): Promise<Stash> {
        return await this._create<StashPayload, Stash>(payload);
    }

    static async get(id: string): Promise<Stash> {
        return await this._get<Stash>(id);
    }

    static async update(payload: StashPayload): Promise<Stash> {
        return await this._update<StashPayload, Stash>(payload);
    }

    // === Additional Stash-Specific Methods ===

    /**
     * Get all labels in a stash.
     * @param id The stash ID to get labels for.
     * @returns A promise that resolves to an array of labels.
     */
    static async get_labels(id: string): Promise<Label[]> {
        return await GET_ENDPOINT<Label[]>(`/${this.endpoint}/${id}/labels`);
    }

    /**
     * Get all storages in a stash.
     * @param id The stash ID to get storages for.
     * @returns A promise that resolves to an array of storages.
     */
    static async get_storages(id: string): Promise<Storage[]> {
        return await GET_ENDPOINT<Storage[]>(`/${this.endpoint}/${id}/storages`);
    }

    /**
     * Get all members of a stash.
     * @param id The stash ID to get members for.
     * @returns A promise that resolves to an array of members.
     */
    static async get_all_members(id: string): Promise<Member[]> {
        return await GET_ENDPOINT<Member[]>(`/${this.endpoint}/${id}/members/all`);
    }

    /**
     * Get all active members of a stash.
     * @param id The stash ID to get active members for.
     * @returns A promise that resolves to an array of active members.
     */
    static async get_active_members(id: string): Promise<Member[]> {
        return await GET_ENDPOINT<Member[]>(`/${this.endpoint}/${id}/members/active`);
    }

    /**
     * Get all orders in a stash.
     * @param id The stash ID to get orders for.
     * @returns A promise that resolves to an array of orders.
     */
    static async get_orders(id: string): Promise<Order[]> {
        return await GET_ENDPOINT<Order[]>(`/${this.endpoint}/${id}/orders`);
    }

    /**
     * Get all events in a stash.
     * @param id The stash ID to get events for.
     * @returns A promise that resolves to an array of events.
     */
    static async get_events(id: string): Promise<Event[]> {
        return await GET_ENDPOINT<Event[]>(`/${this.endpoint}/${id}/events`);
    }

    /**
     * Get all items in a stash.
     * @param id The stash ID to get items for.
     * @returns A promise that resolves to an array of items.
     */
    static async get_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items`);
    }
}

// === Storage ===
export class StorageAPI extends BaseAPI {
    static override endpoint = "storage";

    static async get_template(): Promise<Storage> {
        return await this._get_template<Storage>();
    }

    // === Single CRU Operations ===

    static async create(payload: StoragePayload): Promise<Storage> {
        return await this._create<StoragePayload, Storage>(payload);
    }

    static async get(id: string): Promise<Storage> {
        return await this._get<Storage>(id);
    }

    static async update(payload: StoragePayload): Promise<Storage> {
        return await this._update<StoragePayload, Storage>(payload);
    }

    // === Additional Storage-Specific Methods ===

    /**
     * Get the stash associated with a storage.
     * @param id The storage ID to get the associated stash for.
     * @returns A promise that resolves to the associated stash.
     */
    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get all items in a storage.
     * @param id The storage ID to get items for.
     * @returns A promise that resolves to an array of items.
     */
    static async get_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items`);
    }

    /**
     * Get all labels that default to a storage.
     * @param id The storage ID to get default labels for.
     * @return A promise that resolves to an array of labels.
     */
    static async get_default_labels(id: string): Promise<Label[]> {
        return await GET_ENDPOINT<Label[]>(`/${this.endpoint}/${id}/labels`);
    }
}

// === Label ===
export class LabelAPI extends BaseAPI {
    static override endpoint = "label";

    static async get_template(): Promise<Label> {
        return await this._get_template<Label>();
    }

    // === Single CRU Operations ===

    static async create(payload: LabelPayload): Promise<Label> {
        return await this._create<LabelPayload, Label>(payload);
    }

    static async get(id: string): Promise<Label> {
        return await this._get<Label>(id);
    }

    static async update(payload: LabelPayload): Promise<Label> {
        return await this._update<LabelPayload, Label>(payload);
    }

    // === Additional Label-Specific Methods ===

    /**
     * Get the stash associated with a label.
     * @param id The label ID to get the associated stash for.
     * @returns A promise that resolves to the associated stash.
     */
    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get the default storage for a label.
     * @param id The label ID to get the default storage for.
     * @returns A promise that resolves to the default storage.
     */
    static async get_default_storage(id: string): Promise<Storage> {
        return await GET_ENDPOINT<Storage>(`/${this.endpoint}/${id}/storage`);
    }

    /**
     * Get all items under this label.
     * @param id The label ID to get items for.
     * @returns A promise that resolves to an array of items.
     */
    static async get_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items`);
    }
}
