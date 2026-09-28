import type { SearchResultItem } from '../types/landing';

export async function searchMediaLive(query: string): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    const response = await fetch(`/api/Movie/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to query media database');
    }

    const data = await response.json();
    return data.results || [];
}