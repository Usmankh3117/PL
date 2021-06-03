using LemonAPI_Core.Helper;
using LemonAPI_Core.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace LemonAPI_Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IConfiguration _configuration;

        public AccountController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            this.userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                if (!await userManager.IsEmailConfirmedAsync(user))
                    return Ok(new Response { Status = false, Message = "It looks like you have not verified your account. Please check your inbox to verify." });

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["JWT:ValidIssuer"],
                    audience: _configuration["JWT:ValidAudience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                    );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    fullName = user.FullName,
                    email = user.Email,
                    id = user.Id,
                    Status = true
                });
            }
            return Ok(new Response { Status = false, Message = "Email or Password is not correct." });
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var userExists = await userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return Ok(new Response { Status = false, Message = "Account already exists with this Email. Please use different email address." });

            ApplicationUser user = new ApplicationUser()
            {
                FullName = model.FirstName,
                CreatedOn = DateTime.Now.Date,
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email
            };
            var result = await userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                string errors = string.Empty;
                foreach (var error in result.Errors)
                    errors += error.Description;
                errors = string.IsNullOrWhiteSpace(errors) ? "Account creation failed! Please check user details and try again." : errors;
                return Ok(new Response { Status = false, Message = errors });
            }
            else
            {
                var appURL = _configuration.GetSection("AppURL").Value;
                string token = await userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = appURL + $"Home/ConfirmEmail?userId={user.Id}&token={HttpUtility.UrlEncode(token)}";

                string Body = "Hi " + model.FirstName + ",<br/><br/>" +
                           "Are you ready to gain access to all of the assets we prepared for you? <br/> Click below to confirm your email address: <br/><br/>" +
                           "<a href =\"" + callbackUrl + "\" style='color: #ffffff;  display: inline-block;text-decoration: none;text-align: center;padding: 1.4rem 4rem;font-size: 1rem;font-weight: 400;font-family: Poppins;background-color: #198DCF;border-color: #198DCF;white-space: nowrap;vertical-align: middle;user-select: none;border: 1px solid transparent;padding: 0.65rem 1rem;font-size: 1rem;line-height: 1.25;border-radius: 0.50rem;'>Verify Now</a><br/><br/><br/>" +
                           "Thank You!<br/>Support Team";

                EmailServicecs emailSerivce = new EmailServicecs(_configuration);
                await emailSerivce.SendEmail(model.Email, Body, "Action Required | Confirm Your Account");
            }

            return Ok(new Response { Status = true, Message = "Account successfully created. Please check your email for verification." });
        }


        [HttpPost]
        [Route("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModelcs model)
        {
            if (ModelState.IsValid)
            {
                var user = await userManager.FindByEmailAsync(model.Email);
                if (user == null)
                    return Ok(new Response { Status = false, Message = "Your account does not exist in our system. Please check your email address." });

                try
                {
                    EmailServicecs emailSerivce = new EmailServicecs(_configuration);

                    var appURL = _configuration.GetSection("AppURL").Value;
                    string token = await userManager.GeneratePasswordResetTokenAsync(user);
                    var callbackUrl = appURL + $"Home/ResetPassword?userId={user.Id}&token={HttpUtility.UrlEncode(token)}";

                    string Body = "Hi " + user.FullName + ",<br/><br/>We received a password reset request for your account.<br/><br/>" +
                                "Please click on the below button to reset your password<br/>" +
                                "<a href =\"" + callbackUrl + "\" style='color: #ffffff;  display: inline-block;text-decoration: none;text-align: center;padding: 1.4rem 4rem;font-size: 1rem;font-weight: 400;font-family: Poppins;background-color: #198DCF;border-color: #198DCF;white-space: nowrap;vertical-align: middle;user-select: none;border: 1px solid transparent;padding: 0.65rem 1rem;font-size: 1rem;line-height: 1.25;border-radius: 0.50rem;' >Reset Your Password</a><br/><br/><br/>Thank You!<br/>Support Team";

                    await emailSerivce.SendEmail(model.Email, Body, "Action Required | Reset Your Password");
                    return Ok(new Response { Status = true, Message = "We've sent a reset link to your email address." });
                }
                catch (Exception ex)
                {
                    return Ok(new Response { Status = false, Message = "Something went wrong on our end" });
                }
            }
            return Ok(new Response { Status = false, Message = "Something went wrong on our end" });
        }
    }
}
