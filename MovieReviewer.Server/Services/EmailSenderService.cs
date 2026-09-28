using System.Net;
using System.Net.Mail;

namespace MovieReviewer.Server.Services
{
    public class EmailSenderService : IEmailSenderService
    {
        private readonly IConfiguration _configuration;
        private readonly string _host;
        private readonly string _port;
        private readonly string _username;
        private readonly string _password;
        private readonly string _fromName;


        public EmailSenderService(HttpClient httpClient, IConfiguration configuration)
        {
            _configuration = configuration;

            _host = _configuration["EmailSettings:Host"] ?? throw new InvalidOperationException("Email service host is missing from configuration.");
            _port = _configuration["EmailSettings:Port"] ?? throw new InvalidOperationException("Email service port is missing from configuration.");
            _username = _configuration["EmailSettings:Username"] ?? throw new InvalidOperationException("Email service username is missing from configuration.");
            _password = _configuration["EmailSettings:Password"] ?? throw new InvalidOperationException("Email service password is missing from configuration.");
            _fromName = _configuration["EmailSettings:FromName"] ?? throw new InvalidOperationException("From name is missing from configuration.");
        }


        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var client = new SmtpClient(_host, int.Parse(_port))
            {
                Credentials = new NetworkCredential(_username, _password),
                EnableSsl = true
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_username, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }
            
    }
}
