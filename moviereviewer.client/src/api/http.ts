/**
 * Calls the PostCredits API with the session cookie and returns the parsed JSON.
 * Throws an Error with the server's message when the response isn't OK.
 * Returns null for 204 No Content.
 */
export async function apiFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetch(path, {
        method: options.method ?? 'GET',
        headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(errorMessage(data) ?? `Request failed (${response.status} ${response.statusText})`);
    }

    if (response.status === 204) return null as T;
    return response.json();
}

// The server answers errors as { message }, { errors: string[] } (Identity) or ProblemDetails.
function errorMessage(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null;
    const body = data as { message?: string; title?: string; detail?: string; errors?: unknown };

    if (body.message) return body.message;
    if (Array.isArray(body.errors)) return body.errors.join(' ');
    if (body.errors && typeof body.errors === 'object') {
        const messages = Object.values(body.errors).flat().filter((m) => typeof m === 'string');
        if (messages.length > 0) return messages.join(' ');
    }
    return body.detail ?? body.title ?? null;
}
