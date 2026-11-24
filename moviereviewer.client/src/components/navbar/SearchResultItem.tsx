import styles from './SearchResultItem.module.css';
import { tmdbImage, type MediaSummary } from '../../api/mediaApi';

interface SearchResultItemProps {
    item: MediaSummary;
    onSelect: (item: MediaSummary) => void;
}

export function SearchResultItem({ item, onSelect }: SearchResultItemProps) {
    const year = item.releaseDate?.substring(0, 4);
    const posterUrl = tmdbImage(item.posterPath, 'w92');
    const isMovie = item.mediaType === 'movie';

    return (
        <li className={styles.item} onClick={() => onSelect(item)}>
            <div className={styles.posterWrapper}>
                {posterUrl ? (
                    <img src={posterUrl} alt="" className={styles.poster} />
                ) : (
                    <div className={styles.posterPlaceholder}>
                        <span>🎬</span>
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.titleRow}>
                    <span className={styles.title}>{item.title}</span>
                    {year && <span className={styles.year}>({year})</span>}
                </div>

                <div className={styles.metaRow}>
                    <span className={`${styles.badge} ${isMovie ? styles.movieBadge : styles.seriesBadge}`}>
                        {isMovie ? 'movie' : 'series'}
                    </span>
                    {item.overview && <p className={styles.overview}>{item.overview}</p>}
                </div>
            </div>
        </li>
    );
}
