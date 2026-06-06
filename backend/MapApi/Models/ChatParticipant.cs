using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MapApi.Models;

[Table("chat_participants")]
public class ChatParticipant
{
    [Key]
    [Column("chat_id")]
    public int ChatId { get; set; }
    
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Column("role")]
    public string Role { get; set; } = "member";
    
    [Column("joined_at")]
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Навигационные свойства
    [ForeignKey("ChatId")]
    public virtual Chat? Chat { get; set; }
    
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}