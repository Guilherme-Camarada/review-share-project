using Microsoft.AspNetCore.Mvc;
using MovieReviewer.Server.Services;

namespace MovieReviewer.Server.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class MovieController
    {
        private readonly MovieService _movieService;

        public MovieController(MovieService movieService)
        {
            _movieService = movieService;
        }

        [HttpGet("movies/trending")]
        public async Task<IActionResult> GetTrendingMovies()
        {
            try
            {
                var movies = await _movieService.GetTrendingMoviesAsync();
                return new OkObjectResult(movies);
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new { error = ex.Message });
            }
        }

        [HttpGet("series/trending")]
        public async Task<IActionResult> GetTrendingSeries()
        {
            try
            {
                var series = await _movieService.GetTrendingSeriesAsync();
                return new OkObjectResult(series);
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new { error = ex.Message });
            }

        }

        [HttpGet("media/search/{query}/{page}")]
        public async Task<IActionResult> GetOnlyMediaByQuery(string query, int page)
        {
            try
            {
                var media = await _movieService.GetOnlyMediaByQueryAsync(query, page);
                return new OkObjectResult(media);
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new { error = ex.Message });
            }
        }
    }
}
