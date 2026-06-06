using NetTopologySuite.Geometries;

namespace MapApi.Models;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // Новая колонка
    public bool IsConfirmed { get; set; }
    public bool IsOnline { get; set; }
    public bool IsVisible { get; set; }
    public DateTime? LastSeen { get; set; }
    public Point? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public bool PhoneVisible { get; set; } = true;
    public string? Email { get; set; }
    public bool EmailVisible { get; set; } = true;
    public string? DeviceName { get; set; }
    public bool DeviceVisible { get; set; } = true;
    public string? Avatar { get; set; } = "cherry-chan-hi";
}