import { useEffect, useState } from 'react';
import styles from './AddFriendsModal.module.css';
import {
    acceptFriendRequest,
    deleteFriendRequest,
    fetchFriends,
    removeFriend,
    searchUsers,
    sendFriendRequest,
    type UserSearchResult,
} from '../../api/friendsApi';
import { useLoad } from '../../utils/useLoad';
import { Avatar } from '../common/Avatar';

export function AddFriendsModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const friends = useLoad(fetchFriends, []);

    useEffect(() => {
        const term = query.trim();
        if (term.length < 2) return;

        let active = true;
        const timer = setTimeout(() => {
            searchUsers(term)
                .then((found) => active && setResults(found))
                .catch((err: Error) => active && setError(err.message))
                .finally(() => active && setSearching(false));
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const update = (id: string, change: Partial<UserSearchResult>) =>
        setResults((prev) => prev.map((u) => (u.id === id ? { ...u, ...change } : u)));

    const act = async (action: () => Promise<void>) => {
        setError(null);
        try {
            await action();
            friends.reload();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleAdd = (user: UserSearchResult) => act(async () => {
        const { status } = await sendFriendRequest(user.id);
        update(user.id, { relationship: status === 'accepted' ? 'friends' : 'requestSent' });
    });

    const handleAccept = (user: UserSearchResult) => act(async () => {
        await acceptFriendRequest(user.requestId!);
        update(user.id, { relationship: 'friends', requestId: null });
    });

    const handleCancel = (user: UserSearchResult) => act(async () => {
        await deleteFriendRequest(user.requestId!);
        update(user.id, { relationship: 'none', requestId: null });
    });

    const handleRemove = (userId: string) => act(async () => {
        await removeFriend(userId);
        update(userId, { relationship: 'none' });
    });

    return (
        <div className={styles.backdrop} onMouseDown={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-friends-title"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 id="add-friends-title" className={styles.title}>Add Friends</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
                </div>

                <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search by nickname…"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setResults([]);
                        setSearching(e.target.value.trim().length >= 2);
                    }}
                    autoFocus
                />

                {error && <p className={styles.error}>{error}</p>}

                {query.trim().length >= 2 && (
                    <ul className={styles.list}>
                        {searching && results.length === 0 && <li className={styles.muted}>Searching…</li>}
                        {!searching && results.length === 0 && <li className={styles.muted}>No users found.</li>}
                        {results.map((user) => (
                            <li key={user.id} className={styles.row}>
                                <Avatar name={user.nickname} size={32} />
                                <span className={styles.name}>{user.nickname}</span>
                                {user.relationship === 'none' && (
                                    <button type="button" className={styles.primaryBtn} onClick={() => handleAdd(user)}>Add friend</button>
                                )}
                                {user.relationship === 'requestSent' && (
                                    <button type="button" className={styles.secondaryBtn} onClick={() => handleCancel(user)}>Cancel request</button>
                                )}
                                {user.relationship === 'requestReceived' && (
                                    <button type="button" className={styles.primaryBtn} onClick={() => handleAccept(user)}>Accept</button>
                                )}
                                {user.relationship === 'friends' && <span className={styles.muted}>Friends</span>}
                            </li>
                        ))}
                    </ul>
                )}

                <h3 className={styles.subTitle}>Your friends</h3>
                <ul className={styles.list}>
                    {friends.loading && <li className={styles.muted}>Loading…</li>}
                    {!friends.loading && friends.data?.length === 0 && <li className={styles.muted}>No friends yet.</li>}
                    {friends.data?.map((friend) => (
                        <li key={friend.id} className={styles.row}>
                            <Avatar name={friend.nickname} size={32} />
                            <span className={styles.name}>{friend.nickname}</span>
                            <button type="button" className={styles.secondaryBtn} onClick={() => handleRemove(friend.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
