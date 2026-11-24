import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { fetchFriendActivity } from '../../api/friendsApi';
import { mediaPath, tmdbImage } from '../../api/mediaApi';
import { useLoad } from '../../utils/useLoad';
import { timeAgo } from '../../utils/time';
import { Avatar } from '../common/Avatar';
import { AddFriendsModal } from '../friends/AddFriendsModal';

export function FriendsFeedSection() {
    const activity = useLoad(() => fetchFriendActivity(8), []);
    const [addOpen, setAddOpen] = useState(false);

    return (
        <section className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
                <h2 className={styles.sectionTitle}>Friends Activity Feed</h2>
                <button type="button" className={styles.outlineButton} onClick={() => setAddOpen(true)}>
                    Add Friends
                </button>
            </div>

            {activity.loading ? (
                <p className={styles.emptyText}>Loading…</p>
            ) : activity.error ? (
                <p className={styles.errorText}>{activity.error}</p>
            ) : activity.data!.length === 0 ? (
                <p className={styles.emptyText}>When your friends rate or review something, it shows up here.</p>
            ) : (
                <div className={styles.friendsFeedList}>
                    {activity.data!.map((item) => {
                        const poster = tmdbImage(item.posterPath, 'w92');
                        return (
                            <div key={`${item.user.id}-${item.mediaType}-${item.tmdbId}`} className={styles.friendActivityRow}>
                                <Avatar name={item.user.nickname} />
                                <div className={styles.activityBody}>
                                    <div className={styles.activityUserHeader}>
                                        <div className={styles.activityUserHeaderLeft}>
                                            <span>{item.user.nickname}</span>
                                            {item.rating !== null && <span className={styles.activityRating}>★ {item.rating}/5</span>}
                                        </div>
                                        <span className={styles.timeAgo}>{timeAgo(item.reviewedAt)}</span>
                                    </div>
                                    <Link to={mediaPath(item.mediaType, item.tmdbId)} className={styles.activityMediaTitle}>
                                        {poster && <img src={poster} alt="" className={styles.activityPoster} />}
                                        {item.title}
                                    </Link>
                                    {item.review && <p className={styles.activityComment}>{item.review}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {addOpen && <AddFriendsModal onClose={() => { setAddOpen(false); activity.reload(); }} />}
        </section>
    );
}
