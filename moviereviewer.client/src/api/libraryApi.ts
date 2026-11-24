import { apiFetch } from './http';
import type { MediaType } from './mediaApi';

export type WatchStatus = 'planToWatch' | 'watching' | 'finished' | 'dropped';

export const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
    { value: 'planToWatch', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'finished', label: 'Finished' },
    { value: 'dropped', label: 'Dropped' },
];

export const statusLabel = (status: WatchStatus | null) =>
    WATCH_STATUSES.find((s) => s.value === status)?.label ?? 'Not in list';

export interface LibraryEntry {
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    posterPath: string | null;
    status: WatchStatus | null;
    /** 0.5–5 stars. */
    rating: number | null;
    review: string | null;
    episodesWatched: number;
    totalEpisodes: number | null;
    /** Furthest episode reached, e.g. { season: 1, episode: 3 }. */
    lastWatched: { season: number; episode: number } | null;
    /** Season number → episodes watched. */
    seasons: Record<number, number>;
    updatedAt: string;
    reviewedAt: string | null;
}

export interface SaveEntryRequest {
    status: WatchStatus | null;
    rating: number | null;
    review: string | null;
}

export interface LibraryFilter {
    mediaType?: MediaType;
    status?: WatchStatus;
    reviewedOnly?: boolean;
}

export function fetchLibrary(filter: LibraryFilter = {}) {
    const params = new URLSearchParams();
    if (filter.mediaType) params.set('mediaType', filter.mediaType);
    if (filter.status) params.set('status', filter.status);
    if (filter.reviewedOnly) params.set('reviewedOnly', 'true');
    return apiFetch<LibraryEntry[]>(`/api/library?${params}`);
}

/** Resolves to null when the title isn't in the user's list. */
export const fetchEntry = (mediaType: MediaType, tmdbId: number) =>
    apiFetch<LibraryEntry | null>(`/api/library/${mediaType}/${tmdbId}`);

/** Resolves to null when the entry was cleared and removed. */
export const saveEntry = (mediaType: MediaType, tmdbId: number, request: SaveEntryRequest) =>
    apiFetch<LibraryEntry | null>(`/api/library/${mediaType}/${tmdbId}`, { method: 'PUT', body: request });

export const setSeasonProgress = (tmdbId: number, seasonNumber: number, episodesWatched: number) =>
    apiFetch<LibraryEntry | null>(`/api/library/tv/${tmdbId}/seasons/${seasonNumber}`, {
        method: 'PUT',
        body: { episodesWatched },
    });

export const watchNextEpisode = (tmdbId: number) =>
    apiFetch<LibraryEntry>(`/api/library/tv/${tmdbId}/next-episode`, { method: 'POST' });

export const formatEpisode = (season: number, episode: number) =>
    `S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;
