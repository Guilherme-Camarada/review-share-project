import React from 'react';
import type { MediaItem } from '../../api/movieApi';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    item: MediaItem;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
    const title = item.title || item.name || 'Untitled';
    const rawDate = item.release_date || item.first_air_date;
    const year = rawDate ? ` (${rawDate.split('-')[0]})` : '';

    const posterSrc = item.poster_path
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
        : 'https://placehold.co/110x165?text=No+Poster';

    // TMDB vote_average is out of 10 -> map to 5 stars
    const starCount = Math.round((item.vote_average || 0) / 2);

    return (
        <article className={styles.card}>
            <img src={posterSrc} alt={title} className={styles.poster} />
            <div className={styles.content}>
                <div className={styles.headerRow}>
                    <h3 className={styles.title}>
                        {title}
                        <span className={styles.year}>{year}</span>
                    </h3>
                    <button className={styles.moreButton} aria-label="More options">•••</button>
                </div>

                <div className={styles.stars}>
                    {'★'.repeat(starCount)}
                    {'☆'.repeat(Math.max(0, 5 - starCount))}
                </div>

                <p className={styles.overview}>{item.overview || 'No description available.'}</p>

                <div className={styles.actions}>
                    <span className={styles.actionItem}>
                        👍 {Math.round((item.vote_average || 5) * 200)}
                    </span>
                    <span className={styles.actionItem}>
                        💬 {Math.round((item.vote_average || 5) * 35)}
                    </span>
                </div>
            </div>
        </article>
    );
};