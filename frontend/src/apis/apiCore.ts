import type { BaseDocument, BasePayload } from "../apis/schemas";


const BASE = "http://localhost:8000";

/**
 * Makes a GET request to the specified endpoint. Used to fetch resources.
 * @param endpoint The API endpoint to send the GET request to.
 * @param error Optional custom error message if the request fails.
 * @return A promise that resolves to the fetched resource.
 * @throws An error if the request fails.
 * @template BodyType The expected return type of the fetched resource.
 * @example
 */
export async function GET_ENDPOINT<BodyType>(endpoint: string, error?: string): Promise<BodyType> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) {
        // Try to extract error message from response
        let detail = error ? error : `GET Request to '${endpoint}' Failed`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}

/**
 * Makes a POST request to the specified endpoint with the provided body. Used to create resources.
 */
export async function POST_ENDPOINT<BodyType, ReturnType>(endpoint: string, body: BodyType, error?: string): Promise<ReturnType> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        let detail = error ? error : `POST Request to '${endpoint}' Failed`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}

/**
 * Makes a PATCH request to the specified endpoint with the provided body. Used for partial updates.
 */
export async function PATCH_ENDPOINT<BodyType, ReturnType>(endpoint: string, body: BodyType, error?: string): Promise<ReturnType> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        let detail = error ? error : `PATCH Request to '${endpoint}' Failed`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}

/**
 * Makes a DELETE request to the specified endpoint. Used to delete resources.
 */
export async function DELETE_ENDPOINT(endpoint: string, error?: string): Promise<boolean> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) {
        let detail = error ? error : `DELETE Request to '${endpoint}' Failed`;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}

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