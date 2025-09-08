import { POST_ENDPOINT, GET_ENDPOINT } from "./_api_core";

// === === Config === ===
export const EMPTY_STRING = "";
export const UNKNOWN = "Unknown";
export const UNNAMED = "Unnamed";



// === === Enums === ===

// === StorageType ===
export const StorageType = {
    FRIDGE: "Fridge",
    FREEZER: "Freezer",
    PANTRY: "Pantry",
    GARDEN: "Garden",
    OTHER: "Other"
} as const;
export type StorageType = typeof StorageType[keyof typeof StorageType];

// === OrderStatus ===
export const OrderStatus = {
    SKIPPED: "skipped",
    COMPLETED: "completed",
    IN_PROGRESS: "in_progress"
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// === EventType ===
export const EventType = {
    SUCCESS: "success",
    INFO: "info",
    WARNING: "warning",
    DANGER: "danger"
} as const;
export type EventType = typeof EventType[keyof typeof EventType];



// === === Responses === ===

// === Base ===
export interface BaseDocument {
    id: string;
    created_at: string;
    updated_at: string;
}

// === User ===
export interface User extends BaseDocument {
    username: string;
    email: string;
    member_ids: string[];
}


// === Member ===
export interface Member extends BaseDocument {
    owner_user_id?: string;
    stash_id: string;
    nickname: string;
    debts: Record<string, number>;
    is_admin: boolean;
    is_active: boolean;
}

// === Stash ===
export interface Stash extends BaseDocument {
    name: string;
    address?: string;
    member_ids: string[];
    storage_ids: string[];
    label_ids: string[];
    join_code: string;
}

// === Storage ===
export interface Storage extends BaseDocument {
    name: string;
    stash_id: string;
    type: StorageType;
    description?: string;
    item_ids: string[];
}

// === Label ===
export interface Label extends BaseDocument {
    name: string;
    preferred_unit: string;
    stash_id: string;
    default_storage_id: string;
    current_quantity: number;
    item_ids: string[];
    food_group?: string;
}

// === Item ===
export interface Item extends BaseDocument {
    name: string;
    label_id: string;
    storage_id: string;
    buyer_member_id?: string;
    allowed_member_usage: Record<string, number>;
    total_quantity: number;
    current_quantity: number;
    preferred_unit?: string;
    cost?: number;
    expiry_date?: Date;
}

// === Order ===
export interface Order extends BaseDocument {
    stash_id: string;
    buyer_member_id?: string;
    status: Record<string, OrderStatus>;
    item_ids: string[];
}

// === Event ===
export interface Event extends BaseDocument {
    stash_id: string;
    member_id: string;
    type: EventType;
    title: string;
    message?: string;
}



// === Payloads ===

// === Base ===
export interface BasePayload {
    id?: string;
}

// === User ===
export interface UserPayload extends BasePayload {
    email?: string;
    username?: string;
    password_current?: string;
    password_new?: string;
    member_ids?: string[];
}

// === Member ===
export interface MemberPayload extends BasePayload {
    owner_user_id?: string;
    stash_id?: string;
    nickname?: string;
    debts?: Record<string, number>; // {member_id: amount_owed}
    is_admin?: boolean;
    is_active?: boolean;
}

// === Stash ===
export interface StashPayload extends BasePayload {
    name?: string;
    address?: string;
    member_ids?: string[];
    storage_ids?: string[];
    label_ids?: string[];
    join_code?: string;
}

// === Storage ===
export interface StoragePayload extends BasePayload {
    name?: string;
    stash_id?: string;
    type?: StorageType;
    description?: string;
    item_ids?: string[];
}

// === Label ===
export interface LabelPayload extends BasePayload {
    name?: string;
    preferred_unit?: string;
    stash_id?: string;
    default_storage_id?: string;
    current_quantity?: number;
    item_ids?: string[];
    food_group?: string;
}

// === Item ===
export interface ItemPayload extends BasePayload {
    name?: string;
    label_id?: string;
    storage_id?: string;
    buyer_member_id?: string;
    allowed_member_usage?: Record<string, number>;
    total_quantity?: number;
    current_quantity?: number;
    preferred_unit?: string;
    cost?: number;
    expiry_date?: string;
}

// === Order ===
export interface OrderPayload extends BasePayload {
    stash_id?: string;
    buyer_member_id?: string;
    status?: Record<string, OrderStatus>;
    item_ids?: string[];
}

// === Event ===
export interface EventPayload extends BasePayload {
    stash_id?: string;
    member_id?: string;
    type?: EventType;
    title?: string;
    message?: string;
}