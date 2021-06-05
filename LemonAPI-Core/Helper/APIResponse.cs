using LemonIn.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LemonAPI_Core.Helper
{
    public class LeadResult
    {
        public Contact contact { get; set; }
        public List<string> skill { get; set; }
    }

    public class FolderResult
    {
        public List<string> Designation { get; set; }
        public List<Skill> Skill { get; set; }
    }
    public class Skill
    {
        public int SkillId { get; set; }
        public string SkillName { get; set; }
    }

    public class SharedFolderRespone
    {
        public List<SharedDesignation> sharedDesignation { get; set; }
        public List<SharedSkill> sharedSkill { get; set; }
    }

    public class SharedDesignation
    {
        public string Designation { get; set; }
        public List<Contact> DesignationContact { get; set; }
    }

    public class SharedSkill
    {
        public string Skill { get; set; }
        public int SkillId { get; set; }
        public List<Contact> SkillContact { get; set; }
    }
}
