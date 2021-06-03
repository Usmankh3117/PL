using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LemonAPI_Core.Helper
{
    public class UserLeadAllModel
    {
        public string UserId { get; set; }
    }

    public class UserLeadModel
    {
        public int ContactId { get; set; }
    }

    public class UserByDesignationModel
    {
        public string UserId { get; set; }
        public string Designation { get; set; }
    }

    public class UserBySkillModel
    {
        public string UserId { get; set; }
        public int SkillId { get; set; }
    }

    public class UserExistingModel
    {
        public string UserId { get; set; }
        public string ProfileURL { get; set; }
    }

    public class FolderShareModel
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string FolderType { get; set; }
        public string FolderValue { get; set; }
    }
}
