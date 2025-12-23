import type { Stash, Storage, Label, Member, Item, Order, Event } from "./schemas";
import { StorageType, EventType } from "./schemas";
import { EMPTY_STRING, UNKNOWN } from "./schemas";

// === Member template ===
export const DEFAULT_MEMBER: Member = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    owner_user_id: undefined,
    stash_id: UNKNOWN,
    nickname: "New Member",
    debts: {},
    is_admin: false,
    is_active: true,
};

// === Stash template ===
export const DEFAULT_STASH: Stash = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    name: "My Storage",
    address: undefined,
    member_ids: [],
    storage_ids: [],
    label_ids: [],
    join_code: UNKNOWN,
};

// === Storage template ===
export const DEFAULT_STORAGE: Storage = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    name: "My Storage",
    stash_id: UNKNOWN,
    type: StorageType.PANTRY,
    description: "A storage for my food.",
    item_ids: [],
    ui_settings: { x: 0, y: 0, w: 1, h: 1, color: undefined },
};

// === Label template ===
export const DEFAULT_LABEL: Label = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    name: "My Label",
    preferred_unit: "g",
    stash_id: UNKNOWN,
    default_storage_id: UNKNOWN,
    current_quantity: 0,
    item_ids: [],
    food_group: undefined,
};

// === Item template ===
export const DEFAULT_ITEM: Item = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    name: "My Item",
    label_id: UNKNOWN,
    storage_id: UNKNOWN,
    buyer_member_id: undefined,
    allowed_member_usage: {},
    total_quantity: 0,
    current_quantity: 0,
    preferred_unit: undefined,
    cost: undefined,
    expiry_date: undefined,
};

// === Order template ===
export const DEFAULT_ORDER: Order = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    stash_id: UNKNOWN,
    buyer_member_id: undefined,
    status: {},
    item_ids: [],
};

// === Event template ===
export const DEFAULT_EVENT: Event = {
    id: EMPTY_STRING,
    created_at: UNKNOWN,
    updated_at: UNKNOWN,

    stash_id: UNKNOWN,
    member_id: UNKNOWN,
    type: EventType.INFO,
    title: "New Event",
    message: undefined,
};
