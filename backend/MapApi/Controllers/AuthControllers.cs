using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MapApi.Data;
using MapApi.Models;
using BCrypt.Net;

namespace MapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);
        
        if (existingUser != null)
        {
            return BadRequest(new { message = "Пользователь с таким именем уже существует" });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);    

        var user = new User
        {
            Username = request.Username,
            PasswordHash = passwordHash,
            IsConfirmed = true,
            IsOnline = false,
            IsVisible = true,
            LastSeen = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Регистрация успешна", 
            userId = user.UserId,
            username = user.Username
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        User? user = null;
        
        // Поиск по никнейму
        if (!string.IsNullOrEmpty(request.Username))
        {
            user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);
        }
        // Поиск по номеру телефона (упрощённо)
        else if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            // Сначала получаем всех пользователей с заполненным телефоном
            var allUsersWithPhone = await _context.Users
                .Where(u => u.PhoneNumber != null)
                .ToListAsync();
            
            // Очищаем искомый номер от не-цифр
            var cleanSearchPhone = new string(request.PhoneNumber.Where(c => char.IsDigit(c)).ToArray());
            
            // Ищем совпадение в памяти
            user = allUsersWithPhone
                .FirstOrDefault(u => new string(u.PhoneNumber!.Where(c => char.IsDigit(c)).ToArray()) == cleanSearchPhone);
        }
        // Поиск по email
        else if (!string.IsNullOrEmpty(request.Email))
        {
            user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == request.Email.ToLower());
        }
        
        if (user == null)
        {
            return Unauthorized(new { message = "Неверные данные для входа" });
        }

        var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        
        if (!isValidPassword)
        {
            return Unauthorized(new { message = "Неверные данные для входа" });
        }

        user.LastSeen = DateTime.UtcNow;
        user.IsOnline = true;
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Вход выполнен успешно", 
            userId = user.UserId,
            username = user.Username
        });
    }

    // GET: api/auth/user/{id}
    [HttpGet("user/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users
            .Where(u => u.UserId == id)
            .Select(u => new {
                u.UserId,
                u.Username,
                u.IsConfirmed,
                u.LastSeen,
                u.PhoneNumber,
                u.Email,
                u.DeviceName
            })
            .FirstOrDefaultAsync();
        
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        return Ok(user);
    }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string? Username { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty;
}