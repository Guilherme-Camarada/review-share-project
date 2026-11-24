import { apiFetch } from './http';
import type { MediaType } from './mediaApi';
import type { WatchStatus } from './libraryApi';

export interface UserSummary {
    id: string;
    nickname: string;
}

export type Relationship = 'none' | 'friends' | 'requestSent' | 'requestReceived';

export interface UserSearchResult extends UserSummary {
    relationship: Relationship;
    /** Set when there's a pending request between you and this user. */
    requestId: number | null;
}

export interface FriendRequest {
    id: number;
    from: UserSummary;
    createdAt: string;
}

export interface FriendReview {
    user: UserSummary;
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    posterPath: string | null;
    status: WatchStatus | null;
    rating: number | null;
    review: string | null;
    reviewedAt: string;
}

export const fetchFriends = () => apiFetch<UserSummary[]>('/api/friends');

export const removeFriend = (userId: string) =>
    apiFetch<null>(`/api/friends/${encodeURIComponent(userId)}`, { method: 'DELETE' });

export const searchUsers = (query: string) =>
    apiFetch<UserSearchResult[]>(`/api/friends/search?query=${encodeURIComponent(query.trim())}`);

export const fetchFriendRequests = () => apiFetch<FriendRequest[]>('/api/friends/requests');

export const sendFriendRequest = (userId: string) =>
    apiFetch<{ status: 'pending' | 'accepted' }>('/api/friends/requests', { method: 'POST', body: { userId } });

export const acceptFriendRequest = (requestId: number) =>
    apiFetch<null>(`/api/friends/requests/${requestId}/accept`, { method: 'POST' });

/** Declines an incoming request or cancels one you sent. */
export const deleteFriendRequest = (requestId: number) =>
    apiFetch<null>(`/api/friends/requests/${requestId}`, { method: 'DELETE' });

export const fetchFriendActivity = (limit = 10) => apiFetch<FriendReview[]>(`/api/friends/activity?limit=${limit}`);

export const fetchFriendReviews = (mediaType: MediaType, tmdbId: number) =>
    apiFetch<FriendReview[]>(`/api/friends/reviews/${mediaType}/${tmdbId}`);
