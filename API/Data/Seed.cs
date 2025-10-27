using System;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;
        var memberData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");
        var members = System.Text.Json.JsonSerializer.Deserialize<List<SeedUserDto>>(memberData);

        if (members == null)
        {
            Console.WriteLine("No member data found to seed.");
            return;
        }


        foreach (var member in members)
        {
            using var hmac = new System.Security.Cryptography.HMACSHA512();
            var user = new Entities.AppUser
            {
                Id = member.Id,
                DisplayName = member.DisplayName,
                Email = member.Email,
                ImageUrl = member.ImageUrl,
                PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes("Pa$$w0rd")),
                PasswordSalt = hmac.Key,
                Member = new Entities.Member
                {
                    Id = member.Id,
                    DateOfBirth = member.DateOfBirth,
                    Description = member.Description,
                    ImageUrl = member.ImageUrl,
                    DisplayName = member.DisplayName,
                    Created = member.Created,
                    Gender = member.Gender,
                    City = member.City,
                    Country = member.Country,
                    LastActive = member.LastActive
                }
            };
            user.Member.Photos.Add(new Entities.Photo
            {
                Url = member.ImageUrl!,
                // PublicId can be set if using a cloud service like Cloudinary
                MemberId = member.Id
            });
            context.Users.Add(user);
        }
        await context.SaveChangesAsync();
    }

}
