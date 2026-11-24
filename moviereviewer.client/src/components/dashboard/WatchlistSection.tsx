import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { formatEpisode, type LibraryEntry } from '../../api/libraryApi';
import { mediaPath, tmdbImage, type MediaType } from '../../api/mediaApi';
import { StatusBadge } from '../common/StatusBadge';

interface WatchlistSectionProps {
    entries: LibraryEntry[];
    loading: boolean;
    error: string | null;
    onNextEpisode: (tmdbId: number) => Promise<void>;
}

export function WatchlistSection({ entries, loading, error, onNextEpisode }: WatchlistSectionProps) {
    const [mediaType, setMediaType] = useState<MediaType>('tv');

    // What you're watching first, then what you plan to watch; most recently touched first within each.
    const items = entries
        .filter((e) => e.mediaType === mediaType && (e.status === 'watching' || e.status === 'planToWatch'))
        .sort((a, b) => Number(b.status === 'watching') - Number(a.status === 'watching')
            || b.updatedAt.localeCompare(a.updatedAt));

    return (
        <section className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
                <h2 className={styles.sectionTitle}>My Watchlists</h2>
                <div className={styles.segmented} role="tablist">
                    {(['tv', 'movie'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            role="tab"
                            aria-selected={mediaType === type}
                            className={`${styles.segment} ${mediaType === type ? styles.segmentActive : ''}`}
                            onClick={() => setMediaType(type)}
                        >
                            {type === 'tv' ? 'TV Series' : 'Movies'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className={styles.emptyText}>Loading your watchlist…</p>
            ) : error ? (
                <p className={styles.errorText}>{error}</p>
            ) : items.length === 0 ? (
                <p className={styles.emptyText}>
                    Nothing here yet. Add {mediaType === 'tv' ? 'series' : 'movies'} from Suggestions & Trending or search above.
                </p>
            ) : (
                <div className={styles.watchlistRow}>
                    {items.map((item) => (
                        <WatchlistCard key={`${item.mediaType}-${item.tmdbId}`} item={item} onNextEpisode={onNextEpisode} />
                    ))}
                </div>
            )}
        </section>
    );
}

function WatchlistCard({ item, onNextEpisode }: { item: LibraryEntry; onNextEpisode: (tmdbId: number) => Promise<void> }) {
    const [busy, setBusy] = useState(false);
    const href = mediaPath(item.mediaType, item.tmdbId);
    const poster = tmdbImage(item.posterPath, 'w185');
    const isSeries = item.mediaType === 'tv';

    const next = async () => {
        setBusy(true);
        await onNextEpisode(item.tmdbId);
        setBusy(false);
    };

    return (
        <article className={styles.watchItemCard}>
            <Link to={href} className={styles.watchItemPosterLink}>
                {poster ? <img src={poster} alt="" className={styles.watchItemPoster} /> : <div className={styles.watchItemPoster} />}
            </Link>
            <div className={styles.watchItemContent}>
                <div>
                    <Link to={href} className={styles.watchItemTitle}>{item.title}</Link>
                    <p className={styles.watchItemSubtitle}>
                        {isSeries && item.totalEpisodes
                            ? `${item.episodesWatched} of ${item.totalEpisodes} episodes`
                            : isSeries ? 'Series' : 'Movie'}
                    </p>
                    <div className={styles.watchItemStatus}>
                        <StatusBadge status={item.status} />
                    </div>
                </div>

                {isSeries && (
                    <div className={styles.progressControls}>
                        <span className={styles.episodeBadge}>
                            {item.lastWatched ? formatEpisode(item.lastWatched.season, item.lastWatched.episode) : 'Not started'}
                        </span>
                        <button
                            type="button"
                            className={styles.incrementBtn}
                            onClick={next}
                            disabled={busy || item.status === 'finished'}
                            title="Mark the next episode as watched"
                        >
                            +1
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
