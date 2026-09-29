import React, { useEffect, useState } from 'react';
import styles from './MediaDetails.module.css';
import {
    fetchMovieDetails,
    fetchSeriesDetails,
    type MovieDetails,
    type SeriesDetails
} from '../../api/movieApi';

interface MediaDetailsProps {
    id: number;
    mediaType: 'movie' | 'tv' | 'series';
    onBack?: () => void;
    onOpenRateModal?: () => void;
}

export const MediaDetails: React.FC<MediaDetailsProps> = ({
    id,
    mediaType,
    onBack,
    onOpenRateModal
}) => {
    const isMovie = mediaType === 'movie';

    const [movieData, setMovieData] = useState<MovieDetails | null>(null);
    const [seriesData, setSeriesData] = useState<SeriesDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Estados do painel interativo (Watchlist e Avaliação)
    const [watchStatus, setWatchStatus] = useState<'plan' | 'watching' | 'finished' | 'dropped'>('watching');
    const [userRating, setUserRating] = useState<number>(4);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [watchedEpisodes, setWatchedEpisodes] = useState<number>(4);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        setMovieData(null);
        setSeriesData(null);

        const loadMedia = async () => {
            try {
                if (isMovie) {
                    const data = await fetchMovieDetails(id);
                    if (isMounted) setMovieData(data);
                } else {
                    const data = await fetchSeriesDetails(id);
                    if (isMounted) setSeriesData(data);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Error loading details.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadMedia();

        return () => {
            isMounted = false;
        };
    }, [id, isMovie]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading details...</p>
            </div>
        );
    }

    const hasData = isMovie ? Boolean(movieData) : Boolean(seriesData);

    if (error || (!movieData && !seriesData)) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error || 'Content not found.'}</p>
                {onBack && (
                    <button className={styles.backBtn} onClick={onBack}>
                        Go back.
                    </button>
                )}
            </div>
        );
    }

    const title = isMovie ? movieData!.title : seriesData!.name;
    const rawDate = isMovie ? movieData!.release_date : seriesData!.first_air_date;
    const year = rawDate ? rawDate.substring(0, 4) : '';
    const overview = isMovie ? movieData!.overview : seriesData!.overview;
    const genres = isMovie ? movieData!.genres : seriesData!.genres;
    const voteAverage = isMovie ? movieData!.vote_average : seriesData!.vote_average;
    const ratingOutOfFive = (voteAverage / 2).toFixed(1);

    const posterPath = isMovie ? movieData!.poster_path : seriesData!.poster_path;
    const backdropPath = isMovie ? movieData!.backdrop_path : seriesData!.backdrop_path;

    const posterUrl = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : null;
    const backdropUrl = backdropPath
        ? `https://image.tmdb.org/t/p/original${backdropPath}`
        : null;

    // Formata minutos em "Xh Ym" para filmes
    const formatRuntime = (minutes: number | null) => {
        if (!minutes) return null;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
    };

    return (
        <main className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* HERO BANNER */}
                <section
                    className={styles.heroBanner}
                    style={{
                        backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
                    }}
                >
                    <div className={styles.heroOverlay}>
                        <div className={styles.heroContent}>
                            {/* Poster Flutuante */}
                            <div className={styles.posterContainer}>
                                {posterUrl ? (
                                    <img src={posterUrl} alt={title} className={styles.posterImage} />
                                ) : (
                                    <div className={styles.posterPlaceholder}>🎬</div>
                                )}
                            </div>

                            {/* Informações Principais */}
                            <div className={styles.heroMain}>
                                <div className={styles.titleArea}>
                                    <h1 className={styles.mediaTitle}>
                                        {title} {year && <span className={styles.year}>({year})</span>}
                                    </h1>

                                    {/* Metadados: Diferentes para Filme e Série */}
                                    <div className={styles.metaRow}>
                                        {isMovie ? (
                                            <>
                                                {movieData?.runtime && (
                                                    <span className={styles.metaText}>
                                                        {formatRuntime(movieData.runtime)}
                                                    </span>
                                                )}
                                                <div className={styles.genreGroup}>
                                                    {genres.slice(0, 3).map((g) => (
                                                        <span key={g.id} className={styles.genreBadge}>
                                                            {g.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className={styles.ratingBadge}>
                                                    ★ {ratingOutOfFive}/5
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.metaText}>
                                                    {seriesData?.number_of_seasons}{' '}
                                                    {seriesData?.number_of_seasons === 1 ? 'Temporada' : 'Temporadas'} ·{' '}
                                                    {seriesData?.number_of_episodes} Episódios
                                                </span>
                                                <span className={styles.ratingBadge}>
                                                    ★ {ratingOutOfFive}/5
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {!isMovie && (
                                        <div className={styles.seriesGenres}>
                                            {genres.map((g) => g.name).join(', ')}
                                        </div>
                                    )}
                                </div>

                                {/* Cartão Interativo: Log & Watchlist */}
                                <div className={styles.interactiveCard}>
                                    <h3 className={styles.cardHeaderTitle}>
                                        {isMovie ? 'Log & Watchlist' : 'Registrar e Lista de Desejos'}
                                    </h3>

                                    {/* Se for Série: Rastreador de Episódios */}
                                    {!isMovie ? (
                                        <div className={styles.episodeControlRow}>
                                            <div className={styles.watchedEpPill}>
                                                Episódios assistidos: S01E0{watchedEpisodes} / {seriesData?.number_of_episodes || 10}
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.epAddBtn}
                                                onClick={() => setWatchedEpisodes((prev) => prev + 1)}
                                            >
                                                +1 Ep
                                            </button>
                                            <button type="button" className={styles.epEditBtn}>
                                                Editar
                                            </button>
                                        </div>
                                    ) : (
                                        /* Se for Filme: Seletor de Estados */
                                        <div className={styles.statusPillsRow}>
                                            <button
                                                type="button"
                                                className={`${styles.statusPill} ${watchStatus === 'plan' ? styles.statusPillActive : ''}`}
                                                onClick={() => setWatchStatus('plan')}
                                            >
                                                Plan to Watch
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.statusPill} ${watchStatus === 'watching' ? styles.statusPillActive : ''}`}
                                                onClick={() => setWatchStatus('watching')}
                                            >
                                                Watching
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.statusPill} ${watchStatus === 'finished' ? styles.statusPillActive : ''}`}
                                                onClick={() => setWatchStatus('finished')}
                                            >
                                                Finished
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.statusPill} ${watchStatus === 'dropped' ? styles.statusPillActive : ''}`}
                                                onClick={() => setWatchStatus('dropped')}
                                            >
                                                Dropped
                                            </button>
                                        </div>
                                    )}

                                    {/* Avaliação e Submissão */}
                                    <div className={styles.ratingSection}>
                                        <div className={styles.starsBlock}>
                                            <span className={styles.ratingLabel}>Rating</span>
                                            <div className={styles.starRow}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`${styles.star} ${(hoverRating || userRating) >= star ? styles.starFilled : ''}`}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setUserRating(star)}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.logReviewBtn}
                                            onClick={onOpenRateModal}
                                        >
                                            {isMovie ? 'Log Review' : 'Registrar Crítica'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* GRELHA INFERIOR (Sinopse, Elenco, Críticas) */}
                <section className={styles.lowerGrid}>
                    {/* Cartão 1: Sinopse */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>Synopsis</h2>
                        <p className={styles.overviewText}>
                            {overview || 'Nenhuma sinopse disponível para este título.'}
                        </p>
                    </div>

                    {/* Cartão 2: Elenco e Equipa */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>
                            {isMovie ? 'Cast & Crew' : 'Elenco & Criadores'}
                        </h2>
                        <div className={styles.castRow}>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>👤</div>
                                <span className={styles.castName}>Ator Principal</span>
                                <span className={styles.castRole}>Personagem</span>
                            </div>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>👤</div>
                                <span className={styles.castName}>Co-Protagonista</span>
                                <span className={styles.castRole}>Personagem</span>
                            </div>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>🎬</div>
                                <span className={styles.castName}>Realizador</span>
                                <span className={styles.castRole}>{isMovie ? 'Director' : 'Showrunner'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cartão 3: Friend Reviews */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>Friend Reviews</h2>
                        <div className={styles.reviewsList}>
                            <div className={styles.reviewItem}>
                                <div className={styles.reviewAvatar}>👩</div>
                                <div className={styles.reviewBody}>
                                    <div className={styles.reviewHeader}>
                                        <span className={styles.reviewUser}>@sarah_k</span>
                                        <span className={styles.reviewRating}>★ 4.5/5</span>
                                        <span className={styles.reviewTime}>2h ago</span>
                                    </div>
                                    <p className={styles.reviewText}>
                                        Visualmente impressionante. Uma obra cinematográfica de topo!
                                    </p>
                                </div>
                            </div>

                            <div className={styles.reviewItem}>
                                <div className={styles.reviewAvatar}>👨</div>
                                <div className={styles.reviewBody}>
                                    <div className={styles.reviewHeader}>
                                        <span className={styles.reviewUser}>@alex_v</span>
                                        <span className={styles.reviewRating}>★ 4.5/5</span>
                                        <span className={styles.reviewTime}>5h ago</span>
                                    </div>
                                    <p className={styles.reviewText}>
                                        A escala é monumental. Um dos melhores lançamentos do ano.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};