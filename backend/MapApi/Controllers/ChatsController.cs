using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MapApi.Data;
using MapApi.Models;

namespace MapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/chats/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserChats(int userId)
    {
        var chats = await _context.ChatParticipants
            .Where(cp => cp.UserId == userId && !cp.Chat.IsArchived)
            .Include(cp => cp.Chat)
                .ThenInclude(c => c.LastMessage)
            .Include(cp => cp.Chat)
                .ThenInclude(c => c.Participants)
                    .ThenInclude(p => p.User)
            .Select(cp => new
            {
                cp.Chat.ChatId,
                cp.Chat.ChatName,
                cp.Chat.ChatType,
                cp.Chat.Description,
                LastMessage = cp.Chat.LastMessage != null ? cp.Chat.LastMessage.Content : null,
                LastMessageTime = cp.Chat.LastMessage != null ? cp.Chat.LastMessage.SentAt : (DateTime?)null,
                OtherUser = cp.Chat.ChatType == "direct" ? cp.Chat.Participants
                    .Where(p => p.UserId != userId)
                    .Select(p => new { p.User.UserId, p.User.Username, p.User.Avatar })
                    .FirstOrDefault() : null,
                Participants = cp.Chat.ChatType == "group" ? cp.Chat.Participants
                    .Select(p => new { p.User.UserId, p.User.Username, p.User.Avatar, Role = p.Role })
                    .ToList() : null
            })
            .OrderByDescending(c => c.LastMessageTime)
            .ToListAsync();

        return Ok(chats);
    }

    // GET: api/chats/{chatId}/messages
    [HttpGet("{chatId}/messages")]
    public async Task<IActionResult> GetChatMessages(int chatId)
    {
        var messages = await _context.Messages
            .Where(m => m.ChatId == chatId)
            .Include(m => m.Sender)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.MessageId,
                m.ChatId,
                m.SenderId,
                SenderName = m.Sender.Username,
                m.Content,
                m.SentAt,
                m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }

    // POST: api/chats/message
    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var message = new Message
        {
            ChatId = request.ChatId,
            SenderId = request.SenderId,
            Content = request.Content,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var chat = await _context.Chats.FindAsync(request.ChatId);
        if (chat != null)
        {
            chat.LastMessageId = message.MessageId;
            await _context.SaveChangesAsync();
        }

        return Ok(new { messageId = message.MessageId, sentAt = message.SentAt });
    }

    // POST: api/chats/direct
    [HttpPost("direct")]
    public async Task<IActionResult> CreateDirectChat([FromBody] CreateDirectChatRequest request)
    {
        try
        {
            // Проверяем, существует ли уже чат между этими пользователями
            var existingChat = await _context.ChatParticipants
                .Where(cp => cp.UserId == request.UserId1)
                .Select(cp => cp.Chat)
                .Where(c => c.ChatType == "direct")
                .FirstOrDefaultAsync(c => c.Participants.Any(p => p.UserId == request.UserId2));
            
            if (existingChat != null)
            {
                return Ok(new { chatId = existingChat.ChatId, message = "Chat already exists" });
            }
            
            // Создаём новый чат
            var chat = new Chat
            {
                ChatType = "direct",
                CreatedAt = DateTime.UtcNow,
                IsArchived = false
            };
            
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            
            // Добавляем участников
            var participant1 = new ChatParticipant
            {
                ChatId = chat.ChatId,
                UserId = request.UserId1,
                Role = "member",
                JoinedAt = DateTime.UtcNow
            };
            
            var participant2 = new ChatParticipant
            {
                ChatId = chat.ChatId,
                UserId = request.UserId2,
                Role = "member",
                JoinedAt = DateTime.UtcNow
            };
            
            _context.ChatParticipants.Add(participant1);
            _context.ChatParticipants.Add(participant2);
            await _context.SaveChangesAsync();
            
            return Ok(new { chatId = chat.ChatId, message = "Direct chat created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/chats/group
    [HttpPost("group")]
    public async Task<IActionResult> CreateGroupChat([FromBody] CreateGroupChatRequest request)
    {
        try
        {
            // Создаём групповой чат
            var chat = new Chat
            {
                ChatName = request.Name,
                ChatType = "group",
                CreatedAt = DateTime.UtcNow,
                IsArchived = false,
                Description = request.Description ?? ""
            };
            
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            
            // Добавляем участников
            foreach (var userId in request.ParticipantIds)
            {
                var participant = new ChatParticipant
                {
                    ChatId = chat.ChatId,
                    UserId = userId,
                    Role = userId == request.CreatorId ? "admin" : "member",
                    JoinedAt = DateTime.UtcNow
                };
                _context.ChatParticipants.Add(participant);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { chatId = chat.ChatId, message = "Group chat created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

// Модели запросов (должны быть внутри namespace, но вне класса)
public class SendMessageRequest
{
    public int ChatId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class CreateDirectChatRequest
{
    public int UserId1 { get; set; }
    public int UserId2 { get; set; }
}

public class CreateGroupChatRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<int> ParticipantIds { get; set; } = new List<int>();
    public int CreatorId { get; set; }
}