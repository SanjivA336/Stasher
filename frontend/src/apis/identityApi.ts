import { GET_ENDPOINT, BaseAPI } from "@apis/apiCore";
import type { User, Member, Stash, Item, Event, Order, UserPayload, MemberPayload } from "@apis/schemas";

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

    static async create(payload: UserPayload): Promise<User> {
        return await super._create<UserPayload, User>(payload);
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
