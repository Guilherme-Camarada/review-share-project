using Microsoft.AspNetCore.Mvc;
using MovieReviewer.Server.Services;

namespace MovieReviewer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailSenderController
    {
        private readonly IEmailSenderService _emailSenderService;

        public EmailSenderController(IEmailSenderService emailSenderService)
        {
            _emailSenderService = emailSenderService;
        }

        [HttpPost("send-email")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequest emailRequest)
        {
            try
            {
                await _emailSenderService.SendEmailAsync(emailRequest.ToEmail, emailRequest.Subject, emailRequest.Body);
                return new OkObjectResult(new { message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(new { error = ex.Message });
            }

        }

        public record EmailRequest(string ToEmail, string Subject, string Body);
    }
}
