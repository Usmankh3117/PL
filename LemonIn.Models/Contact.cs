using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LemonIn.Models
{
    public class Contact
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Company { get; set; }
        public string Designation { get; set; }
        public string ProfileImageURL { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileURL { get; set; }
        public string Address { get; set; }
        public string TotalExperince { get; set; }
        public string SocialLinks { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsDelete { get; set; }
        public bool IsShared { get; set; }
    }
}
