import { GET_ENDPOINT, POST_ENDPOINT, PATCH_ENDPOINT, DELETE_ENDPOINT } from "./_api_core";
import type { BaseDocument, User, Member, Stash, Label, Storage, Item, Event, Order } from "./_schemas";
import type { BasePayload, UserPayload, MemberPayload, StashPayload, LabelPayload, StoragePayload, ItemPayload, EventPayload, OrderPayload } from "./_schemas";

// === === API Methods === ===

// === Current ===
export class CurrentAPI {
    static async get_user() {
        return await GET_ENDPOINT<User>("/current/user");
    }

    static async get_active_members() {
        return await GET_ENDPOINT<Member[]>("/current/members/active");
    }

    static async get_active_stashes() {
        return await GET_ENDPOINT<Stash[]>("/current/stashes/active");
    }

    static async get_current_member(stash_id: string): Promise<Member | null> {
        const members = await this.get_active_members();
        return members.find(member => member.stash_id === stash_id) || null;
    }

    static async check_access(stash_id: string): Promise<boolean> {
        return await GET_ENDPOINT<boolean>(`/current/can_access/${stash_id}`);
    }
};

// === Generic Schema API Interface Type ===
export abstract class BaseAPI {
    static endpoint: string;

    /**
     * Get a template for creating a new document.
     * @return A promise that resolves to the template document.
     * @throws Error if the endpoint is not defined.
     */
    protected static async _get_template<DocumentType extends BaseDocument>(): Promise<DocumentType> {
        return await GET_ENDPOINT<DocumentType>(`/${this.endpoint}-template`);
    }

    // === Single CRUD Operations ===

    /**
     * Create a new document.
     * @param payload The payload to create the document with.
     * @return A promise that resolves to the created document.
     */
    protected static async _create<PayloadType extends BasePayload, DocumentType extends BaseDocument>(payload: PayloadType): Promise<DocumentType> {
        return await POST_ENDPOINT<PayloadType, DocumentType>(`/${this.endpoint}`, payload);
    }

    /**
     * Get a document by its ID.
     * @param id The ID of the document to retrieve.
     * @return A promise that resolves to the document.
     */
    protected static async _get<DocumentType extends BaseDocument>(id: string): Promise<DocumentType> {
        return await GET_ENDPOINT<DocumentType>(`/${this.endpoint}/${id}`);
    }

    /**
     * Update an existing document.
     * @param payload The payload to update the document with. Must include the document ID.
     * @return A promise that resolves to the updated document.
     */
    protected static async _update<PayloadType extends BasePayload, DocumentType extends BaseDocument>(payload: PayloadType): Promise<DocumentType> {
        if (!payload.id) throw new Error("Payload must include an id");
        return await PATCH_ENDPOINT<PayloadType, DocumentType>(`/${this.endpoint}`, payload);
    }

    /**
     * Delete a document by its ID.
     * @param id The ID of the document to delete.
     * @return A promise that resolves to true if the document was deleted, false otherwise.
     */
    static async delete(id: string): Promise<boolean> {
        return await DELETE_ENDPOINT(`/${this.endpoint}/${id}`);
    }
}

// === User ===
export class UserAPI extends BaseAPI {
    static override endpoint = "user";

    // === Single CRU Operations ===

    static async get(id: string): Promise<User> {
        return await this._get<User>(id);
    }

    static async update(payload: UserPayload): Promise<User> {
        return await this._update<UserPayload, User>(payload);
    }

    // === Additional User-Specific Methods ===

    /**
     * Get all members of a stash.
     * @param id The stash ID to get members for.
     * @returns A promise that resolves to an array of members.
     */
    static async get_all_members(id: string): Promise<Member[]> {
        return await GET_ENDPOINT<Member[]>(`/${this.endpoint}/${id}/members/all`);
    }

    /**
     * Get active members of a stash.
     * @param id The stash ID to get active members for.
     * @returns A promise that resolves to an array of active members.
     */
    static async get_active_members(id: string): Promise<Member[]> {
        return await GET_ENDPOINT<Member[]>(`/${this.endpoint}/${id}/members/active`);
    }

    /**
     * Get all stashes for a user.
     * @param id The user ID to get stashes for.
     * @returns A promise that resolves to an array of stashes.
     */
    static async get_all_stashes(id: string): Promise<Stash[]> {
        return await GET_ENDPOINT<Stash[]>(`/${this.endpoint}/${id}/stashes/all`);
    }

    /**
     * Get active stashes for a user.
     * @param id The user ID to get active stashes for.
     * @returns A promise that resolves to an array of active stashes.
     */
    static async get_active_stashes(id: string): Promise<Stash[]> {
        return await GET_ENDPOINT<Stash[]>(`/${this.endpoint}/${id}/stashes/active`);
    }
}

// === Member ===
export class MemberAPI extends BaseAPI {
    static override endpoint = "member";

    static async get_template(): Promise<Member> {
        return await this._get_template<Member>();
    }

    // === Single CRU Operations ===

    static async get(id: string): Promise<Member> {
        return await this._get<Member>(id);
    }

    static async update(payload: MemberPayload): Promise<Member> {
        return await this._update<MemberPayload, Member>(payload);
    }

    // === Additional Member-Specific Methods ===

    /**
     * Get the user associated with a member.
     * @param id The member ID to get the associated user for.
     * @returns A promise that resolves to the associated user.
     */
    static async get_user(id: string): Promise<User> {
        return await GET_ENDPOINT<User>(`/${this.endpoint}/${id}/user`);
    }

    /**
     * Get the stash associated with a member.
     * @param id The member ID to get the associated stash for.
     * @returns A promise that resolves to the associated stash.
     */
    static async get_stash(id: string): Promise<Stash> {
        return await GET_ENDPOINT<Stash>(`/${this.endpoint}/${id}/stash`);
    }

    /**
     * Get the items that a member has bought.
     * @param id The member ID to get bought items for.
     * @returns A promise that resolves to an array of bought items.
     */
    static async get_bought_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items/bought`);
    }

    /**
     * Get the items that a member has used.
     * @param id The member ID to get used items for.
     * @returns A promise that resolves to an array of used items.
     */
    static async get_used_items(id: string): Promise<Item[]> {
        return await GET_ENDPOINT<Item[]>(`/${this.endpoint}/${id}/items/used`);
    }

    /**
     * Get all orders for a member.
     * @param id The member ID to get orders for.
     * @returns A promise that resolves to an array of orders.
     */
    static async get_orders(id: string): Promise<Order[]> {
        return await GET_ENDPOINT<Order[]>(`/${this.endpoint}/${id}/orders`);
    }

    /**
     * Get all events for a member.
     * @param id The member ID to get events for.
     * @returns A promise that resolves to an array of events.
     */
    static async get_events(id: string): Promise<Event[]> {
        return await GET_ENDPOINT<Event[]>(`/${this.endpoint}/${id}/events`);
    }
}

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