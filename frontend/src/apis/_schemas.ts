// === Config ===
export const EMPTY_STRING = "";
export const UNKNOWN = "Unknown";
export const UNNAMED = "Unnamed";

// === === Payloads === ===

// === User ===
export interface UserPayload {
    id?: string;
    username?: string;
    email?: string;
    password_current?: string;
    password_new?: string;
}

// === Member ===
export interface MemberPayload {
    id?: string;
    owner_user_id?: string;
    kitchen_id?: string;
    nickname?: string;
    is_admin?: boolean;
}

// === Kitchen ===
export interface KitchenPayload {
    id?: string;
    name?: string;
    address?: string;
    member_ids?: string[];
    storage_ids?: string[];
    registry_entry_ids?: string[];
    settings?: KitchenSettings;
}

// === Storage Settings ===
export interface StoragePayload {
    id?: string;
    name?: string;
    kitchen_id?: string;
    type?: StorageType;
    description?: string;
    item_ids?: string[];
    ui_settings?: StorageUISettings;
}

// === Registry Entry ===
export interface RegistryEntryPayload {
    id?: string;
    name?: string;
    preferred_unit?: string;
    kitchen_id?: string;
    default_storage_id?: string;
    current_quantity?: number;
    item_ids?: string[];
    food_group?: string;
}

// === Item ===
export interface ItemPayload {
    id?: string;
    name?: string;
    registry_entry_id?: string;
    storage_id?: string;
    buyer_member_id?: string;
    allowed_member_usage?: Record<string, number>;
    total_quantity?: number;
    current_quantity?: number;
    preferred_unit?: string;
    cost?: number;
    expiry_date?: string; // ISO string, replace datetime
}

// === Order ===
export interface OrderPayload {
    id?: string;
    kitchen_id?: string;
    buyer_member_id?: string;
    status?: Record<string, OrderStatus>;
    item_ids?: string[];
}

// === Log ===
export interface LogEntryPayload {
    id?: string;
    kitchen_id?: string;
    member_id?: string;
    action?: string;
    details?: string;
}

// === === Responses === ===
export interface BaseDocument {
    id: string;
    created_at: string; // ISO string
    updated_at: string; // ISO string
}

export interface UserProtected extends BaseDocument {
    id: string;
    created_at: string; // ISO string instead of datetime
    updated_at: string; // ISO string instead of datetime
    username: string;
    email: string;
    member_ids: string[];
}

// === Member ===
export interface Member extends BaseDocument {
    owner_user_id?: string;
    kitchen_id: string;
    nickname: string;
    debts: Record<string, number>;
    is_admin: boolean;
}

// === Kitchen ===
export interface KitchenSettings {
    expiry_warning: number;
}

export interface Kitchen extends BaseDocument {
    name: string;
    address?: string;
    member_ids: string[];
    storage_ids: string[];
    registry_entry_ids: string[];
    join_code: string;
    settings: KitchenSettings;
}

// === Storage ===
export interface StorageUISettings {
    custom_color?: string;
    size: { width: number; height: number };
    position: { x: number; y: number };
}

export interface Storage extends BaseDocument {
    name: string;
    kitchen_id: string;
    type: StorageType;
    description?: string;
    item_ids: string[];
    ui_settings: StorageUISettings;
}

// === Registry Entry ===
export interface RegistryEntry extends BaseDocument {
    name: string;
    preferred_unit: string;
    kitchen_id: string;
    default_storage_id: string;
    current_quantity: number;
    item_ids: string[];
    food_group?: string;
}

// === Item ===
export interface Item extends BaseDocument {
    name: string;
    registry_entry_id: string;
    storage_id: string;
    buyer_member_id?: string;
    allowed_member_usage: Record<string, number>;
    total_quantity: number;
    current_quantity: number;
    preferred_unit?: string;
    cost?: number;
    expiry_date?: string; // ISO string
}

// === Order ===
export interface Order extends BaseDocument {
    kitchen_id: string;
    buyer_member_id?: string;
    status: Record<string, OrderStatus>;
    item_ids: string[];
}

// === Log ===
export interface LogEntry extends BaseDocument {
    kitchen_id: string;
    member_id: string;
    type: LogType;
    title: string;
    message?: string;
}

// === Enums (placeholders, adjust to match your backend) ===
export type StorageType = "fridge" | "freezer" | "pantry" | "garden" | "other";

export type OrderStatus = "skipped" | "completed" | "cancelled";

export type LogType = "success" | "info" | "warning" | "danger";

// === Placeholder interfaces for nested settings ===
export interface KitchenSettings {
    // add fields from backend KitchenSettings
}

export interface StorageUISettings {
    // add fields from backend StorageUISettings
}
