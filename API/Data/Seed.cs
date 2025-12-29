using System;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        if (await userManager.Users.AnyAsync())
            return;
        var memberData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");
        var members = System.Text.Json.JsonSerializer.Deserialize<List<SeedUserDto>>(memberData);

        if (members == null)
        {
            Console.WriteLine("No member data found to seed.");
            return;
        }

        foreach (var member in members)
        {
            var user = new AppUser
            {
                Id = member.Id,
                DisplayName = member.DisplayName,
                UserName = member.Email,
                Email = member.Email,
                ImageUrl = member.ImageUrl,
                Member = new Member
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
            user.Member.Photos.Add(
                new Entities.Photo
                {
                    Url = member.ImageUrl!,
                    // PublicId can be set if using a cloud service like Cloudinary
                    MemberId = member.Id
                }
            );
            var result = await userManager.CreateAsync(user, "Pa$$w0rd");
            if (!result.Succeeded)
            {
                Console.WriteLine(result.Errors.First().Description);
            }
            await userManager.AddToRoleAsync(user, "Member");
        }

        var admin = new AppUser
        {
            UserName = "admin@test.com",
            Email = "admin@test.com",
            DisplayName = "Admin User"
        };
        await userManager.CreateAsync(admin, "Pa$$w0rd");
        await userManager.AddToRolesAsync(admin, new[] { "Admin", "Moderator" });
    }
}
