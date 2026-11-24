import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import type { LibraryEntry } from '../../api/libraryApi';
import { mediaPath, tmdbImage, type MediaSummary } from '../../api/mediaApi';
import { StarRating } from '../common/StarRating';

interface TrendingSectionProps {
    items: MediaSummary[];
    loading: boolean;
    error: string | null;
    libraryEntries: LibraryEntry[];
    onAddToWatchlist: (item: MediaSummary) => Promise<void>;
}

export function TrendingSection({ items, loading, error, libraryEntries, onAddToWatchlist }: TrendingSectionProps) {
    const inLibrary = (item: MediaSummary) =>
        libraryEntries.some((e) => e.mediaType === item.mediaType && e.tmdbId === item.id && e.status);

    return (
        <section className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Suggestions & Trending</h2>
            <p className={styles.suggestionsSubtitle}>Trending today on TMDB.</p>

            {loading ? (
                <p className={styles.emptyText}>Loading…</p>
            ) : error ? (
                <p className={styles.errorText}>{error}</p>
            ) : (
                <div className={styles.suggestionsGrid}>
                    {items.slice(0, 6).map((item) => {
                        const poster = tmdbImage(item.posterPath, 'w342');
                        const added = inLibrary(item);
                        return (
                            <div key={`${item.mediaType}-${item.id}`} className={styles.suggestionCard}>
                                <Link to={mediaPath(item.mediaType, item.id)} className={styles.suggestionLink}>
                                    {poster ? <img src={poster} alt="" className={styles.suggestionPoster} /> : <div className={styles.suggestionPoster} />}
                                    <span className={styles.suggestionTitle}>{item.title}</span>
                                </Link>
                                <div className={styles.suggestionMeta}>
                                    <span className={styles.tmdbTag}>TMDB</span>
                                    <StarRating value={Math.round(item.voteAverage) / 2} size={13} />
                                </div>
                                <button
                                    type="button"
                                    className={styles.addToWatchlistButton}
                                    onClick={() => onAddToWatchlist(item)}
                                    disabled={added}
                                >
                                    {added ? 'In your list' : 'Add to Watchlist'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
