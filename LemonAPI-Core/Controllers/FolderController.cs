using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LemonAPI_Core.Helper;
using LemonAPI_Core.Models;
using LemonIn.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LemonAPI_Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FolderController : ControllerBase
    {
        private readonly ApplicationDbContext dBContext;
        private readonly UserManager<ApplicationUser> userManager;

        public FolderController(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
        {
            dBContext = dbContext;
            this.userManager = userManager;
        }

        [HttpPost]
        [Route("GetFolderList")]
        public IActionResult GetFolderList([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                FolderResult result = new FolderResult();

                var allDesignation = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();
                var designation = allDesignation.Where(a => !string.IsNullOrWhiteSpace(a.Designation)).Select(a => a.Designation.Trim()).Distinct().ToList();

                var allskills = dBContext.Skills.ToList();
                var contactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).Select(a => a.SkillId).ToList();
                var skills = allskills.Where(a => contactSkills.Contains(a.Id)).Select(a => new Skill { SkillId = a.Id, SkillName = a.Name }).ToList();

                result.Designation = designation;
                result.Skill = skills;

                return Ok(new { Status = true, Message = "Success", Data = result });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("GetuserByDesignation")]
        public IActionResult GetuserByDesignation([FromBody] UserByDesignationModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId) && !string.IsNullOrWhiteSpace(model.Designation))
            {
                string designation = System.Web.HttpUtility.UrlDecode(model.Designation);
                var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.Designation != null && a.Designation.ToLower().Trim() == designation.Trim().ToLower()).ToList();

                return Ok(new { Status = true, Message = "Success", Data = leads });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("GetuserBySkill")]
        public IActionResult GetuserBySkill([FromBody] UserBySkillModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId) && !string.IsNullOrWhiteSpace(Convert.ToString(model.SkillId)))
            {
                var contactsSkill = dBContext.ContactSkill.Where(a => a.IsDelete == false && a.UserId == model.UserId && a.SkillId == model.SkillId).Select(a => a.ContactId).ToList();
                var allleads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();

                var leads = allleads.Where(a => contactsSkill.Contains(a.Id)).ToList();

                return Ok(new { Status = true, Message = "Success", Data = leads });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("ShareUserFolder")]
        public async Task<IActionResult> ShareUserFolder([FromBody] FolderShareModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId) && !string.IsNullOrWhiteSpace(model.Email))
            {
                var shareduser = await userManager.FindByEmailAsync(model.Email);
                if (shareduser == null)
                    return Ok(new { Status = false, Message = "User not found." });

                if (shareduser.Id == model.UserId)
                    return Ok(new { Status = false, Message = "You can't share with yourself." });

                if (!string.IsNullOrWhiteSpace(model.FolderType) && model.FolderType.ToLower().Trim() == "designation")
                {
                    string designation = System.Web.HttpUtility.UrlDecode(model.FolderValue);
                    var allDesignation = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                    var designationContact = allDesignation.Where(a => !string.IsNullOrWhiteSpace(a.Designation) && a.Designation.ToLower().Trim() == designation.ToLower().Trim()).ToList();

                    var contactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();

                    foreach (var item in designationContact)
                    {
                        if (!dBContext.Contact.Where(a => a.ProfileURL.ToLower().Trim() == item.ProfileURL.ToLower().Trim() && a.IsDelete == false && a.UserId == shareduser.Id).Any())
                        {
                            Contact contact = new Contact();
                            contact.UserId = shareduser.Id;
                            contact.FirstName = item.FirstName;
                            contact.LastName = item.LastName;
                            contact.Company = item.Company;
                            contact.Designation = item.Designation;
                            contact.ProfileImageURL = item.ProfileImageURL;
                            contact.Email = item.Email;
                            contact.PhoneNumber = item.PhoneNumber;
                            contact.ProfileURL = item.ProfileURL;
                            contact.Address = item.Address;
                            contact.TotalExperince = item.TotalExperince;
                            contact.SocialLinks = item.SocialLinks;
                            contact.CreatedDate = DateTime.Now;
                            contact.ModifiedDate = DateTime.Now;
                            contact.IsDelete = false;
                            contact.IsShared = true;
                            dBContext.Contact.Add(contact);
                            dBContext.SaveChanges();

                            if (contact.Id > 0)
                            {
                                if (contactSkills.Any(a => a.ContactId == item.Id))
                                {
                                    foreach (var skill in contactSkills.Where(a => a.ContactId == item.Id).ToList())
                                    {
                                        ContactSkill contactSkill = new ContactSkill();
                                        contactSkill.IsDelete = false;
                                        contactSkill.UserId = shareduser.Id;
                                        contactSkill.ContactId = contact.Id;
                                        contactSkill.SkillId = skill.SkillId;
                                        contactSkill.CreatedDate = DateTime.Now;
                                        contactSkill.ModifiedDate = DateTime.Now;
                                        dBContext.ContactSkill.Add(contactSkill);
                                        dBContext.SaveChanges();
                                    }
                                }
                            }
                        }
                    }
                    return Ok(new { Status = true, Message = "Folder successfully shared." });
                }
                else if (!string.IsNullOrWhiteSpace(model.FolderType) && model.FolderType.ToLower().Trim() == "skill")
                {
                    int skillId = string.IsNullOrWhiteSpace(model.FolderValue) ? 0 : Convert.ToInt32(model.FolderValue);
                    if (skillId > 0)
                    {
                        var contactsSkill = dBContext.ContactSkill.Where(a => a.IsDelete == false && a.UserId == model.UserId && a.SkillId == skillId).Select(a => a.ContactId).ToList();
                        var allleads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                        var leads = allleads.Where(a => contactsSkill.Contains(a.Id)).ToList();

                        var contactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();

                        foreach (var item in leads)
                        {
                            if (!dBContext.Contact.Where(a => a.ProfileURL.ToLower().Trim() == item.ProfileURL.ToLower().Trim() && a.IsDelete == false && a.UserId == shareduser.Id).Any())
                            {
                                Contact contact = new Contact();
                                contact.UserId = shareduser.Id;
                                contact.FirstName = item.FirstName;
                                contact.LastName = item.LastName;
                                contact.Company = item.Company;
                                contact.Designation = item.Designation;
                                contact.ProfileImageURL = item.ProfileImageURL;
                                contact.Email = item.Email;
                                contact.PhoneNumber = item.PhoneNumber;
                                contact.ProfileURL = item.ProfileURL;
                                contact.Address = item.Address;
                                contact.TotalExperince = item.TotalExperince;
                                contact.SocialLinks = item.SocialLinks;
                                contact.CreatedDate = DateTime.Now;
                                contact.ModifiedDate = DateTime.Now;
                                contact.IsDelete = false;
                                contact.IsShared = true;
                                dBContext.Contact.Add(contact);
                                dBContext.SaveChanges();

                                if (contact.Id > 0)
                                {
                                    if (contactSkills.Any(a => a.ContactId == item.Id))
                                    {
                                        foreach (var skill in contactSkills.Where(a => a.ContactId == item.Id).ToList())
                                        {
                                            ContactSkill contactSkill = new ContactSkill();
                                            contactSkill.IsDelete = false;
                                            contactSkill.UserId = shareduser.Id;
                                            contactSkill.ContactId = contact.Id;
                                            contactSkill.SkillId = skill.SkillId;
                                            contactSkill.CreatedDate = DateTime.Now;
                                            contactSkill.ModifiedDate = DateTime.Now;
                                            dBContext.ContactSkill.Add(contactSkill);
                                            dBContext.SaveChanges();
                                        }
                                    }
                                }
                            }
                        }
                        return Ok(new { Status = true, Message = "Folder successfully shared." });
                    }
                }
            }
            return Ok(new { Status = false, Message = "Error" });
        }
    }
}
