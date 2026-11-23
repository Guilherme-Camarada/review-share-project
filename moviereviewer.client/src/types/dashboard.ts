export type WatchlistStatus = 'Watching' | 'Plan to Watch' | 'Finished' | 'Dropped';
export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
    id: string;
    mediaId: number;
    title: string;
    posterPath: string;
    mediaType: MediaType;
    status: WatchlistStatus;
    season?: number;
    episode?: number;
}

export interface RecentLogItem {
    id: string;
    mediaId: number;
    title: string;
    posterPath: string;
    rating: number;
    reviewSnippet: string;
}

export interface FriendActivityItem {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    rating: number;
    mediaTitle: string;
    reviewSnippet: string;
    timestamp: string;
}

export interface TrendingSuggestion {
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    mediaType: MediaType;
    overview: string;
}