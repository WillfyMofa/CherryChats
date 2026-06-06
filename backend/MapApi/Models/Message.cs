using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MapApi.Models;

[Table("messages")]
public class Message
{
    [Key]
    [Column("message_id")]
    public int MessageId { get; set; }
    
    [Column("chat_id")]
    public int ChatId { get; set; }
    
    [Column("sender_id")]
    public int SenderId { get; set; }
    
    [Column("content")]
    public string Content { get; set; } = string.Empty;
    
    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    
    [Column("is_read")]
    public bool IsRead { get; set; } = false;
    
    [ForeignKey("ChatId")]
    public virtual Chat? Chat { get; set; }
    
    [ForeignKey("SenderId")]
    public virtual User? Sender { get; set; }
}