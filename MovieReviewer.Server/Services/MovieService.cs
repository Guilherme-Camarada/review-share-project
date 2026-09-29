using System.Text.Json.Serialization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MovieReviewer.Server.Services
{
    public class MovieService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;


        public MovieService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["TMDB:ApiKey"] ?? throw new InvalidOperationException("TMDB ApiKey is missing from configuration.");
        }

        public async Task<object> GetTrendingMoviesAsync()
        {
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/trending/movie/day?api_key={_apiKey}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch trending movies. Status: {response.StatusCode}");
            }

            var movies = await response.Content.ReadFromJsonAsync<TmdbSearchResponse>();

            if (movies?.Results == null)
            {
                throw new Exception("No results found in the response.");
            }

            return movies.Results.ToList();
        }

        public async Task<object> GetTrendingSeriesAsync()
        {
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch trending series. Status: {response.StatusCode}");
            }

            var series = await response.Content.ReadFromJsonAsync<TmdbSearchResponse>();

            if (series?.Results == null)
            {
                throw new Exception("No results found in the response.");
            }

            return series.Results.ToList();
        }

        public async Task<object> GetOnlyMediaByQueryAsync(string query, int page = 1)
        {
            var encodedQuery = Uri.EscapeDataString(query);
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/search/multi?api_key={_apiKey}&query={encodedQuery}&page={page}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch media by query. Status: {response.StatusCode}");
            }

            var data = await response.Content.ReadFromJsonAsync<TmdbSearchResponse>();

            if (data?.Results == null)
            {
                throw new Exception("No results found in the response.");
            }

            return data.Results
                .Where(item => !string.Equals(item.MediaType, "person", StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        public async Task<object> GetMovieDetailsByIdAsync(int movieId)
        {
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch movie details. Status: {response.StatusCode}");
            }

            var data = await response.Content.ReadFromJsonAsync<MovieDetails>();

            if (data == null)
            {
                throw new Exception("No movie details found in the response.");
            }

            return data;
        }

        public async Task<object> GetSeriesDetailsByIdAsync(int seriesId)
        {
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/tv/{seriesId}?api_key={_apiKey}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch series details. Status: {response.StatusCode}");
            }

            var data = await response.Content.ReadFromJsonAsync<SeriesDetails>();

            if (data == null)
            {
                throw new Exception("No series details found in the response.");
            }

            return data;
        }

        public record TmdbSearchResponse
        {
            [JsonPropertyName("page")]
            public int Page { get; init; }

            [JsonPropertyName("results")]
            public List<TmdbMediaItem> Results { get; init; } = new();

            [JsonPropertyName("total_pages")]
            public int TotalPages { get; init; }

            [JsonPropertyName("total_results")]
            public int TotalResults { get; init; }
        }

        public record TmdbMediaItem
        {
            [JsonPropertyName("id")]
            public int Id { get; init; }

            [JsonPropertyName("media_type")]
            public string MediaType { get; init; } = string.Empty;

            [JsonPropertyName("title")]
            public string? Title { get; init; }

            [JsonPropertyName("name")]
            public string? Name { get; init; }

            [JsonPropertyName("overview")]
            public string Overview { get; init; } = string.Empty;

            [JsonPropertyName("backdrop_path")]
            public string BackdropPath { get; init; } = string.Empty;

            [JsonPropertyName("poster_path")]
            public string PosterPath { get; init; } = string.Empty;

            [JsonPropertyName("genre_ids")]
            public List<int> GenreIdList { get; init; } = new();

            [JsonPropertyName("release_date")]
            public string? ReleaseDate { get; init; }

            [JsonPropertyName("first_air_date")]
            public string? FirstAirDate { get; init; }
        }

        public record MovieDetails
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("title")]
            public string Title { get; set; } = string.Empty;

            [JsonPropertyName("overview")]
            public string Overview { get; set; } = string.Empty;

            [JsonPropertyName("poster_path")]
            public string? PosterPath { get; set; }

            [JsonPropertyName("backdrop_path")]
            public string? BackdropPath { get; set; }

            [JsonPropertyName("release_date")]
            public string? ReleaseDate { get; set; }

            [JsonPropertyName("runtime")]
            public int? Runtime { get; set; }

            [JsonPropertyName("vote_average")]
            public double VoteAverage { get; set; }

            [JsonPropertyName("genres")]
            public List<GenreDetails> Genres { get; set; } = new();
        }

        public class SeriesDetails
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;

            [JsonPropertyName("overview")]
            public string Overview { get; set; } = string.Empty;

            [JsonPropertyName("poster_path")]
            public string? PosterPath { get; set; }

            [JsonPropertyName("backdrop_path")]
            public string? BackdropPath { get; set; }

            [JsonPropertyName("first_air_date")]
            public string? FirstAirDate { get; set; }

            [JsonPropertyName("number_of_seasons")]
            public int NumberOfSeasons { get; set; }

            [JsonPropertyName("number_of_episodes")]
            public int NumberOfEpisodes { get; set; }

            [JsonPropertyName("episode_run_time")]
            public List<int>? EpisodeRunTime { get; set; }

            [JsonPropertyName("vote_average")]
            public double VoteAverage { get; set; }

            [JsonPropertyName("genres")]
            public List<GenreDetails> Genres { get; set; } = new();
        }

        public record GenreDetails
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;
        }


    }
}
