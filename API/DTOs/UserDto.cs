namespace API.DTOs;

public class UserDto
{
    public required string Username { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}