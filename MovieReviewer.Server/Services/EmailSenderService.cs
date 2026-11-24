using System.Net;
using System.Net.Mail;

namespace MovieReviewer.Server.Services
{
    public class EmailSenderService(IConfiguration configuration) : IEmailSenderService
    {
        private readonly IConfigurationSection _settings = configuration.GetSection("EmailSettings");

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var username = Require("Username");

            using var client = new SmtpClient(Require("Host"), int.Parse(Require("Port")))
            {
                Credentials = new NetworkCredential(username, Require("Password")),
                EnableSsl = true
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(username, Require("FromName")),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }

        private string Require(string key) =>
            _settings[key] ?? throw new InvalidOperationException($"EmailSettings:{key} is missing from configuration.");
    }
}
