using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MovieReviewer.Server.Models;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.UI.Services;
using MovieReviewer.Server.Services;
using System.Net;

namespace MovieReviewer.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAccountsController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IEmailSenderService _emailSender;

        public UserAccountsController(UserManager<User> userManager, SignInManager<User> signInManager, IEmailSenderService emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);

                if (existingUser != null)
                {
                    if (!existingUser.EmailConfirmed && existingUser.RegistrationDate.AddHours(24) <= DateTime.UtcNow)
                    {
                        await _userManager.DeleteAsync(existingUser);
                    }
                    else if (!existingUser.EmailConfirmed)
                    {
                        return BadRequest(new
                        {
                            message = "A registration is already pending for this email. Please check your inbox or wait for the link to expire."
                        });
                    }
                    else
                    {
                        return BadRequest(new { message = "User with this email already exists." });
                    }
                }

                var existingNickname = await _userManager.Users.FirstOrDefaultAsync(u => u.Nickname == registerDto.Nickname);

                if (existingNickname != null)
                {
                    if (!existingNickname.EmailConfirmed && existingNickname.RegistrationDate.AddHours(24) <= DateTime.UtcNow)
                    {
                        await _userManager.DeleteAsync(existingNickname);
                    }
                    else
                    {
                        return BadRequest(new { message = "User with this nickname already exists." });
                    }
                }

                var user = new User
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    Nickname = registerDto.Nickname,
                    RegistrationDate = DateTime.UtcNow,
                    EmailConfirmed = false
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
                }

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebUtility.UrlEncode(token);

                // Use correct frontend URL - running on https://localhost:53896
                var frontendUrl = "https://localhost:53896";
                var confirmationLink = $"{frontendUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

                var emailBody = $@"
                <h2>Welcome to PostCredits, {user.Nickname}!</h2>
                <p>Please confirm your account by clicking the link below:</p>
                <p><a href='{confirmationLink}'>Confirm My Email</a></p>";

                await _emailSender.SendEmailAsync(user.Email, "Confirm your PostCredits account", emailBody);

                return Ok(new
                {
                    message = "Registration successful! Please check your email to confirm your account before logging in."
                });
            }
            catch (Exception exception)
            {
                return StatusCode(500, new { message = $"Internal server error: {exception.Message}" });
            }
        }


        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            try
            {
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { message = "Invalid email confirmation link." });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new
                    {
                        message = "Account not found or registration link has expired. Please sign up again."
                    });
                }

                if (user.EmailConfirmed)
                {
                    return Ok(new
                    {
                        message = "Your email is already confirmed. You can log in.",
                        userEmail = user.Email,
                        nickname = user.Nickname
                    });
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);

                if (!result.Succeeded)
                {
                    await _userManager.DeleteAsync(user);

                    return BadRequest(new
                    {
                        message = "Your confirmation link has expired. Your pending account has been removed so you can sign up again."
                    });
                }

                await _signInManager.SignInAsync(user, isPersistent: true);

                return Ok(new { 
                    message = "Email confirmed successfully! You are now logged in.",
                    userEmail = user.Email,
                    nickname = user.Nickname
                });
            }
            catch (Exception exception)
            {
                return StatusCode(500, new { message = $"Internal server error: {exception.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                if (!await _userManager.IsEmailConfirmedAsync(user))
                {
                    return Unauthorized(new { message = "Email is not confirmed. Please check your email for the confirmation link." });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

                if (!result.Succeeded)
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                await _signInManager.SignInAsync(user, isPersistent: true);

                return Ok(new
                {
                    message = "User logged in successfully.",
                    userEmail = user.Email,
                    nickname = user.Nickname
                });
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Internal server error: {exception.Message}");
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);

                if (user == null || !await _userManager.IsEmailConfirmedAsync(user))
                {
                    return Ok(new { message = "If your email is registered and verified, you will receive a reset link shortly." });
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = WebUtility.UrlEncode(token);

                var resetLink = $"https://localhost:53896/reset-password?token={encodedToken}&email={WebUtility.UrlEncode(user.Email)}";

                var emailBody = $@"
                    <h2>Password Reset Request</h2>
                    <p>Hello {user.Nickname},</p>
                    <p>Click the link below to reset your password:</p>
                    <p><a href='{resetLink}'>Reset Password</a></p>
                    <p>If you did not request this, please ignore this email.</p>";

                await _emailSender.SendEmailAsync(user.Email, "Reset your PostCredits password", emailBody);

                return Ok(new { message = "If your email is registered and verified, you will receive a reset link shortly." });

            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Internal server error: {exception.Message}");
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto) 
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

                if (user == null)
                {
                    return BadRequest(new { message = "Invalid password reset request." });
                }

                var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
                }

                await _userManager.UpdateSecurityStampAsync(user);

                await _signInManager.SignOutAsync();

                return Ok(new { message = "Password reset successfully. You can now log in with your new password." });

            } catch (Exception exception)
            {
                return StatusCode(500, new { message = $"Internal server error: {exception.Message}" });
            }
        }



        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                if (User.Identity?.IsAuthenticated == true)
                {
                    var user = await _userManager.GetUserAsync(User);
                    if (user != null)
                    {
                        await _userManager.UpdateSecurityStampAsync(user);
                    }
                }

                await _signInManager.SignOutAsync();

                Response.Cookies.Delete(".AspNetCore.Identity.Application");

                return Ok(new { message = "User logged out successfully." });
            }
            catch (Exception exception)
            {
                return StatusCode(500, new { message = $"Internal server error: {exception.Message}" });
            }
        }

        [HttpGet("check-auth")]
        public async Task<IActionResult> CheckUserAuthentication()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                userEmail = user.Email,
                nickname = user.Nickname
            });
        }



        public record RegisterDto(
            [Required] string Nickname,
            [Required, EmailAddress] string Email,
            [Required, MinLength(6)] string Password
        );

        public record LoginDto(
            [Required, EmailAddress] string Email,
            [Required] string Password
        );

        public record ForgotPasswordDto(
            [Required, EmailAddress] string Email
        );

        public record ResetPasswordDto(
            [Required, EmailAddress] string Email,
            [Required] string Token,
            [Required, MinLength(6)] string NewPassword
        );
    }
}
