using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using MapApi.Models;

namespace MapApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<ChatParticipant> ChatParticipants { get; set; }
    public DbSet<Message> Messages { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.IsConfirmed).HasColumnName("is_confirmed");
            entity.Property(e => e.IsOnline).HasColumnName("is_online");
            entity.Property(e => e.IsVisible).HasColumnName("is_visible");
            entity.Property(e => e.LastSeen).HasColumnName("last_seen");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.PhoneNumber).HasColumnName("phone_number");
            entity.Property(e => e.PhoneVisible).HasColumnName("phone_visible");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.EmailVisible).HasColumnName("email_visible");
            entity.Property(e => e.DeviceName).HasColumnName("device_name");
            entity.Property(e => e.DeviceVisible).HasColumnName("device_visible");
            entity.Property(e => e.Avatar).HasColumnName("avatar");
        });
        
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.ToTable("chats");
            entity.HasKey(e => e.ChatId);
            entity.Property(e => e.ChatId).HasColumnName("chat_id");
            entity.Property(e => e.ChatName).HasColumnName("chat_name");
            entity.Property(e => e.ChatType).HasColumnName("chat_type");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.IsArchived).HasColumnName("is_archived");
            entity.Property(e => e.LastMessageId).HasColumnName("last_message_id");
            
            entity.HasOne(e => e.LastMessage)
                  .WithMany()
                  .HasForeignKey(e => e.LastMessageId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
        
        modelBuilder.Entity<ChatParticipant>(entity =>
        {
            entity.ToTable("chat_participants");
            entity.HasKey(e => new { e.ChatId, e.UserId });
            entity.Property(e => e.ChatId).HasColumnName("chat_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.JoinedAt).HasColumnName("joined_at");
            
            entity.HasOne(e => e.Chat)
                  .WithMany(c => c.Participants)
                  .HasForeignKey(e => e.ChatId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("messages");
            entity.HasKey(e => e.MessageId);
            entity.Property(e => e.MessageId).HasColumnName("message_id");
            entity.Property(e => e.ChatId).HasColumnName("chat_id");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.SentAt).HasColumnName("sent_at");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            
            entity.HasOne(e => e.Chat)
                  .WithMany(c => c.Messages)
                  .HasForeignKey(e => e.ChatId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Sender)
                  .WithMany()
                  .HasForeignKey(e => e.SenderId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}