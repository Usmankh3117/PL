using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LemonAPI_Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace LemonAPI_Core.Controllers
{
    public class HomeController : Controller
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IConfiguration _configuration;

        public HomeController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            this.userManager = userManager;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (userId == null || token == null)
            {
                ViewBag.errorMessage = "This looks like not a valid link. Please check your email for the correct link.";
                return View();
            }

            try
            {
                var users = await userManager.FindByIdAsync(userId);
                if (users != null)
                {
                    var result = await userManager.ConfirmEmailAsync(users, token);
                    if (result.Succeeded)
                    {
                        ViewBag.successMessage = "Confirm email successfully.";
                        return View();
                    }
                    else
                    {
                        ViewBag.errorMessage = "ConfirmEmail failed";
                        return View();
                    }
                }
            }
            catch (InvalidOperationException ioe)
            {
                if (ioe.Message == "UserId not found.")
                    ViewBag.errorMessage = "This looks like not a valid link. Please check your email for the correct link.";
                else
                    ViewBag.errorMessage = ioe.Message;
                return View();
            }

            ViewBag.errorMessage = "ConfirmEmail failed";
            return View("Error");
        }

        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(string userId, string token)
        {
            ResetPasswordModel model = new ResetPasswordModel()
            {
                Token = token,
                UserId = userId
            };
            return await Task.Run(() => View(model));
        }

        [AllowAnonymous, HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordModel model)
        {
            if (ModelState.IsValid)
            {
                model.Token = model.Token.Replace(' ', '+');
                var user = await userManager.FindByIdAsync(model.UserId);
                if (user != null)
                {
                    var result = await userManager.ResetPasswordAsync(user, model.Token, model.Password);
                    if (result.Succeeded)
                    {
                        ModelState.Clear();
                        model.IsSuccess = true;
                        return View(model);
                    }
                    else if (result?.Errors?.Count() > 0)
                    {
                        foreach (var error in result.Errors)
                        {
                            ModelState.AddModelError("", error.Description);
                        }
                    }
                }
            }
            return await Task.Run(() => View(model));
        }
    }
}
