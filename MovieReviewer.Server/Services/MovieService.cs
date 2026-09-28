using System.Text.Json.Serialization;

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

            var movies = await response.Content.ReadFromJsonAsync<object>();

            return movies;
        }

        public async Task<object> GetTrendingSeriesAsync()
        {
            var response = await _httpClient.GetAsync($"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch trending series. Status: {response.StatusCode}");
            }

            var series = await response.Content.ReadFromJsonAsync<object>();

            return series;
        }

        public async Task<object> GetOnlyMediaByQueryAsync(string query, int page)
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
            public DateTime? ReleaseDate { get; init; }

            [JsonPropertyName("first_air_date")]
            public DateTime? FirstAirDate { get; init; }
        }
    }
}
