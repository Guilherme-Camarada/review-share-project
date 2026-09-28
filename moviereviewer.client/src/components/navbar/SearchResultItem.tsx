import React from 'react';
import styles from './SearchResultItem.module.css'; 
import type { TmdbMediaItem } from '../../api/movieApi';

interface SearchResultItemProps {
    item: TmdbMediaItem;
    onSelect?: (item: TmdbMediaItem) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, onSelect }) => {
    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || 'Unknown';
    const year = releaseDate ? releaseDate.substring(0, 4) : 'Unknown';
    const isMovie = item.media_type === 'movie' || (!item.media_type && item.title);

    const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'null';

    return (
        <li className={styles.item} onClick={() => onSelect && onSelect(item)}>
            <div className={styles.posterWrapper}>
                {posterUrl ? (
                    <img src={posterUrl} alt={title} className={styles.poster} />
                ) : (
                    <div className={styles.posterPlaceholder}>
                        <span>🎬</span>
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.titleRow}>
                    <span className={styles.title}>{title}</span>
                    {year && <span className={styles.year}>({year})</span>}
                </div>

                <div className={styles.metaRow}>
                    <span className={`${styles.badge} ${isMovie ? styles.movieBadge : styles.seriesBadge}`}>
                        {item.media_type}
                    </span>
                    {item.overview && (
                        <p className={styles.overview}>{item.overview}</p>
                    )}
                </div>
            </div>
        </li>
    );
};