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

export function fuzzyScore(label: string, term: string) {
    let score = 0;
    let ti = 0;
    for (let li = 0; li < label.length && ti < term.length; li++) {
        if (label[li] === term[ti]) {
            score += 5;
            if (li > 0 && label[li - 1] === term[ti - 1]) score += 3;
            ti++;
        }
    }
    return score;
}