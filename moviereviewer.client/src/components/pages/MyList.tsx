import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MyList.module.css';
import { fetchLibrary, WATCH_STATUSES, type LibraryEntry, type WatchStatus } from '../../api/libraryApi';
import { mediaPath, tmdbImage, type MediaType } from '../../api/mediaApi';
import { useLoad } from '../../utils/useLoad';
import { StarRating } from '../common/StarRating';
import { StatusBadge } from '../common/StatusBadge';

type SortKey = 'updated' | 'title' | 'rating';

const SORTERS: Record<SortKey, (a: LibraryEntry, b: LibraryEntry) => number> = {
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    title: (a, b) => a.title.localeCompare(b.title),
    rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
};

/** Everything the user has rated, reviewed or put on a list, MyAnimeList style. */
export function MyList() {
    const library = useLoad(() => fetchLibrary(), []);
    const [status, setStatus] = useState<WatchStatus | 'all'>('all');
    const [mediaType, setMediaType] = useState<MediaType | 'all'>('all');
    const [sort, setSort] = useState<SortKey>('updated');

    const entries = library.data ?? [];
    const ofType = entries.filter((e) => mediaType === 'all' || e.mediaType === mediaType);
    const rows = ofType.filter((e) => status === 'all' || e.status === status).sort(SORTERS[sort]);
    const count = (s: WatchStatus | 'all') => (s === 'all' ? ofType.length : ofType.filter((e) => e.status === s).length);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <h1 className={styles.title}>My List</h1>
                    <div className={styles.controls}>
                        <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType | 'all')} className={styles.select} aria-label="Type">
                            <option value="all">Movies & Series</option>
                            <option value="movie">Movies</option>
                            <option value="tv">Series</option>
                        </select>
                        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={styles.select} aria-label="Sort by">
                            <option value="updated">Recently updated</option>
                            <option value="title">Title</option>
                            <option value="rating">Your score</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tabs} role="tablist">
                    {[{ value: 'all' as const, label: 'All' }, ...WATCH_STATUSES].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={status === tab.value}
                            className={`${styles.tab} ${status === tab.value ? styles.tabActive : ''}`}
                            onClick={() => setStatus(tab.value)}
                        >
                            {tab.label} <span className={styles.tabCount}>{count(tab.value)}</span>
                        </button>
                    ))}
                </div>

                <section className={styles.card}>
                    {library.loading ? (
                        <p className={styles.message}>Loading your list…</p>
                    ) : library.error ? (
                        <p className={styles.error}>{library.error}</p>
                    ) : rows.length === 0 ? (
                        <p className={styles.message}>
                            Nothing here yet. Open a movie or series and set a status, rating or review to add it.
                        </p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.numCol}>#</th>
                                    <th>Title</th>
                                    <th className={styles.hideSmall}>Type</th>
                                    <th>Score</th>
                                    <th className={styles.hideSmall}>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((entry, index) => (
                                    <ListRow key={`${entry.mediaType}-${entry.tmdbId}`} entry={entry} index={index + 1} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </main>
    );
}

function ListRow({ entry, index }: { entry: LibraryEntry; index: number }) {
    const poster = tmdbImage(entry.posterPath, 'w92');
    const isSeries = entry.mediaType === 'tv';

    return (
        <tr>
            <td className={styles.numCol}>{index}</td>
            <td>
                <Link to={mediaPath(entry.mediaType, entry.tmdbId)} className={styles.titleCell}>
                    {poster ? <img src={poster} alt="" className={styles.poster} /> : <div className={styles.poster} />}
                    <span>
                        <span className={styles.entryTitle}>{entry.title}</span>
                        {entry.review && <span className={styles.reviewSnippet}>{entry.review}</span>}
                    </span>
                </Link>
            </td>
            <td className={styles.hideSmall}>{isSeries ? 'Series' : 'Movie'}</td>
            <td>
                {entry.rating !== null ? (
                    <span className={styles.score}>
                        <StarRating value={entry.rating} size={13} />
                        {entry.rating.toFixed(1)}
                    </span>
                ) : (
                    <span className={styles.muted}>–</span>
                )}
            </td>
            <td className={styles.hideSmall}>
                {isSeries ? `${entry.episodesWatched} / ${entry.totalEpisodes ?? '?'}` : <span className={styles.muted}>–</span>}
            </td>
            <td>{entry.status ? <StatusBadge status={entry.status} /> : <span className={styles.muted}>Rated only</span>}</td>
        </tr>
    );
}
