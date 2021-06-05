using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LemonAPI_Core.Helper;
using LemonAPI_Core.Models;
using LemonIn.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace LemonAPI_Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext dBContext;

        public UserController(ApplicationDbContext dbContext)
        {
            dBContext = dbContext;
        }


        [HttpPost]
        [Route("Create")]
        public async Task<IActionResult> Create([FromBody] ContactModel model)
        {
            if (ModelState.IsValid)
            {
                if (!dBContext.Contact.Where(a => a.ProfileURL.ToLower().Trim() == model.UserProfileURL.ToLower().Trim() && a.IsDelete == false && a.UserId == model.UserId).Any())
                {
                    Contact contact = new Contact();
                    contact.UserId = model.UserId;
                    contact.FirstName = model.FirstName;
                    contact.LastName = model.LastName;
                    contact.Company = model.Company;
                    contact.Designation = model.Designation;
                    contact.ProfileImageURL = model.ProfileImageURL;
                    contact.Email = model.UserEmail;
                    contact.PhoneNumber = model.UserPhone;
                    contact.ProfileURL = model.UserProfileURL;
                    contact.Address = model.Address;
                    contact.TotalExperince = model.TotalExperince;
                    contact.SocialLinks = model.SocialLinks != null && model.SocialLinks.Length > 0 ? string.Join(",", model.SocialLinks) : "";
                    contact.CreatedDate = DateTime.Now;
                    contact.ModifiedDate = DateTime.Now;
                    contact.IsDelete = false;
                    contact.IsShared = false;
                    dBContext.Contact.Add(contact);
                    dBContext.SaveChanges();

                    if (contact.Id > 0)
                    {
                        if (model.UserSkills != null)
                        {
                            var allSkills = dBContext.Skills.ToList();

                            foreach (var skill in model.UserSkills)
                            {
                                int skillId = 0;
                                if (allSkills.Where(a => a.Name.ToLower() == skill.ToLower().Trim()).Any())
                                    skillId = allSkills.FirstOrDefault(a => a.Name.ToLower() == skill.ToLower().Trim()).Id;
                                else
                                {
                                    Skills skills = new Skills();
                                    skills.Name = skill;
                                    skills.CreatedDate = DateTime.Now;
                                    skills.ModifiedDate = DateTime.Now;
                                    dBContext.Skills.Add(skills);
                                    dBContext.SaveChanges();
                                    skillId = skills.Id;
                                }
                                ContactSkill contactSkill = new ContactSkill();
                                contactSkill.IsDelete = false;
                                contactSkill.UserId = model.UserId;
                                contactSkill.ContactId = contact.Id;
                                contactSkill.SkillId = skillId;
                                contactSkill.CreatedDate = DateTime.Now;
                                contactSkill.ModifiedDate = DateTime.Now;
                                dBContext.ContactSkill.Add(contactSkill);
                                dBContext.SaveChanges();
                            }
                        }
                        return Ok(new { Status = true, Message = "User details successfully saved.", Id = contact.Id });
                    }
                }
                else
                    return Ok(new Response { Status = false, Message = "Already Exists." });
            }
            else
            {
                string errors = string.Join(",", ModelState.Values.SelectMany(state => state.Errors).Select(error => error.ErrorMessage));
                return Ok(new Response { Status = false, Message = errors });
            }
            return Ok(new Response { Status = false, Message = "Something went wrong." });
        }

        [HttpPost]
        [Route("GetAllLeadByUser")]
        public IActionResult GetAllLeadByUser([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                return Ok(new { Status = true, Message = "Success", Data = leads });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("GetAllSharedLeadByUser")]
        public IActionResult GetAllSharedLeadByUser([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == true).ToList();
                return Ok(new { Status = true, Message = "Success", Data = leads });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("GetLeadById")]
        public IActionResult GetLeadById([FromBody] UserLeadModel model)
        {
            LeadResult leadResult = new LeadResult();

            if (!string.IsNullOrWhiteSpace(Convert.ToString(model.ContactId)))
            {
                var lead = dBContext.Contact.FirstOrDefault(a => a.Id == model.ContactId);
                if (lead != null)
                {
                    List<string> lstSkills = new List<string>();
                    var contactSkill = dBContext.ContactSkill.Where(a => a.ContactId == lead.Id).ToList();
                    if (contactSkill.Any())
                    {
                        var allskills = dBContext.Skills.ToList();
                        foreach (var item in contactSkill)
                            lstSkills.Add(allskills.FirstOrDefault(a => a.Id == item.SkillId).Name);
                    }
                    leadResult.contact = lead;
                    leadResult.skill = lstSkills;
                    return Ok(new { Status = true, Message = "Success", Data = leadResult });
                }
                else
                {
                    leadResult.contact = null;
                    return Ok(new { Status = false, Message = "Not Found", Data = leadResult });
                }
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("DeleteLeadById")]
        public IActionResult DeleteLeadById([FromBody] UserLeadModel model)
        {
            if (!string.IsNullOrWhiteSpace(Convert.ToString(model.ContactId)))
            {
                var lead = dBContext.Contact.FirstOrDefault(a => a.Id == model.ContactId);
                if (lead != null)
                {
                    lead.IsDelete = true;
                    dBContext.SaveChanges();
                    var contactSkill = dBContext.ContactSkill.Where(a => a.ContactId == lead.Id).ToList();
                    if (contactSkill.Any())
                    {
                        foreach (var item in contactSkill)
                        {
                            item.IsDelete = true;
                            dBContext.SaveChanges();
                        }
                    }
                    return Ok(new { Status = true, Message = "Success" });
                }
                else
                {
                    return Ok(new { Status = false, Message = "Not Found" });
                }
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("DeleteLeadByUser")]
        public IActionResult DeleteLeadByUser([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(Convert.ToString(model.UserId)))
            {
                var alllead = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                if (alllead != null)
                {
                    alllead.ForEach(a => a.IsDelete = true);
                    dBContext.SaveChanges();

                    foreach (var lead in alllead)
                    {
                        var contactSkill = dBContext.ContactSkill.Where(a => a.ContactId == lead.Id).ToList();
                        if (contactSkill.Any())
                        {
                            foreach (var item in contactSkill)
                            {
                                item.IsDelete = true;
                                dBContext.SaveChanges();
                            }
                        }
                    }
                    return Ok(new { Status = true, Message = "Success" });
                }
                else
                {
                    return Ok(new { Status = false, Message = "Not Found" });
                }
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("DeleteSharedLeadByUser")]
        public IActionResult DeleteSharedLeadByUser([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(Convert.ToString(model.UserId)))
            {
                var alllead = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == true).ToList();
                if (alllead != null)
                {
                    alllead.ForEach(a => a.IsDelete = true);
                    dBContext.SaveChanges();

                    foreach (var lead in alllead)
                    {
                        var contactSkill = dBContext.ContactSkill.Where(a => a.ContactId == lead.Id).ToList();
                        if (contactSkill.Any())
                        {
                            foreach (var item in contactSkill)
                            {
                                item.IsDelete = true;
                                dBContext.SaveChanges();
                            }
                        }
                    }
                    return Ok(new { Status = true, Message = "Success" });
                }
                else
                {
                    return Ok(new { Status = false, Message = "Not Found" });
                }
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("CheckUserExists")]
        public IActionResult CheckUserExists([FromBody] UserExistingModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.ProfileURL))
            {
                var isExists = dBContext.Contact.Any(a => a.UserId == model.UserId && a.ProfileURL.ToLower().Trim() == model.ProfileURL.ToLower().Trim() && a.IsDelete == false);
                return Ok(new { Status = true, Message = "Success", Data = isExists });
            }

            return Ok(new { Status = false, Message = "Error" });
        }
    }
}
