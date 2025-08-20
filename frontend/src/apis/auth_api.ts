import { POST_ENDPOINT } from "./_api_core";
import type { UserPayload, UserProtected } from "./_schemas";


// === Endpoints ===
export async function login(email: string, password_current: string) {
    const payload: UserPayload = { 
        email: email, 
        password_current: password_current
    };
    return POST_ENDPOINT<UserPayload, null>('/login', payload);
}

export async function register(username: string, email: string, password_current: string) {
    const payload: UserPayload = {
        username: username,
        email: email,
        password_current: password_current,
    };
    return POST_ENDPOINT<UserPayload, null>('/register', payload);
}

export async function authenticate(): Promise<UserProtected> {
    return POST_ENDPOINT<null, UserProtected>('/authenticate', null);
}

export async function refresh() {
    return POST_ENDPOINT('/refresh', {});
}

export async function logout() {
    return POST_ENDPOINT('/logout', {});
}