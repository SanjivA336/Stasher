import { GET_ENDPOINT, BaseAPI } from "@apis/apiCore";
import type { Member, Stash, Label, Storage, Item, Event, Order, ItemPayload, EventPayload, OrderPayload } from "@apis/schemas";

// === Item ===
export class ItemAPI extends BaseAPI {
    static override endpoint = "item";

    static async get_template(): Promise<Item> {
        return await this._get_template<Item>();
    }

    // === Single CRU Operations ===

    static async create(payload: ItemPayload): Promise<Item> {
        return await this._create<ItemPayload, Item>(payload);
    }

    static async get(id: string): Promise<Item> {
        return await this._get<Item>(id);
    }

    static async update(payload: ItemPayload): Promise<Item> {
        return await this._update<ItemPayload, Item>(payload);
    }

    // === Additional Item-Specific Methods ===

    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get the label associated with an item.
     * @param id The item ID to get the associated label for.
     * @returns A promise that resolves to the associated label.
     */
    static async get_label(id: string): Promise<Label> {
        return await GET_ENDPOINT<Label>(`/${this.endpoint}/${id}/label`);
    }

    /**
     * Get the storage associated with an item.
     * @param id The item ID to get the associated storage for.
     * @returns A promise that resolves to the associated storage.
     */
    static async get_storage(id: string): Promise<Storage> {
        return await GET_ENDPOINT<Storage>(`/${this.endpoint}/${id}/storage`);
    }

    /**
     * Get the member who bought an item.
     * @param id The item ID to get the buyer member for.
     * @returns A promise that resolves to the buyer member.
     */
    static async get_buyer(id: string): Promise<Member | null> {
        return await GET_ENDPOINT<Member | null>(`/${this.endpoint}/${id}/buyer`);
    }

    /**
     * Get all events associated with an item.
     * @param id The item ID to get events for.
     * @returns A promise that resolves to an array of events.
     */
    static async get_allowed_members(id: string): Promise<Member[]> {
        return await GET_ENDPOINT<Member[]>(`/${this.endpoint}/${id}/members/allowed`);
    }

    /**
     * Get the order associated with an item.
     * @param id The item ID to get the order for.
     * @returns A promise that resolves to the associated order.
     */
    static async get_order(id: string): Promise<Order | null> {
        return await GET_ENDPOINT<Order | null>(`/${this.endpoint}/${id}/order`);
    }
}

// === Order ===
export class OrderAPI extends BaseAPI {
    static override endpoint = "order";

    static async get_template(): Promise<Order> {
        return await this._get_template<Order>();
    }

    // === Single CRU Operations ===

    static async create(payload: OrderPayload): Promise<Order> {
        return await this._create<OrderPayload, Order>(payload);
    }

    static async get(id: string): Promise<Order> {
        return await this._get<Order>(id);
    }

    static async update(payload: OrderPayload): Promise<Order> {
        return await this._update<OrderPayload, Order>(payload);
    }

    // === Additional Order-Specific Methods ===

    /**
     * Get the stash associated with an order.
     * @param id The order ID to get the associated stash for.
     * @returns A promise that resolves to the associated stash.
     */
    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get the member who placed an order.
     * @param id The order ID to get the member for.
     * @returns A promise that resolves to the member who placed the order.
     */
    static async get_buyer(id: string): Promise<Member | null> {
        return await GET_ENDPOINT<Member | null>(`/${this.endpoint}/${id}/buyer`);
    }

    /**
     * Get all items in an order.
     * @param id The order ID to get items for.
     * @returns A promise that resolves to an array of items in the order.
     */
    static async get_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items`);
    }
}

// === Event ===
export class EventAPI extends BaseAPI {
    static override endpoint = "event";

    static async get_template(): Promise<Event> {
        return await this._get_template<Event>();
    }

    // === Single CRU Operations ===

    static async create(payload: EventPayload): Promise<Event> {
        return await this._create<EventPayload, Event>(payload);
    }

    static async get(id: string): Promise<Event> {
        return await this._get<Event>(id);
    }

    static async update(payload: EventPayload): Promise<Event> {
        return await this._update<EventPayload, Event>(payload);
    }

    // === Additional Event-Specific Methods ===

    /**
     * Get the stash associated with an event.
     * @param id The event ID to get the associated stash for.
     * @returns A promise that resolves to the associated stash.
     */
    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get the member who created an event.
     * @param id The event ID to get the member for.
     * @returns A promise that resolves to the member who created the event.
     */
    static async get_member(id: string): Promise<Member | null> {
        return await GET_ENDPOINT<Member | null>(`/${this.endpoint}/${id}/member`);
    }
}