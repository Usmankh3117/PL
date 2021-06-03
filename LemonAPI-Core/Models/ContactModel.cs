using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace LemonAPI_Core.Models
{
    public class ContactModel
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        public string Company { get; set; }
        public string Designation { get; set; }
        public string ProfileImageURL { get; set; }
        [Required]
        public string UserProfileURL { get; set; }
        public string UserEmail { get; set; }
        public string UserPhone { get; set; }
        public string Address { get; set; }
        public string TotalExperince { get; set; }
        public string[] SocialLinks { get; set; }
        public string[] UserSkills { get; set; }

    }
}
