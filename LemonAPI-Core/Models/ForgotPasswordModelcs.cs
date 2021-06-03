using System.ComponentModel.DataAnnotations;

namespace LemonAPI_Core.Models
{
    public class ForgotPasswordModelcs
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; }
    }
}
