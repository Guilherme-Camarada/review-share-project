using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace MovieReviewer.Server.Models
{
    public class User : IdentityUser
    {
        [PersonalData]
        [Required]
        [Display(Name = "Nickname")]
        public string Nickname { get; set; } = string.Empty;

        public DateTime RegistrationDate { get; set; }

        /// <summary>True for the fake users created by DevDataSeeder.</summary>
        public bool IsMock { get; set; }
    }
}
