using System;

namespace API.Extensions;

public static class DateTimeExtensions
{
    public static int CalculateAge(this DateOnly dob)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - dob.Year;

        // If the birthday has not occurred yet this year, subtract one from the age
        if (dob > today.AddYears(-age))
            age--;

        return age;
    }
}
