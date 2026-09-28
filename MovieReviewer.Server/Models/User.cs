using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.Runtime;

namespace MovieReviewer.Server.Models
{
    public class User : IdentityUser
    {
        [PersonalData]
        [Required]
        [Display(Name = "Nickname")]
        public string Nickname { get; set; }
        public DateTime RegistrationDate { get; set; }
    }
}
