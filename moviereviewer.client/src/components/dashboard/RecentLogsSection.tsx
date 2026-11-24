import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import type { LibraryEntry } from '../../api/libraryApi';
import { mediaPath, tmdbImage } from '../../api/mediaApi';
import { StarRating } from '../common/StarRating';
import { timeAgo } from '../../utils/time';

export function RecentLogsSection({ entries, loading }: { entries: LibraryEntry[]; loading: boolean }) {
    const logs = entries
        .filter((e) => e.reviewedAt)
        .sort((a, b) => b.reviewedAt!.localeCompare(a.reviewedAt!))
        .slice(0, 5);

    return (
        <section className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
                <h2 className={styles.sectionTitle}>Recent Logs & Ratings</h2>
                <Link to="/list" className={styles.textLink}>See all</Link>
            </div>

            {loading ? (
                <p className={styles.emptyText}>Loading…</p>
            ) : logs.length === 0 ? (
                <p className={styles.emptyText}>Rate or review something from its page and it will show up here.</p>
            ) : (
                <div className={styles.logsList}>
                    {logs.map((log) => {
                        const poster = tmdbImage(log.posterPath, 'w92');
                        return (
                            <Link key={`${log.mediaType}-${log.tmdbId}`} to={mediaPath(log.mediaType, log.tmdbId)} className={styles.logRow}>
                                {poster ? <img src={poster} alt="" className={styles.logPoster} /> : <div className={styles.logPoster} />}
                                <div className={styles.logDetails}>
                                    <div className={styles.logTitleRow}>
                                        <h3 className={styles.logMediaTitle}>{log.title}</h3>
                                        <span className={styles.timeAgo}>{timeAgo(log.reviewedAt!)}</span>
                                    </div>
                                    {log.rating !== null && (
                                        <div className={styles.starRatingRow}>
                                            <StarRating value={log.rating} size={15} />
                                            <span className={styles.starScore}>{log.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {log.review && <p className={styles.logSnippet}>{log.review}</p>}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
