using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MapApi.Models;

[Table("chats")]
public class Chat
{
    [Key]
    [Column("chat_id")]
    public int ChatId { get; set; }
    
    [Column("chat_name")]
    public string? ChatName { get; set; }
    
    [Column("chat_type")]
    public string ChatType { get; set; } = "direct"; // direct, group
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("is_archived")]
    public bool IsArchived { get; set; } = false;
    
    [Column("last_message_id")]
    public int? LastMessageId { get; set; }

    [Column("description")]
    public string? Description { get; set; }
    
    // Навигационные свойства
    [ForeignKey("LastMessageId")]
    public virtual Message? LastMessage { get; set; }
    
    public virtual ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}