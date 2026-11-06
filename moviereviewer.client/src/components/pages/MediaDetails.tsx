import React, { useEffect, useState, useMemo } from 'react';
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

    // Watchlist & Rating state
    const [watchStatus, setWatchStatus] = useState<'plan' | 'watching' | 'finished' | 'dropped' | null>('watching');
    const [userRating, setUserRating] = useState<number>(4);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>('');

    // Series Seasons & Episode tracking state
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [watchedBySeason, setWatchedBySeason] = useState<Record<number, number>>({ 1: 4 });

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

    const seasonsList = useMemo(() => {
        if (!seriesData) return [];

        const rawSeasons = (seriesData as any).seasons;
        if (Array.isArray(rawSeasons) && rawSeasons.length > 0) {
            const filtered = rawSeasons.filter((s: any) => s.season_number > 0);
            if (filtered.length > 0) {
                return filtered.map((s: any) => ({
                    season_number: s.season_number,
                    name: s.name || `Season ${s.season_number}`,
                    episode_count: s.episode_count || 10
                }));
            }
        }

        const count = seriesData.number_of_seasons || 1;
        const totalEps = seriesData.number_of_episodes || 10;
        const avgPerSeason = Math.max(1, Math.round(totalEps / count));

        return Array.from({ length: count }, (_, i) => ({
            season_number: i + 1,
            name: `Season ${i + 1}`,
            episode_count: avgPerSeason
        }));
    }, [seriesData]);

    const activeSeason = useMemo(() => {
        return seasonsList.find((s) => s.season_number === selectedSeason) || seasonsList[0];
    }, [seasonsList, selectedSeason]);

    const handleEpisodeClick = (seasonNum: number, epNum: number) => {
        setWatchedBySeason((prev) => {
            const current = prev[seasonNum] || 0;
            const updated = current === epNum ? epNum - 1 : epNum;
            return { ...prev, [seasonNum]: updated };
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading details...</p>
            </div>
        );
    }

    const hasData = isMovie ? Boolean(movieData) : Boolean(seriesData);

    if (error || !hasData) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error || 'Content not found.'}</p>
                {onBack && (
                    <button className={styles.backBtn} onClick={onBack}>
                        Go back
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

    const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
    const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/original${backdropPath}` : null;

    const formatRuntime = (minutes: number | null) => {
        if (!minutes) return null;
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
    };

    const renderStarRating = () => {
        const activeRating = hoverRating > 0 ? hoverRating : userRating;

        return (
            <div className={styles.starRow} onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const fillWidth =
                        activeRating >= star
                            ? '100%'
                            : activeRating >= star - 0.5
                                ? '50%'
                                : '0%';

                    return (
                        <div key={star} className={styles.starContainer}>
                            <span className={styles.starBase}>★</span>
                            <span
                                className={styles.starFill}
                                style={{ width: fillWidth }}
                            >
                                ★
                            </span>

                            {/* Left half hitbox (star - 0.5) */}
                            <div
                                className={styles.starHalfLeft}
                                onMouseEnter={() => setHoverRating(star - 0.5)}
                                onClick={() =>
                                    setUserRating((prev) => (prev === star - 0.5 ? 0 : star - 0.5))
                                }
                                title={`${star - 0.5} stars`}
                            />

                            {/* Right half hitbox (star) */}
                            <div
                                className={styles.starHalfRight}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() =>
                                    setUserRating((prev) => (prev === star ? 0 : star))
                                }
                                title={`${star} stars`}
                            />
                        </div>
                    );
                })}
            </div>
        );
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
                            {/* Poster */}
                            <div className={styles.posterContainer}>
                                {posterUrl ? (
                                    <img src={posterUrl} alt={title} className={styles.posterImage} />
                                ) : (
                                    <div className={styles.posterPlaceholder}>🎬</div>
                                )}
                            </div>

                            {/* Main Info */}
                            <div className={styles.heroMain}>
                                <div className={styles.titleArea}>
                                    {/* 1. Title */}
                                    <h1 className={styles.mediaTitle}>
                                        {title} {year && <span className={styles.year}>({year})</span>}
                                    </h1>

                                    {/* 2. Duration & Rating */}
                                    <div className={styles.metaRow}>
                                        <span className={styles.durationText}>
                                            {isMovie
                                                ? formatRuntime(movieData?.runtime ?? null) || 'N/A'
                                                : `${seriesData?.number_of_seasons} ${seriesData?.number_of_seasons === 1 ? 'Season' : 'Seasons'
                                                } · ${seriesData?.number_of_episodes} Episodes`}
                                        </span>
                                        <span className={styles.ratingBadge}>
                                            ★ {ratingOutOfFive}/5
                                        </span>
                                    </div>

                                    {/* 3. Highlighted Genre Badges */}
                                    <div className={styles.genreGroup}>
                                        {genres.map((g) => (
                                            <span key={g.id} className={styles.genreBadge}>
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* 4. Watchlist Rectangles (No outer box) */}
                                    <div className={styles.statusPillsRow}>
                                        {[
                                            { key: 'plan', label: 'Plan to Watch', pillClass: styles.pillPlan, activeClass: styles.pillPlanActive },
                                            { key: 'watching', label: 'Watching', pillClass: styles.pillWatching, activeClass: styles.pillWatchingActive },
                                            { key: 'finished', label: 'Finished', pillClass: styles.pillFinished, activeClass: styles.pillFinishedActive },
                                            { key: 'dropped', label: 'Dropped', pillClass: styles.pillDropped, activeClass: styles.pillDroppedActive },
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                className={`${styles.statusPill} ${item.pillClass} ${watchStatus === item.key ? item.activeClass : ''
                                                    }`}
                                                onClick={() => setWatchStatus((prev) => (prev === item.key ? null : (item.key as any)))}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 5. Interactive Cards */}
                                {isMovie ? (
                                    /* FOR MOVIES: Review block directly underneath watchlist rectangles */
                                    <div className={styles.movieReviewerCard}>
                                        <div className={styles.reviewHeaderRow}>
                                            <span className={styles.cardHeaderTitle}>Rating & Review</span>
                                            {renderStarRating()}
                                        </div>

                                        <textarea
                                            className={styles.reviewTextarea}
                                            placeholder="Write your review or notes..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            rows={2}
                                        />

                                        <button
                                            type="button"
                                            className={styles.logReviewBtn}
                                            onClick={onOpenRateModal}
                                        >
                                            Log Review
                                        </button>
                                    </div>
                                ) : (
                                    /* FOR SERIES: Episode Tracker on the left, Review Box to the right */
                                    <div className={styles.seriesInteractiveContainer}>
                                        {activeSeason && (
                                            <div className={styles.seriesEpisodeCard}>
                                                <div className={styles.seasonTabs}>
                                                    {seasonsList.map((season) => (
                                                        <button
                                                            key={season.season_number}
                                                            type="button"
                                                            className={`${styles.seasonTab} ${selectedSeason === season.season_number
                                                                    ? styles.seasonTabActive
                                                                    : ''
                                                                }`}
                                                            onClick={() => setSelectedSeason(season.season_number)}
                                                        >
                                                            {season.name}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className={styles.episodeGridWrapper}>
                                                    <div className={styles.episodeGridHeader}>
                                                        <span>Episodes</span>
                                                        <span className={styles.watchedProgressText}>
                                                            {watchedBySeason[selectedSeason] || 0} / {activeSeason.episode_count} watched
                                                        </span>
                                                    </div>

                                                    <div className={styles.episodeGrid}>
                                                        {Array.from({ length: activeSeason.episode_count }, (_, i) => {
                                                            const epNum = i + 1;
                                                            const isWatched = (watchedBySeason[selectedSeason] || 0) >= epNum;

                                                            return (
                                                                <button
                                                                    key={epNum}
                                                                    type="button"
                                                                    className={`${styles.episodeBox} ${isWatched ? styles.episodeBoxWatched : ''
                                                                        }`}
                                                                    onClick={() => handleEpisodeClick(selectedSeason, epNum)}
                                                                    title={`Episode ${epNum} ${isWatched ? '(Watched)' : ''}`}
                                                                >
                                                                    {epNum}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.seriesReviewerCard}>
                                            <div className={styles.reviewHeaderRow}>
                                                <span className={styles.cardHeaderTitle}>Rating & Review</span>
                                                 {renderStarRating()}
                                            </div>

                                            <textarea
                                                className={styles.reviewTextarea}
                                                placeholder="Write your review or notes..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                rows={3}
                                            />

                                            <button
                                                type="button"
                                                className={styles.logReviewBtn}
                                                onClick={onOpenRateModal}
                                            >
                                                Log Review
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOWER 3-COLUMN GRID */}
                <section className={styles.lowerGrid}>
                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>Synopsis</h2>
                        <p className={styles.overviewText}>
                            {overview || 'No synopsis available for this title.'}
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <h2 className={styles.sectionHeading}>
                            {isMovie ? 'Cast & Crew' : 'Cast & Creators'}
                        </h2>
                        <div className={styles.castRow}>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>👤</div>
                                <span className={styles.castName}>Main Actor</span>
                                <span className={styles.castRole}>Character</span>
                            </div>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>👤</div>
                                <span className={styles.castName}>Co-Star</span>
                                <span className={styles.castRole}>Character</span>
                            </div>
                            <div className={styles.castMember}>
                                <div className={styles.castAvatar}>🎬</div>
                                <span className={styles.castName}>Lead Director</span>
                                <span className={styles.castRole}>{isMovie ? 'Director' : 'Showrunner'}</span>
                            </div>
                        </div>
                    </div>

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
                                        Visually breathtaking. A true cinematic masterpiece!
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
                                        The scale is immense. Best release of the year.
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