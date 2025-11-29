using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);

    }

    public async Task<Message?> GetMessage(string messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParams)
    {
        var query = context.Messages
            .OrderByDescending(m => m.MessageSent)
            .AsQueryable();
        query = messageParams.Container switch
        {
            "Outbox" => query.Where(m => m.SenderId == messageParams.MemberId && !m.SenderDeleted),
            _ => query.Where(m => m.RecipientId == messageParams.MemberId && !m.RecipientDeleted)
        };
        var messageQuery = query.Select(MessageExtensions.ToDtoProjection());
        return await PaginationHelper.CreateAsync(messageQuery,
            messageParams.pageNumber, messageParams.PageSize);
    }

    public async Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId)
    {
        await context.Messages
            .Where(x => x.RecipientId == currentMemberId 
                && x.SenderId == recipientId && x.DateRead == null)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.DateRead, DateTime.UtcNow));
                
        return await context.Messages
            .Where(x => (x.RecipientId == currentMemberId && x.SenderId == recipientId 
                && !x.RecipientDeleted)
                || (x.SenderId == currentMemberId && x.RecipientId == recipientId
                && !x.SenderDeleted))
            .OrderBy(x => x.MessageSent)
            .Select(MessageExtensions.ToDtoProjection())
            .ToListAsync();

    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
