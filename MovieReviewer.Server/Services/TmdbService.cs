using System.Net;
using System.Text.Json;
using MovieReviewer.Server.Models;

namespace MovieReviewer.Server.Services
{
    /// <summary>Thin client for The Movie Database API. Returns null when TMDB says "not found".</summary>
    public class TmdbService
    {
        public const string BaseUrl = "https://api.themoviedb.org/3/";

        private static readonly JsonSerializerOptions TmdbJson = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        };

        private readonly HttpClient _http;
        private readonly string _apiKey;

        public TmdbService(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _apiKey = configuration["TMDB:ApiKey"]
                ?? throw new InvalidOperationException("TMDB:ApiKey is missing from configuration.");
        }

        public async Task<List<MediaSummary>> GetTrendingAsync(MediaType mediaType)
        {
            var page = await GetAsync<TmdbPage>($"trending/{ToPath(mediaType)}/day");
            return ToSummaries(page);
        }

        public async Task<List<MediaSummary>> SearchAsync(string query, int page = 1)
        {
            var result = await GetAsync<TmdbPage>("search/multi", $"&query={Uri.EscapeDataString(query)}&page={page}");
            return ToSummaries(result);
        }

        public Task<MovieDetails?> GetMovieAsync(int id) => GetAsync<MovieDetails>($"movie/{id}");

        public async Task<SeriesDetails?> GetSeriesAsync(int id)
        {
            var series = await GetAsync<SeriesDetails>($"tv/{id}");
            return series is null
                ? null
                : series with { Seasons = series.Seasons.Where(s => s.SeasonNumber > 0).ToList() };
        }

        public static string ToPath(MediaType mediaType) => mediaType == MediaType.Movie ? "movie" : "tv";

        private async Task<T?> GetAsync<T>(string path, string extraQuery = "") where T : class
        {
            using var response = await _http.GetAsync($"{path}?api_key={_apiKey}{extraQuery}");

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"TMDB request to '{path}' failed with {(int)response.StatusCode}.");

            return await response.Content.ReadFromJsonAsync<T>(TmdbJson);
        }

        // Keeps only movies and series (search/multi also returns people) and unifies their field names.
        private static List<MediaSummary> ToSummaries(TmdbPage? page) =>
            (page?.Results ?? [])
                .Where(item => item.MediaType is "movie" or "tv")
                .Select(item => new MediaSummary(
                    item.Id,
                    item.MediaType == "movie" ? MediaType.Movie : MediaType.Tv,
                    item.Title ?? item.Name ?? "Untitled",
                    item.Overview,
                    item.PosterPath,
                    item.BackdropPath,
                    item.ReleaseDate ?? item.FirstAirDate,
                    item.VoteAverage))
                .ToList();
    }
}
