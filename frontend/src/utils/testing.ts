
export function getError(error: unknown): string {
    let errorMessage = "An unknown error occurred";

    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === "string") {
        errorMessage = error;
    }
    
    return errorMessage;
}