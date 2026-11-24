namespace MovieReviewer.Server.Models
{
    /// <summary>
    /// One title in a user's list: watch status, rating, review and episode progress together,
    /// like a MyAnimeList entry. At most one entry per user per title.
    /// </summary>
    public class LibraryEntry
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public User? User { get; set; }

        public int TmdbId { get; set; }
        public MediaType MediaType { get; set; }

        // Cached from TMDB so lists render without one request per title.
        public string Title { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public int? TotalEpisodes { get; set; }

        public WatchStatus? Status { get; set; }

        /// <summary>0.5 to 5 in half-star steps, or null when unrated.</summary>
        public double? Rating { get; set; }
        public string? Review { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>When the rating or review last changed; drives "recent logs" and the friends feed.</summary>
        public DateTime? ReviewedAt { get; set; }

        public List<SeasonProgress> Seasons { get; set; } = [];

        public bool IsEmpty => Status is null && Rating is null && string.IsNullOrWhiteSpace(Review)
            && Seasons.All(s => s.EpisodesWatched == 0);
    }

    /// <summary>Episodes 1..EpisodesWatched of a season are watched.</summary>
    public class SeasonProgress
    {
        public int LibraryEntryId { get; set; }
        public int SeasonNumber { get; set; }
        public int EpisodesWatched { get; set; }
    }
}
