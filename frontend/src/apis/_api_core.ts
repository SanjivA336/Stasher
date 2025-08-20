const BASE = "http://localhost:8000";

/**
 * Makes a GET request to the specified endpoint.
 * @param endpoint The endpoint to fetch data from, relative to the base URL.
 * @param error The error message to throw if the request fails. Defaults to "Request Failed".
 * @template T The type of the expected response.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws An error if the request fails or the response is not ok.
 */
export async function GET_ENDPOINT<T>(endpoint: string, error: string = "GET Request Failed"): Promise<T> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) {
        // Try to extract error message from response
        let detail = error;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}

/**
 * Makes a POST request to the specified endpoint with the provided body.
 * @param endpoint The endpoint to post data to, relative to the base URL.
 * @param body The body of the POST request, which will be stringified to JSON.
 * @param error The error message to throw if the request fails. Defaults to "Request Failed".
 * @template T The type of the expected response.
 * @returns A promise that resolves to the JSON response from the server.
 * @throws An error if the request fails or the response is not ok.
 */
export async function POST_ENDPOINT<T, R>(endpoint: string, body: T, error: string = "POST Request Failed") : Promise<R> {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        let detail = error;
        try {
            const data = await res.json();
            detail = data.detail || detail;
        } catch {}
        throw new Error(detail);
    }
    return res.json();
}