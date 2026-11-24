import { useRef, useState } from 'react';
import styles from './Navbar.module.css';
import { acceptFriendRequest, deleteFriendRequest, fetchFriendRequests } from '../../api/friendsApi';
import { useLoad } from '../../utils/useLoad';
import { timeAgo } from '../../utils/time';
import { Avatar } from '../common/Avatar';
import { useClickOutside } from '../../utils/useClickOutside';

/** Bell button listing incoming friend requests. */
export function FriendRequestsMenu() {
    const requests = useLoad(fetchFriendRequests, []);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    const pending = requests.data ?? [];

    const respond = async (id: number, accept: boolean) => {
        try {
            await (accept ? acceptFriendRequest(id) : deleteFriendRequest(id));
            requests.setData(pending.filter((r) => r.id !== id));
        } catch {
            requests.reload();
        }
    };

    return (
        <div className={styles.userMenuWrapper} ref={ref}>
            <button
                type="button"
                className={styles.notificationButton}
                onClick={() => {
                    if (!open) requests.reload();
                    setOpen(!open);
                }}
                aria-label={`Friend requests (${pending.length})`}
                aria-expanded={open}
            >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {pending.length > 0 && <span className={styles.notificationBadge}>{pending.length}</span>}
            </button>

            {open && (
                <div className={`${styles.dropdownMenu} ${styles.requestsMenu}`}>
                    <p className={styles.requestsTitle}>Friend requests</p>
                    {pending.length === 0 ? (
                        <p className={styles.requestsEmpty}>No pending requests.</p>
                    ) : (
                        pending.map((request) => (
                            <div key={request.id} className={styles.requestRow}>
                                <Avatar name={request.from.nickname} size={30} />
                                <div className={styles.requestInfo}>
                                    <span className={styles.requestName}>{request.from.nickname}</span>
                                    <span className={styles.requestTime}>{timeAgo(request.createdAt)}</span>
                                </div>
                                <button type="button" className={styles.acceptBtn} onClick={() => respond(request.id, true)}>
                                    Accept
                                </button>
                                <button type="button" className={styles.declineBtn} onClick={() => respond(request.id, false)}>
                                    Decline
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
