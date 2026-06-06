using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MapApi.Data;
using MapApi.Models;
using NetTopologySuite.Geometries;
using System.Text.RegularExpressions;

namespace MapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new {
                u.UserId,
                u.Username,
                u.Avatar
            })
            .ToListAsync();
        
        return Ok(users);
    }

    // GET: api/users/{id}
    [HttpGet("{id}")]
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
                u.PhoneVisible,
                u.Email,
                u.EmailVisible,
                u.DeviceName,
                u.DeviceVisible,
                u.Avatar
            })
            .FirstOrDefaultAsync();
        
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        return Ok(user);
    }

    // PUT: api/users/{id}/phone
    [HttpPut("{id}/phone")]
    public async Task<IActionResult> UpdatePhone(int id, [FromBody] PhoneUpdateRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        user.PhoneNumber = request.PhoneNumber;
        user.PhoneVisible = request.PhoneVisible;
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Номер телефона обновлён" });
    }

    // PUT: api/users/{id}/email
    [HttpPut("{id}/email")]
    public async Task<IActionResult> UpdateEmail(int id, [FromBody] EmailUpdateRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        user.Email = request.Email;
        user.EmailVisible = request.EmailVisible;
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Email обновлён" });
    }

    // PUT: api/users/{id}/device
    [HttpPut("{id}/device")]
    public async Task<IActionResult> UpdateDevice(int id, [FromBody] DeviceUpdateRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        user.DeviceName = request.DeviceName;
        user.DeviceVisible = request.DeviceVisible;
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Название устройства обновлено" });
    }

    // PUT: api/users/{id}/avatar
    [HttpPut("{id}/avatar")]
    public async Task<IActionResult> UpdateAvatar(int id, [FromBody] AvatarUpdateRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });
        
        user.Avatar = request.Avatar;
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Аватар обновлён" });
    }
}

public class PhoneUpdateRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public bool PhoneVisible { get; set; } = true;
}

public class EmailUpdateRequest
{
    public string Email { get; set; } = string.Empty;
    public bool EmailVisible { get; set; } = true;
}

public class DeviceUpdateRequest
{
    public string DeviceName { get; set; } = string.Empty;
    public bool DeviceVisible { get; set; } = true;
}

public class AvatarUpdateRequest
{
    public string Avatar { get; set; } = string.Empty;
}