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
}
