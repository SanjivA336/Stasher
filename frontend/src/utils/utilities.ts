export function getError(error: unknown): string {
    let errorMessage = "An unknown error occurred";

    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === "string") {
        errorMessage = error;
    }
    
    return errorMessage;
}

export function copyToClipboard(text: string): boolean {
    navigator.clipboard.writeText(text).catch((err) => {
        console.error("Could not copy text: ", err);
        return false;
    });
    return true;
}