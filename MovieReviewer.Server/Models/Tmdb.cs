namespace MovieReviewer.Server.Models
{
    // Shapes returned by TMDB. Deserialized with a snake_case naming policy, and sent to the
    // client in camelCase like every other API response.

    public record Genre(int Id, string Name);

    public record Season
    {
        public int SeasonNumber { get; init; }
        public string Name { get; init; } = string.Empty;
        public int EpisodeCount { get; init; }
        public string? AirDate { get; init; }
        public string? PosterPath { get; init; }
    }

    public record MovieDetails
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string? Overview { get; init; }
        public string? PosterPath { get; init; }
        public string? BackdropPath { get; init; }
        public string? ReleaseDate { get; init; }
        public int? Runtime { get; init; }
        public double VoteAverage { get; init; }
        public List<Genre> Genres { get; init; } = [];
    }

    public record SeriesDetails
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string? Overview { get; init; }
        public string? PosterPath { get; init; }
        public string? BackdropPath { get; init; }
        public string? FirstAirDate { get; init; }
        public int NumberOfSeasons { get; init; }
        public int NumberOfEpisodes { get; init; }
        public List<int> EpisodeRunTime { get; init; } = [];
        public double VoteAverage { get; init; }
        public List<Genre> Genres { get; init; } = [];

        /// <summary>Regular seasons only (TMDB's "Specials" season 0 is removed).</summary>
        public List<Season> Seasons { get; init; } = [];
    }

    /// <summary>A movie or series as it appears in search and trending lists.</summary>
    public record MediaSummary(
        int Id,
        MediaType MediaType,
        string Title,
        string? Overview,
        string? PosterPath,
        string? BackdropPath,
        string? ReleaseDate,
        double VoteAverage);

    // Raw list item from TMDB: movies use title/release_date, series use name/first_air_date.
    internal record TmdbListItem
    {
        public int Id { get; init; }
        public string? MediaType { get; init; }
        public string? Title { get; init; }
        public string? Name { get; init; }
        public string? Overview { get; init; }
        public string? PosterPath { get; init; }
        public string? BackdropPath { get; init; }
        public string? ReleaseDate { get; init; }
        public string? FirstAirDate { get; init; }
        public double VoteAverage { get; init; }
    }

    internal record TmdbPage(List<TmdbListItem> Results);
}
