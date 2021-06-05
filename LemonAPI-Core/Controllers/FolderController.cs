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

                var allDesignation = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                var designation = allDesignation.Where(a => !string.IsNullOrWhiteSpace(a.Designation)).Select(a => a.Designation.Trim()).Distinct().ToList();

                var allskills = dBContext.Skills.ToList();
                var allContactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();
                var contactSkills = allContactSkills.Where(a => allDesignation.Select(a => a.Id).Contains(a.ContactId)).Select(a => a.SkillId).ToList();
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
                var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsShared == false && a.IsDelete == false && a.Designation != null && a.Designation.ToLower().Trim() == designation.Trim().ToLower()).ToList();

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
                var allleads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();

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

        [HttpPost]
        [Route("DeleteFolders")]
        public IActionResult DeleteFolders([FromBody] DelteFolderbySkillDesignation model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                if (model.Designations.Count > 0)
                {
                    var allSkils = dBContext.ContactSkill.Where(a => a.UserId == model.UserId);
                    foreach (var item in model.Designations)
                    {
                        string designation = System.Web.HttpUtility.UrlDecode(item);
                        var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsShared == false && a.IsDelete == false && a.Designation != null && a.Designation.ToLower().Trim() == designation.Trim().ToLower()).ToList();
                        if (leads != null)
                        {
                            leads.ForEach(a => a.IsDelete = true);
                            dBContext.SaveChanges();

                            foreach (var lead in leads)
                            {
                                var contactSkill = allSkils.Where(a => a.ContactId == lead.Id).ToList();
                                if (contactSkill.Any())
                                {
                                    foreach (var skill in contactSkill)
                                    {
                                        skill.IsDelete = true;
                                        dBContext.SaveChanges();
                                    }
                                }
                            }
                        }
                    }
                }

                if (model.Skills.Count > 0)
                {
                    var allContacts = dBContext.Contact.Where(a => a.UserId == model.UserId);
                    var contactsSkill = dBContext.ContactSkill.Where(a => a.IsDelete == false && a.UserId == model.UserId).ToList();
                    if (contactsSkill.Any())
                    {
                        contactsSkill = contactsSkill.Where(a => model.Skills.Contains(a.SkillId)).ToList();
                        contactsSkill.ForEach(a => a.IsDelete = true);
                        dBContext.SaveChanges();

                        foreach (var contact in contactsSkill.Select(a => a.ContactId).Distinct().ToList())
                        {
                            var singleContact = allContacts.FirstOrDefault(a => a.Id == contact);
                            if (singleContact != null)
                            {
                                singleContact.IsDelete = true;
                                dBContext.SaveChanges();
                            }
                        }
                    }
                }
                return Ok(new { Status = true, Message = "Success" });
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("ShareFolders")]
        public async Task<IActionResult> ShareFolders([FromBody] ShareFoldersbySkillDesignation model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId) && !string.IsNullOrWhiteSpace(model.Email))
            {
                var shareduser = await userManager.FindByEmailAsync(model.Email);
                if (shareduser == null)
                    return Ok(new { Status = false, Message = "User not found." });

                if (shareduser.Id == model.UserId)
                    return Ok(new { Status = false, Message = "You can't share with yourself." });

                var contactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();

                if (model.Designations.Count > 0)
                {
                    for (int i = 0; i < model.Designations.Count; i++)
                        model.Designations[i] = Convert.ToString(System.Web.HttpUtility.UrlDecode(model.Designations[i]).ToLower().Trim());

                    var allDesignation = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                    var designationContact = allDesignation.Where(a => !string.IsNullOrWhiteSpace(a.Designation) && model.Designations.Contains(a.Designation.ToLower().Trim())).ToList();

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
                }

                if (model.Skills.Count > 0)
                {
                    var allContactSkill = dBContext.ContactSkill.Where(a => a.IsDelete == false && a.UserId == model.UserId).ToList();
                    var contactsSkill = allContactSkill.Where(a => model.Skills.Contains(a.SkillId)).Select(a => a.ContactId).ToList();

                    var allleads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == false).ToList();
                    var leads = allleads.Where(a => contactsSkill.Contains(a.Id)).ToList();

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
                }
                return Ok(new { Status = true, Message = "Folder successfully shared." });
            }
            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("GetSharedFolders")]
        public IActionResult GetSharedFolders([FromBody] UserLeadAllModel model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsDelete == false && a.IsShared == true).ToList();

                SharedFolderRespone sharedFolderRespone = new SharedFolderRespone();
                List<SharedDesignation> lstSharedDesignation = new List<SharedDesignation>();
                List<SharedSkill> lstSharedSkill = new List<SharedSkill>();

                foreach (var item in leads.Select(a => a.Designation).Distinct().ToList())
                {
                    SharedDesignation sharedDesignation = new SharedDesignation();
                    sharedDesignation.Designation = item;
                    sharedDesignation.DesignationContact = leads.Where(a => a.Designation == item).ToList();
                    lstSharedDesignation.Add(sharedDesignation);
                }

                var allContactSkills = dBContext.ContactSkill.Where(a => a.UserId == model.UserId && a.IsDelete == false).ToList();
                var contactSkills = allContactSkills.Where(a => leads.Select(a => a.Id).Contains(a.ContactId)).ToList();

                var allSkills = dBContext.Skills.ToList();
                foreach (var item in contactSkills.Select(a => a.SkillId).Distinct().ToList())
                {
                    SharedSkill sharedSkill = new SharedSkill();
                    sharedSkill.SkillId = allSkills.FirstOrDefault(a => a.Id == item).Id;
                    sharedSkill.Skill = allSkills.FirstOrDefault(a => a.Id == item).Name;
                    var contactsSkill = allContactSkills.Where(a => a.SkillId == item).Select(a => a.ContactId).ToList();
                    var skillLeads = leads.Where(a => contactsSkill.Contains(a.Id)).ToList();
                    sharedSkill.SkillContact = skillLeads;
                    lstSharedSkill.Add(sharedSkill);
                }

                sharedFolderRespone.sharedDesignation = lstSharedDesignation;
                sharedFolderRespone.sharedSkill = lstSharedSkill;
                return Ok(new { Status = true, Message = "Success", Data = sharedFolderRespone });
            }

            return Ok(new { Status = false, Message = "Error" });
        }

        [HttpPost]
        [Route("DeleteFolderByType")]
        public IActionResult DeleteFolderByType([FromBody] DelteFolderbyType model)
        {
            if (!string.IsNullOrWhiteSpace(model.UserId))
            {
                if (!string.IsNullOrWhiteSpace(model.FolderType) && !string.IsNullOrWhiteSpace(model.FolderValue))
                {
                    if (model.FolderType.ToLower().Trim() == "designation")
                    {
                        string designation = System.Web.HttpUtility.UrlDecode(model.FolderValue);

                        var allSkils = dBContext.ContactSkill.Where(a => a.UserId == model.UserId);
                        var leads = dBContext.Contact.Where(a => a.UserId == model.UserId && a.IsShared == false && a.IsDelete == false && a.Designation != null && a.Designation.ToLower().Trim() == designation.Trim().ToLower()).ToList();
                        if (leads != null)
                        {
                            leads.ForEach(a => a.IsDelete = true);
                            dBContext.SaveChanges();

                            foreach (var lead in leads)
                            {
                                var contactSkill = allSkils.Where(a => a.ContactId == lead.Id).ToList();
                                if (contactSkill.Any())
                                {
                                    foreach (var skill in contactSkill)
                                    {
                                        skill.IsDelete = true;
                                        dBContext.SaveChanges();
                                    }
                                }
                            }
                        }
                    }
                    if (model.FolderType.ToLower().Trim() == "skill")
                    {
                        int skillId = Convert.ToInt32(model.FolderValue);

                        var allContacts = dBContext.Contact.Where(a => a.UserId == model.UserId);
                        var contactsSkill = dBContext.ContactSkill.Where(a => a.IsDelete == false && a.UserId == model.UserId).ToList();
                        if (contactsSkill.Any())
                        {
                            contactsSkill = contactsSkill.Where(a => a.SkillId == skillId).ToList();
                            contactsSkill.ForEach(a => a.IsDelete = true);
                            dBContext.SaveChanges();

                            foreach (var contact in contactsSkill.Select(a => a.ContactId).Distinct().ToList())
                            {
                                var singleContact = allContacts.FirstOrDefault(a => a.Id == contact);
                                if (singleContact != null)
                                {
                                    singleContact.IsDelete = true;
                                    dBContext.SaveChanges();
                                }
                            }
                        }
                    }
                }
                return Ok(new { Status = true, Message = "Success" });
            }
            return Ok(new { Status = false, Message = "Error" });
        }
    }
}
